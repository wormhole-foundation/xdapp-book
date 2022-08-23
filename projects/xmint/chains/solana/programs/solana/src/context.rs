use anchor_lang::prelude::*;
use crate::account::*;

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