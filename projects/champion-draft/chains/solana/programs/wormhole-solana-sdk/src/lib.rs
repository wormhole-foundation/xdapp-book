pub mod context;
pub mod error;
pub mod wormhole;

use crate::{context::*, error::*, wormhole::*};
use anchor_lang::prelude::*;
use anchor_lang::solana_program::borsh::try_from_slice_unchecked;
use anchor_lang::solana_program::instruction::Instruction;
use anchor_lang::solana_program::program::invoke_signed;
use anchor_lang::solana_program::system_instruction::transfer;
use byteorder::{BigEndian, WriteBytesExt};
use sha3::Digest;
use std::io::{Cursor, Write};
use std::str::FromStr;

/// Export Core Mainnet Contract Address
#[cfg(feature = "mainnet")]
pub fn id() -> Pubkey {
    Pubkey::from_str("worm2ZoG2kUd4vFXhvjh93UUH596ayRfgQ2MgjNMTth").unwrap()
}

/// Export Core Devnet Contract Address
#[cfg(feature = "testnet")]
pub fn id() -> Pubkey {
    Pubkey::from_str("3u8hJUVTA4jH1wYAyUur7FFZVQ8H635K3tSHHF4ssjQ5").unwrap()
}

// /// Export Local Tilt Devnet Contract Address
// #[cfg(feature = "devnet")]
// pub fn id() -> Pubkey {
//     Pubkey::from_str("Bridge1p5gheXUvJ6jGWGeCsgPKgnE3YgdGKRVCMY9o").unwrap()
// }

declare_id!("HxLuvAscShj97WZqztRNzYmwoF46aLqKGvy8uv4Sf82k");

/*
    1. Post Message
    2. Post VAA
*/

#[program]
mod wormhole_solana_sdk {
    use super::*;

    /**
     * Post Message sends a payload to core bridge to emit it as a VAA to guardians.
     * It will take care of looking up and paying the fee for the transaction.
     */
    pub fn post_message<'a, 'b, 'c, 'info>(
        // ctx: CpiContext<'a, 'b, 'c, 'info, PostMessage<'info> >,
        ctx: Context<PostMessage>,
        _emitter_id: Pubkey,
        _core_bridge_address: Pubkey,
        payload: Vec<u8>,
        nonce: u32,
    ) -> Result<()> {
        //Look up fee
        let bridge_data: BridgeData =
            try_from_slice_unchecked(&ctx.accounts.wormhole_config.data.borrow_mut())?;

        //Send Fee
        invoke_signed(
            &transfer(
                &ctx.accounts.payer.key(),
                &ctx.accounts.wormhole_fee_collector.key(),
                bridge_data.config.fee,
            ),
            &[
                ctx.accounts.payer.to_account_info(),
                ctx.accounts.wormhole_fee_collector.to_account_info(),
            ],
            &[],
        )?;

        //Send Post Msg Tx
        let sendmsg_ix = Instruction {
            program_id: ctx.accounts.core_bridge.key(),
            accounts: vec![
                AccountMeta::new(ctx.accounts.wormhole_config.key(), false),
                AccountMeta::new(ctx.accounts.wormhole_message_key.key(), true),
                AccountMeta::new_readonly(ctx.accounts.emitter_account.key(), true),
                AccountMeta::new(ctx.accounts.wormhole_sequence.key(), false),
                AccountMeta::new(ctx.accounts.payer.key(), true),
                AccountMeta::new(ctx.accounts.wormhole_fee_collector.key(), false),
                AccountMeta::new_readonly(ctx.accounts.clock.key(), false),
                AccountMeta::new_readonly(ctx.accounts.rent.key(), false),
                AccountMeta::new_readonly(ctx.accounts.system_program.key(), false),
            ],
            data: (
                wormhole::Instruction::PostMessage,
                wormhole::PostMessageData {
                    nonce: nonce,
                    payload: payload,
                    consistency_level: wormhole::ConsistencyLevel::Confirmed,
                },
            )
                .try_to_vec()?,
        };
        msg!("Invoking signed");
        invoke_signed(
            &sendmsg_ix,
            &[
                ctx.accounts.wormhole_config.to_account_info(),
                ctx.accounts.wormhole_message_key.to_account_info(),
                ctx.accounts.emitter_account.to_account_info(),
                ctx.accounts.wormhole_sequence.to_account_info(),
                ctx.accounts.payer.to_account_info(),
                ctx.accounts.wormhole_fee_collector.to_account_info(),
                ctx.accounts.clock.to_account_info(),
                ctx.accounts.rent.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
            &[&[b"emitter".as_ref(), &[*ctx.bumps.get("emitter_account").unwrap()]]],
        )?;

        Ok(())
    }
}

/**
 * There's a couple steps to ensure we're getting a valid VAA. First, it must be owned by Core Bridge (we check this in Context account constraint logic.
 * Because it's owned by the Core Bridge, we know that it's passed signature verification.
 * Next, we have to check that payload of the VAA hasn't been changed, so we check that it's hash is used to derive it's key.
 * Finally we check that the messsage comes from the emitter chain and emitter contract that we were expecting.
 */
pub fn confirm_msg<'a, 'b, 'c, 'info>(
    ctx: CpiContext<'a, 'b, 'c, 'info, ConfirmMessage<'info>>,
    emitter_chain: u16,
    emitter_address: [u8; 32],
) -> Result<()> {
    //Hash a VAA Extract and derive a VAA Key
    let vaa = PostedMessageData::try_from_slice(&ctx.accounts.core_bridge_vaa.data.borrow())?.0;
    let serialized_vaa = serialize_vaa(&vaa);

    let mut h = sha3::Keccak256::default();
    h.write(serialized_vaa.as_slice()).unwrap();
    let vaa_hash: [u8; 32] = h.finalize().into();

    let (vaa_key, _) = Pubkey::find_program_address(&[b"PostedVAA", &vaa_hash], &id());

    if ctx.accounts.core_bridge_vaa.key() != vaa_key {
        return err!(CoreBridgeError::VAAKeyMismatch);
    }

    // Already checked that the SignedVaa is owned by core bridge in account constraint logic
    //Check that the emitter chain and address match up with the vaa
    if vaa.emitter_chain != emitter_chain || vaa.emitter_address != emitter_address {
        return err!(CoreBridgeError::VAAEmitterMismatch);
    }

    Ok(())
}

// Convert a full VAA structure into the serialization of its unique components, this structure is
// what is hashed and verified by Guardians.
pub fn serialize_vaa(vaa: &MessageData) -> Vec<u8> {
    let mut v = Cursor::new(Vec::new());
    v.write_u32::<BigEndian>(vaa.vaa_time).unwrap();
    v.write_u32::<BigEndian>(vaa.nonce).unwrap();
    v.write_u16::<BigEndian>(vaa.emitter_chain.clone() as u16)
        .unwrap();
    v.write(&vaa.emitter_address).unwrap();
    v.write_u64::<BigEndian>(vaa.sequence).unwrap();
    v.write_u8(vaa.consistency_level).unwrap();
    v.write(&vaa.payload).unwrap();
    v.into_inner()
}
