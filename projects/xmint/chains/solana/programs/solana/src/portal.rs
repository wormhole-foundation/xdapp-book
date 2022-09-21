use anchor_lang::prelude::*;
use primitive_types::U256;
use anchor_lang::solana_program::{
    program_error::ProgramError::InvalidAccountData,
    pubkey::Pubkey,
};
use std::{
    io::{
        Cursor,
        Read,
        Write,
    },
    ops::Deref,
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
    pub token_address: Address,
    /// Chain ID of the token
    pub token_chain: ChainID,
    /// Address of the recipient. Left-zero-padded if shorter than 32 bytes
    pub to: Address,
    /// Chain ID of the recipient
    pub to_chain: ChainID,
    /// Amount of tokens (big-endian uint256) that the user is willing to pay as relayer fee. Must be <= Amount.
    pub fee: U256,
}

impl DeserializePayload for PayloadTransfer {
    fn deserialize(buf: &mut &[u8]) -> Result<Self> {
        let mut v = Cursor::new(buf);

        if v.read_u8()? != 1 {
            return Err(SolitaireError::Custom(0));
        };

        let mut am_data: [u8; 32] = [0; 32];
        v.read_exact(&mut am_data)?;
        let amount = U256::from_big_endian(&am_data);

        let mut token_address = Address::default();
        v.read_exact(&mut token_address)?;

        let token_chain = v.read_u16::<BigEndian>()?;

        let mut to = Address::default();
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
    fn serialize<W: Write>(&self, writer: &mut W) -> Result<(), SolitaireError> {
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


#[error_code]
pub enum PortalError {
    #[msg("")]
}