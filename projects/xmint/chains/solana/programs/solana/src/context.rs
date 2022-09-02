use anchor_lang::prelude::*;
use crate::account::*;
use anchor_spl::token::{Mint};
use mpl_token_metadata::ID as metadata_program_id;

#[derive(Accounts)]
pub struct Initialize<'info>{
    #[account(
        init,
        seeds=[b"config"],
        payer=owner,
        bump,
        space=8+32+8+1
    )]
    pub config: Account<'info, Config>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub mint: Account<'info, Mint>,

    //Accounts for Metadata
    #[account(
        init,
        seeds=[b"mint_authority"],
        bump,
        payer=owner,
        space=8+32
    )]
    pub mint_authority: Account<'info, MintInfo>,
    pub rent: Sysvar<'info, Rent>,
    /// CHECK: This account is initalized by the metadata program
    #[account(
        mut,
        seeds = [
            b"metadata",
            metadata_program_id.to_bytes().as_ref(),
            mint.key().to_bytes().as_ref()
        ],
        bump,
        seeds::program = metadata_program_id
    )]
    pub metadata_account: AccountInfo<'info>,

    /// CHECK: Check that the account actually is the metadata program
    #[account(
        constraint = metadata_program.key() == metadata_program_id
    )] 
    pub metadata_program: AccountInfo<'info>,
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