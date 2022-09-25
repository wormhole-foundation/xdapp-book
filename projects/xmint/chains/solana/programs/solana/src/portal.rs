use anchor_lang::prelude::*;
use primitive_types::U256;
use anchor_lang::solana_program::{
    program_error::ProgramError::InvalidAccountData,
};

use byteorder::{
    BigEndian,
    ReadBytesExt,
    WriteBytesExt,
};
use std::{
    cmp,
    io::{
        Cursor,
        Read,
        Write,
    },
};

pub trait SerializePayload: Sized {
    fn serialize<W: Write>(&self, writer: &mut W) -> std::result::Result<(), Error>;

    fn try_to_vec(&self) -> std::result::Result<Vec<u8>, Error> {
        let mut result = Vec::with_capacity(256);
        self.serialize(&mut result)?;
        Ok(result)
    }
}

pub trait DeserializePayload: Sized {
    fn deserialize(buf: &mut &[u8]) -> std::result::Result<Self, Error>;
}


#[derive(AnchorDeserialize, AnchorSerialize)]
pub enum Instruction{
    Initialize,
    AttestToken,
    CompleteNative,
    CompleteWrapped,
    TransferWrapped,
    TransferNative,
    RegisterChain,
    CreateWrapped,
    UpgradeContract,
    CompleteNativeWithPayload,
    CompleteWrappedWithPayload,
    TransferWrappedWithPayload,
    TransferNativeWithPayload,
}

#[derive(PartialEq, Debug, Clone)]
pub struct PayloadTransfer {
    /// Amount being transferred (big-endian uint256)
    pub amount: U256,
    /// Address of the token. Left-zero-padded if shorter than 32 bytes
    pub token_address: [u8; 32],
    /// Chain ID of the token
    pub token_chain: u16,
    /// Address of the recipient. Left-zero-padded if shorter than 32 bytes
    pub to: [u8; 32],
    /// Chain ID of the recipient
    pub to_chain: u16,
    /// Amount of tokens (big-endian uint256) that the user is willing to pay as relayer fee. Must be <= Amount.
    pub fee: U256,
}

impl DeserializePayload for PayloadTransfer {
    fn deserialize(buf: &mut &[u8]) -> Result<Self> {
        let mut v = Cursor::new(buf);

        if v.read_u8()? != 1 {
            return err!(PortalError::CustomZeroError);
        };

        let mut am_data: [u8; 32] = [0; 32];
        v.read_exact(&mut am_data)?;
        let amount = U256::from_big_endian(&am_data);

        let mut token_address = [0; 32];
        v.read_exact(&mut token_address)?;

        let token_chain = v.read_u16::<BigEndian>()?;

        let mut to = [0; 32];
        v.read_exact(&mut to)?;

        let to_chain = v.read_u16::<BigEndian>()?;

        let mut fee_data: [u8; 32] = [0; 32];
        v.read_exact(&mut fee_data)?;
        let fee = U256::from_big_endian(&fee_data);

        if v.position() != v.into_inner().len() as u64 {
            return Err(InvalidAccountData.into());
        }

        Ok(PayloadTransfer {
            amount,
            token_address,
            token_chain,
            to,
            to_chain,
            fee,
        })
    }
}

impl SerializePayload for PayloadTransfer {
    fn serialize<W: Write>(&self, writer: &mut W) -> Result<()> {
        // Payload ID
        writer.write_u8(1)?;

        let mut am_data: [u8; 32] = [0; 32];
        self.amount.to_big_endian(&mut am_data);
        writer.write_all(&am_data)?;

        writer.write_all(&self.token_address)?;
        writer.write_u16::<BigEndian>(self.token_chain)?;
        writer.write_all(&self.to)?;
        writer.write_u16::<BigEndian>(self.to_chain)?;

        let mut fee_data: [u8; 32] = [0; 32];
        self.fee.to_big_endian(&mut fee_data);
        writer.write_all(&fee_data)?;

        Ok(())
    }
}


#[derive(PartialEq, Debug, Clone)]
pub struct PayloadTransferWithPayload {
    /// Amount being transferred (big-endian uint256)
    pub amount: U256,
    /// Address of the token. Left-zero-padded if shorter than 32 bytes
    pub token_address: [u8; 32],
    /// Chain ID of the token
    pub token_chain: u16,
    /// Address of the recipient. Left-zero-padded if shorter than 32 bytes
    pub to: [u8; 32],
    /// Chain ID of the recipient
    pub to_chain: u16,
    /// Sender of the transaction
    pub from_address: [u8; 32],
    /// Arbitrary payload
    pub payload: Vec<u8>,
}

