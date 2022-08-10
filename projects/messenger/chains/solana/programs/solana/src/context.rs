use anchor_lang::prelude::*;
use crate::constant::*;
use crate::account::*;
use std::str::FromStr;
use anchor_lang::solana_program::sysvar::{rent, clock};
use crate::wormhole::*;
use hex::decode;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        seeds=[b"config".as_ref()],
        payer=owner,
        bump,
        space=8+32+32+1024
    )]
    pub config: Account<'info, Config>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
#[instruction(chain_id:u16, emitter_addr:String)]
pub struct RegisterChain<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
    #[account(
        constraint = config.owner == owner.key()
    )]
    pub config: Account<'info, Config>,
    #[account(
        init,
        seeds=[b"EmitterAddress".as_ref(), chain_id.to_be_bytes().as_ref()],
        payer=owner,
        bump,
        space=8+2+256
    )]
    pub emitter_acc: Account<'info, EmitterAddrAccount>,
}

#[derive(Accounts)]
pub struct SendMsg<'info>{
    #[account(
        constraint = core_bridge.key() == Pubkey::from_str(CORE_BRIDGE_ADDRESS).unwrap()
    )]
    /// CHECK: If someone passes in the wrong account, Guardians won't read the message
    pub core_bridge: AccountInfo<'info>,
    #[account(
        seeds = [
            b"Bridge".as_ref()
        ],
        bump,
        seeds::program = Pubkey::from_str(CORE_BRIDGE_ADDRESS).unwrap(),
        mut
    )]
    /// CHECK: If someone passes in the wrong account, Guardians won't read the message
    pub wormhole_config: AccountInfo<'info>,
    #[account(
        seeds = [
            b"fee_collector".as_ref()
        ],
        bump,
        seeds::program = Pubkey::from_str(CORE_BRIDGE_ADDRESS).unwrap(),
        mut
    )]
    /// CHECK: If someone passes in the wrong account, Guardians won't read the message
    pub wormhole_fee_collector: AccountInfo<'info>,
    #[account(
        seeds = [
            b"emitter".as_ref(),
        ],
        bump,
        mut
    )]
    /// CHECK: If someone passes in the wrong account, Guardians won't read the message
    pub wormhole_derived_emitter: AccountInfo<'info>,
    #[account(
        seeds = [
            b"Sequence".as_ref(),
            wormhole_derived_emitter.key().to_bytes().as_ref()
        ],
        bump,
        seeds::program = Pubkey::from_str(CORE_BRIDGE_ADDRESS).unwrap(),
        mut
    )]
    /// CHECK: If someone passes in the wrong account, Guardians won't read the message
    pub wormhole_sequence: AccountInfo<'info>,
    #[account(mut)]
    pub wormhole_message_key: Signer<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
    #[account(
        constraint = clock.key() == clock::id()
    )]
    /// CHECK: The account constraint will make sure it's the right clock var
    pub clock: AccountInfo<'info>,
    #[account(
        constraint = rent.key() == rent::id()
    )]
    /// CHECK: The account constraint will make sure it's the right rent var
    pub rent: AccountInfo<'info>,
    #[account(mut)]
    pub config: Account<'info, Config>,
}

#[derive(Accounts)]
#[instruction()]
pub struct ConfirmMsg<'info>{
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
    #[account(
        init,
        seeds=[
            &decode(&emitter_acc.emitter_addr.as_str()).unwrap()[..],
            emitter_acc.chain_id.to_be_bytes().as_ref(),
            (PostedMessageData::try_from_slice(&core_bridge_vaa.data.borrow())?.0).sequence.to_be_bytes().as_ref()
        ],
        payer=payer,
        bump,
        space=8
    )]
    pub processed_vaa: Account<'info, ProcessedVAA>,
    pub emitter_acc: Account<'info, EmitterAddrAccount>,
    /// This requires some fancy hashing, so confirm it's derived address in the function itself.
    #[account(
        constraint = core_bridge_vaa.to_account_info().owner == &Pubkey::from_str(CORE_BRIDGE_ADDRESS).unwrap()
    )]
    /// CHECK: This account is owned by Core Bridge so we trust it
    pub core_bridge_vaa: AccountInfo<'info>,
    #[account(mut)]
    pub config: Account<'info, Config>,
}

#[derive(Accounts)]
pub struct Debug<'info>{
    #[account(
        constraint = core_bridge_vaa.to_account_info().owner == &Pubkey::from_str(CORE_BRIDGE_ADDRESS).unwrap()
    )]
    /// CHECK: This account is owned by Core Bridge so we trust it
    pub core_bridge_vaa: AccountInfo<'info>,
}