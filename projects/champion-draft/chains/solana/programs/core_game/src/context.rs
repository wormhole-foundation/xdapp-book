use std::str::FromStr;
use crate::data::*;
use crate::constants::CORE_BRIDGE_ADDRESS;

use anchor_lang::prelude::*;

#[error_code]
pub enum ChampionDraftError {
    #[msg("Attempted to register an NFT that the signer does not own as a champion")]
    NotOwnerOfNft,
}

#[derive(Accounts)]
pub struct RegisterNft<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    /// the account that will store the champion's stats
    #[account(
        init,
        payer = owner,
        space = 8 + 32 + std::mem::size_of::<Champion>(),
        seeds = [ b"champion", owner.key().as_ref() ],
        bump
    )]
    pub champion_account: Account<'info, ChampionAccount>,

    /// once wormhole emits a VAA, it will be written back to this account so we have access to it
    #[account(mut)]
    pub wormhole_message_account: Signer<'info>,

    // TODO: make this instruction take a token account as an argument so we can use the user's NFT
    // /// the token account that houses the user's NFT
    // #[account(constraint = token_account.owner == owner.key() @ ChampionDraftError::NotOwnerOfNft )]
    // pub token_account: Account<'info, TokenAccount>,
    
    pub system_program: Program<'info, System>,

    // These are system accounts
    /// CHECK: checked by callee
    pub clock: AccountInfo<'info>,
    /// CHECK: checked by callee
    pub rent: AccountInfo<'info>,

    // The rest of these accounts are checked by the callee (wormhole core bridge) so we don't need
    // constraints.
    
    /// CHECK: checked by callee
    #[account(
        seeds = [
            b"emitter".as_ref(),
        ],
        bump,
        mut
    )]
    pub emitter_account: AccountInfo<'info>,
    /// CHECK: checked by callee
    pub core_bridge: AccountInfo<'info>,
    /// CHECK: checked by callee
    #[account(mut)]
    pub wormhole_config: AccountInfo<'info>,
    /// CHECK: checked by callee
    #[account(mut)]
    pub wormhole_fee_collector: AccountInfo<'info>,
    /// CHECK: checked by callee
    #[account(mut)]
    pub wormhole_sequence: AccountInfo<'info>,
}

#[derive(Accounts)]
#[instruction(emitter_addr: String, chain_id: u16)]
pub struct CrossChainBattle<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
    /// the account that corresponds to the local champion. This champion was originally
    /// registered on this chain, whereas the vaa champion could have been registered on this chain
    /// or another chain
    pub local_champion_account: Account<'info, ChampionAccount>,

    /// This requires some fancy hashing, so confirm it's derived address in the function itself.
    #[account(
        constraint = core_bridge_vaa.to_account_info().owner == &Pubkey::from_str(CORE_BRIDGE_ADDRESS).unwrap()
    )]
    /// CHECK: This account is owned by Core Bridge so we trust it
    pub core_bridge_vaa: AccountInfo<'info>,
}


