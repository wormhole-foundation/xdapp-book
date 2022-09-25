use anchor_lang::prelude::*;
use mpl_token_metadata::instruction::create_metadata_accounts_v3;
use mpl_token_metadata::ID as metadata_program_id;
use anchor_lang::solana_program::program::invoke_signed;
use anchor_lang::solana_program::instruction::{Instruction, AccountMeta};
use anchor_lang::solana_program::{sysvar::rent, system_program};
use anchor_spl::token::{ID as spl_id, mint_to, approve, MintTo, Approve};

use sha3::Digest;
use byteorder::{
    BigEndian,
    WriteBytesExt,
};
use std::io::{
    Cursor,
    Write,
};
use std::str::FromStr;

mod account;
mod context;
mod constant;
mod error;
mod event;
mod portal;
mod wormhole;

use account::*;
use context::*;
use wormhole::*;
use portal::*;
use error::*;
use constant::*;

declare_id!("BHz6MJGvo8PJaBFqaxyzgJYdY6o8h1rBgsRrUmnHCU9k");

#[program]
pub mod solana {

    use super::*;

    pub fn initialize(ctx: Context<Initialize>, name: String, symbol:String, uri: String) -> Result<()> {
        ctx.accounts.config.owner = ctx.accounts.owner.key();
        ctx.accounts.config.nonce = 0;
        ctx.accounts.mint_authority.mint = ctx.accounts.mint.key();

        // Create Metadata Accounts for SPL Token
        let ix = &create_metadata_accounts_v3(
            metadata_program_id, 
            ctx.accounts.metadata_account.key(), 
            ctx.accounts.mint.key(), 
            ctx.accounts.mint_authority.key(), 
            ctx.accounts.owner.key(), 
            ctx.accounts.mint_authority.key(), 
            name, 
            symbol, 
            uri, 
            None, 
            0, 
            true, 
            true, 
            None, 
            None, 
            None
        );

        let accounts = vec![
            ctx.accounts.metadata_program.to_account_info(),
            ctx.accounts.metadata_account.to_account_info(),
            ctx.accounts.mint.to_account_info(),
            ctx.accounts.mint_authority.to_account_info(),
            ctx.accounts.owner.to_account_info(),
            ctx.accounts.mint_authority.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.rent.to_account_info()
        ];
        
        let seeds:&[&[u8]] = &[
            b"mint_authority",
            &[*ctx.bumps.get("mint_authority").unwrap()]
        ];
        
        invoke_signed(
            ix,
            accounts.as_slice(),
            &[&seeds[..]]
        )?;

        Ok(())
    }

    //Register Application Contracts
    pub fn register_chain(ctx:Context<RegisterChain>, chain_id:u16, emitter_addr:Vec<u8>) -> Result<()> {
        ctx.accounts.emitter_acc.emitter_chain = chain_id;
        ctx.accounts.emitter_acc.emitter_address = emitter_addr.as_slice().try_into().unwrap();
        Ok(())
    }

