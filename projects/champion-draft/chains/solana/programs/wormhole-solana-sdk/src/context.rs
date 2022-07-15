use anchor_lang::prelude::*;
use anchor_lang::solana_program::sysvar::{rent, clock};

#[derive(Accounts)]
#[instruction(_emitter_id:Pubkey, _core_bridge_address:Pubkey, payload:Vec<u8>, nonce:u32)]
pub struct PostMessage<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    //Random account we use to store the message in. Can be reused.
    #[account(mut)]
    pub wormhole_message_key: Signer<'info>,

    //Emitter account is a PDA of the calling contract, NOT of Core Bridge (or sdk).
    #[account(
        seeds = [
            b"emitter".as_ref(),
        ],
        bump,
        mut,
        seeds::program = _emitter_id
    )]
    /// CHECK: If someone passes in the wrong account, Guardians won't read the message
    pub emitter_account: AccountInfo<'info>,

    //Core Bridge Accounts
    #[account(
        constraint = core_bridge.key() == _core_bridge_address
    )]
    /// CHECK: If someone passes in the wrong account, Guardians won't read the message
    pub core_bridge: AccountInfo<'info>,
    #[account(
        seeds = [
            b"Bridge".as_ref()
        ],
        bump,
        seeds::program = _core_bridge_address,
        mut
    )]
    /// CHECK: If someone passes in the wrong account, Guardians won't read the message
    pub wormhole_config: AccountInfo<'info>,
    #[account(
        seeds = [
            b"fee_collector".as_ref()
        ],
        bump,
        seeds::program = _core_bridge_address,
        mut
    )]
    /// CHECK: If someone passes in the wrong account, Guardians won't read the message
    pub wormhole_fee_collector: AccountInfo<'info>,
    #[account(
        seeds = [
            b"Sequence".as_ref(),
            emitter_account.key().to_bytes().as_ref()
        ],
        bump,
        seeds::program = _core_bridge_address,
        mut
    )]
    /// CHECK: If someone passes in the wrong account, Guardians won't read the message
    pub wormhole_sequence: AccountInfo<'info>,

    //Dependencies
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
}

#[derive(Accounts)]
#[instruction()]
pub struct ConfirmMessage<'info>{
    /// This requires some fancy hashing, so confirm it's derived address in the function itself.
    #[account(
        constraint = core_bridge_vaa.to_account_info().owner == &crate::ID
    )]
    /// CHECK: This account is owned by Core Bridge so we trust it
    pub core_bridge_vaa: AccountInfo<'info>,
}