impl DeserializePayload for PayloadTransferWithPayload {
    fn deserialize(buf: &mut &[u8]) -> Result<Self> {
        let mut v = Cursor::new(buf);

        if v.read_u8()? != 3 {
            return err!(PortalError::CustomZeroError);
        };

        let mut am_data: [u8; 32] = [0; 32];
        v.read_exact(&mut am_data)?;
        let amount = U256::from_big_endian(&am_data);

        let mut token_address = [0; 32];
        v.read_exact(&mut token_address)?;

        let token_chain = v.read_u16::<BigEndian>()?;

        let mut to = [0; 32];
        v.read_exact(&mut to)?;

        let to_chain = v.read_u16::<BigEndian>()?;

        let mut from_address = [0; 32];
        v.read_exact(&mut from_address)?;

        let mut payload = vec![];
        v.read_to_end(&mut payload)?;

        Ok(PayloadTransferWithPayload {
            amount,
            token_address,
            token_chain,
            to,
            to_chain,
            from_address,
            payload,
        })
    }
}

impl SerializePayload for PayloadTransferWithPayload {
    fn serialize<W: Write>(&self, writer: &mut W) -> Result<()> {
        // Payload ID
        writer.write_u8(3)?;

        let mut am_data: [u8; 32] = [0; 32];
        self.amount.to_big_endian(&mut am_data);
        writer.write_all(&am_data)?;

        writer.write_all(&self.token_address)?;
        writer.write_u16::<BigEndian>(self.token_chain)?;
        writer.write_all(&self.to)?;
        writer.write_u16::<BigEndian>(self.to_chain)?;

        writer.write_all(&self.from_address)?;

        writer.write_all(self.payload.as_slice())?;

        Ok(())
    }
}

#[derive(PartialEq, Debug)]
pub struct PayloadAssetMeta {
    /// Address of the token. Left-zero-padded if shorter than 32 bytes
    pub token_address: [u8; 32],
    /// Chain ID of the token
    pub token_chain: u16,
    /// Number of decimals of the token
    pub decimals: u8,
    /// Symbol of the token
    pub symbol: String,
    /// Name of the token
    pub name: String,
}

impl DeserializePayload for PayloadAssetMeta {
    fn deserialize(buf: &mut &[u8]) -> Result<Self> {
        use bstr::ByteSlice;

        let mut v = Cursor::new(buf);

        if v.read_u8()? != 2 {
            return err!(PortalError::CustomZeroError);
        };

        let mut token_address = [0; 32];
        v.read_exact(&mut token_address)?;

        let token_chain = v.read_u16::<BigEndian>()?;
        let decimals = v.read_u8()?;

        let mut symbol_data = vec![0u8; 32];
        v.read_exact(&mut symbol_data)?;
        symbol_data.retain(|&c| c != 0);
        let mut symbol: Vec<char> = symbol_data.chars().collect();
        symbol.retain(|&c| c != '\u{FFFD}');
        let symbol: String = symbol.iter().collect();

        let mut name_data = vec![0u8; 32];
        v.read_exact(&mut name_data)?;
        name_data.retain(|&c| c != 0);
        let mut name: Vec<char> = name_data.chars().collect();
        name.retain(|&c| c != '\u{FFFD}');
        let name: String = name.iter().collect();

        if v.position() != v.into_inner().len() as u64 {
            return Err(InvalidAccountData.into());
        }

        Ok(PayloadAssetMeta {
            token_address,
            token_chain,
            decimals,
            symbol,
            name,
        })
    }
}

impl SerializePayload for PayloadAssetMeta {
    fn serialize<W: Write>(&self, writer: &mut W) -> Result<()> {
        // Payload ID
        writer.write_u8(2)?;

        writer.write_all(&self.token_address)?;
        writer.write_u16::<BigEndian>(self.token_chain)?;

        writer.write_u8(self.decimals)?;

        let mut symbol: [u8; 32] = [0; 32];
        let count = cmp::min(symbol.len(), self.symbol.len());
        symbol[..count].copy_from_slice(self.symbol[..count].as_bytes());

        writer.write_all(&symbol)?;

        let mut name: [u8; 32] = [0; 32];
        let count = cmp::min(name.len(), self.name.len());
        name[..count].copy_from_slice(self.name[..count].as_bytes());

        writer.write_all(&name)?;

        Ok(())
    }
}

#[error_code]
pub enum PortalError {
    #[msg("Solitare Custom(0)")]
    CustomZeroError,
}

#[derive(AnchorDeserialize, AnchorSerialize, Default)]
pub struct TransferWrappedData {
    pub nonce: u32,
    pub amount: u64,
    pub fee: u64,
    pub target_address: [u8; 32],
    pub target_chain: u16,
}

#[derive(AnchorDeserialize, AnchorSerialize, Default)]
pub struct TransferNativeData {
    pub nonce: u32,
    pub amount: u64,
    pub fee: u64,
    pub target_address: [u8; 32],
    pub target_chain: u16,
}