    pub fn submit_foreign_purchase(ctx:Context<SubmitForeignPurchase>) -> Result<()> {
        // Fetch the VAA
        //Hash a VAA Extract and derive a VAA Key
        let vaa = PostedMessageData::try_from_slice(&ctx.accounts.core_bridge_vaa.data.borrow())?.0;
        let vaa_hash: [u8; 32] = vaa_hash(ctx.accounts.core_bridge_vaa.clone());

        let (vaa_key, _) = Pubkey::find_program_address(&[
            b"PostedVAA",
            &vaa_hash
        ], &Pubkey::from_str(CORE_BRIDGE_ADDRESS).unwrap());

        if ctx.accounts.core_bridge_vaa.key() != vaa_key {
            return err!(XmintError::VAAKeyMismatch);
        }

        // Already checked that the SignedVaa is owned by core bridge in account constraint logic
        //Check that the emitter chain and address match up with the vaa
        // This VAA will be from Portal Token Bridge so use the Emitter Portal Addr
        let emitter: EmitterAddrAccount = EmitterAddrAccount::try_from_slice(&ctx.accounts.emitter_acc.data.borrow()).unwrap(); 
        if vaa.emitter_chain != emitter.emitter_chain ||
           vaa.emitter_address != emitter.emitter_address {
            return err!(XmintError::VAAEmitterMismatch)
        }        



        // Complete Transfer of P3 on Portal
        let complete_wrapped_ix = Instruction {
            program_id: Pubkey::from_str(TOKEN_BRIDGE_ADDRESS).unwrap(),
            accounts: vec![
                AccountMeta::new(ctx.accounts.payer.key(), true),
                AccountMeta::new_readonly(ctx.accounts.token_bridge_config.key(), false),
                AccountMeta::new_readonly(ctx.accounts.core_bridge_vaa.key(), false),
                AccountMeta::new(ctx.accounts.token_bridge_claim_key.key(), false),
                AccountMeta::new_readonly(ctx.accounts.emitter_acc.key(), false),
                AccountMeta::new(ctx.accounts.weth_ata_account.key(), false), // to
                AccountMeta::new_readonly(ctx.accounts.redeemer.key(), true), // to owner
                AccountMeta::new(ctx.accounts.fee_recipient.key(), false),
                AccountMeta::new(ctx.accounts.weth_mint.key(), false),
                AccountMeta::new_readonly(ctx.accounts.weth_mint_wrapped_meta.key(), false),
                AccountMeta::new_readonly(ctx.accounts.mint_authority_wrapped.key(), false),
                AccountMeta::new_readonly(rent::id(), false),
                AccountMeta::new_readonly(system_program::id(), false),
                AccountMeta::new_readonly(ctx.accounts.core_bridge.key(), false),
                AccountMeta::new_readonly(spl_id, false),
            ],
            data: (
                crate::portal::Instruction::CompleteWrappedWithPayload,
                {}
            ).try_to_vec()?
        };

        let accounts = vec![
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.token_bridge_config.to_account_info(),
            ctx.accounts.core_bridge_vaa.to_account_info(),
            ctx.accounts.token_bridge_claim_key.to_account_info(),
            ctx.accounts.emitter_acc.to_account_info(),
            ctx.accounts.weth_ata_account.to_account_info(), //to
            ctx.accounts.redeemer.to_account_info(), // to_owner
            ctx.accounts.fee_recipient.to_account_info(),
            ctx.accounts.weth_mint.to_account_info(),
            ctx.accounts.weth_mint_wrapped_meta.to_account_info(),
            ctx.accounts.mint_authority_wrapped.to_account_info(),
            ctx.accounts.rent_account.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.core_bridge.to_account_info(),
            ctx.accounts.spl_program.to_account_info()
        ];

        let complete_p3_seeds:&[&[u8]] = &[
            b"redeemer",
            &[*ctx.bumps.get("redeemer").unwrap()]
        ];

        invoke_signed(
            &complete_wrapped_ix,
            &accounts,
            &[&complete_p3_seeds[..]]
        )?;

        //// Figure out how many tokens to mint based on p3 payload
        let payload: PayloadTransferWithPayload = PayloadTransferWithPayload::deserialize(&mut vaa.payload.as_slice())?;
        ctx.accounts.receipt.amt_to_mint = payload.amount.as_u64() * 100;
        ctx.accounts.receipt.foreign_chain = vaa.emitter_chain;
        ctx.accounts.receipt.foreign_receipient = payload.payload.as_slice().try_into().unwrap();
        ctx.accounts.receipt.claimed = false;

        Ok(())
    }

    pub fn claim_foreign_purchase(ctx:Context<ClaimForeignPurchase>) -> Result<()> {
        if ctx.accounts.receipt.claimed {
            return err!(XmintError::ReceiptClaimed);
        }

        let mint_seeds:&[&[u8]] = &[
            b"mint_authority",
            &[*ctx.bumps.get("xmint_authority").unwrap()]
        ];

        mint_to(
            CpiContext { 
                accounts: MintTo {
                    mint: ctx.accounts.xmint_token_mint.to_account_info(),
                    authority: ctx.accounts.xmint_authority.to_account_info(),
                    to: ctx.accounts.xmint_ata_account.to_account_info(),
                }, 
                remaining_accounts: vec![], 
                program: ctx.accounts.spl_program.to_account_info(), 
                signer_seeds: &[&mint_seeds[..]]
            },
            ctx.accounts.receipt.amt_to_mint
        )?;

        // Delgate transfer authority to Token Bridge for the newly minted tokens
        approve(
            CpiContext::new_with_signer(
                ctx.accounts.spl_program.to_account_info(), 
                Approve { 
                    to: ctx.accounts.xmint_ata_account.to_account_info(), 
                    delegate: ctx.accounts.token_bridge_authority_signer.to_account_info(), 
                    authority: ctx.accounts.xmint_authority.to_account_info() 
                }, 
                &[&mint_seeds[..]]
            ),
            ctx.accounts.receipt.amt_to_mint
        )?;

        // Transfer tokens from Contract PDA to P1 on Portal
        // Instruction
        let transfer_ix = Instruction {
            program_id: Pubkey::from_str(TOKEN_BRIDGE_ADDRESS).unwrap(),
            accounts: vec![
                AccountMeta::new(ctx.accounts.payer.key(), true),
                AccountMeta::new_readonly(ctx.accounts.token_bridge_config.key(), false),
                AccountMeta::new(ctx.accounts.xmint_ata_account.key(), false),
                AccountMeta::new(ctx.accounts.xmint_token_mint.key(), false),
                AccountMeta::new(ctx.accounts.token_bridge_mint_custody.key(), false),
                AccountMeta::new_readonly(ctx.accounts.token_bridge_authority_signer.key(), false),
                AccountMeta::new_readonly(ctx.accounts.token_bridge_custody_signer.key(), false),
                AccountMeta::new(ctx.accounts.core_bridge_config.key(), false),
                AccountMeta::new(ctx.accounts.xmint_transfer_msg_key.key(), true),
                AccountMeta::new_readonly(ctx.accounts.token_bridge_emitter.key(), false),
                AccountMeta::new(ctx.accounts.token_bridge_sequence_key.key(), false),
                AccountMeta::new(ctx.accounts.core_bridge_fee_collector.key(), false),
                AccountMeta::new_readonly(ctx.accounts.clock.key(), false),
                // Dependencies
                AccountMeta::new_readonly(ctx.accounts.rent_account.key(), false),
                AccountMeta::new_readonly(ctx.accounts.system_program.key(), false),
                // Program
                AccountMeta::new_readonly(ctx.accounts.core_bridge.key(), false),
                AccountMeta::new_readonly(ctx.accounts.spl_program.key(), false),
            ],
            data: (
                crate::portal::Instruction::TransferNative,
                TransferNativeData {
                    nonce: ctx.accounts.config.nonce,
                    amount: ctx.accounts.receipt.amt_to_mint,
                    fee: 0,
                    target_address: ctx.accounts.receipt.foreign_receipient,
                    target_chain: ctx.accounts.receipt.foreign_chain
                }
            ).try_to_vec()?
        };

        // Accounts
        let transfer_accs = vec![
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.token_bridge_config.to_account_info(),
            ctx.accounts.xmint_ata_account.to_account_info(),
            ctx.accounts.xmint_token_mint.to_account_info(),
            ctx.accounts.token_bridge_mint_custody.to_account_info(),
            ctx.accounts.token_bridge_authority_signer.to_account_info(),
            ctx.accounts.token_bridge_custody_signer.to_account_info(),
            ctx.accounts.core_bridge_config.to_account_info(),
            ctx.accounts.xmint_transfer_msg_key.to_account_info(),
            ctx.accounts.token_bridge_emitter.to_account_info(),
            ctx.accounts.token_bridge_sequence_key.to_account_info(),
            ctx.accounts.core_bridge_fee_collector.to_account_info(),
            ctx.accounts.clock.to_account_info(),
            // Dependencies
            ctx.accounts.rent_account.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            // Program
            ctx.accounts.core_bridge.to_account_info(),
            ctx.accounts.spl_program.to_account_info(),        
        ];

        // Signer Seeds
        let xmint_authority_seeds:&[&[u8]] = &[
            b"mint_authority",
            &[*ctx.bumps.get("xmint_authority").unwrap()]
        ];

        invoke_signed(
            &transfer_ix, 
            &transfer_accs,
            &[&xmint_authority_seeds[..]]
        )?;

        ctx.accounts.config.nonce += 1;
        ctx.accounts.receipt.claimed = true;
        Ok(())
    }

}

// Convert a full VAA structure into the serialization of its unique components, this structure is
// what is hashed and verified by Guardians.
pub fn serialize_vaa(vaa: &MessageData) -> Vec<u8> {
    let mut v = Cursor::new(Vec::new());
    v.write_u32::<BigEndian>(vaa.vaa_time).unwrap();
    v.write_u32::<BigEndian>(vaa.nonce).unwrap();
    v.write_u16::<BigEndian>(vaa.emitter_chain.clone() as u16).unwrap();
    v.write(&vaa.emitter_address).unwrap();
    v.write_u64::<BigEndian>(vaa.sequence).unwrap();
    v.write_u8(vaa.consistency_level).unwrap();
    v.write(&vaa.payload).unwrap();
    v.into_inner()
}

pub fn vaa_hash(vaa: AccountInfo) -> [u8; 32] {
    let vaa = PostedMessageData::try_from_slice(&vaa.data.borrow()).unwrap().0;
    let serialized_vaa = serialize_vaa(&vaa);
    let mut h = sha3::Keccak256::default();
    h.write(serialized_vaa.as_slice()).unwrap();
    let vaa_hash: [u8; 32] = h.finalize().into();
    return vaa_hash;
}
