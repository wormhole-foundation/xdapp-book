use anchor_lang::prelude::*;


mod account;
mod context;
mod constant;
mod error;
mod event;
mod portal;
mod wormhole;

use context::*;

declare_id!("BHz6MJGvo8PJaBFqaxyzgJYdY6o8h1rBgsRrUmnHCU9k");

#[program]
pub mod solana {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.config.owner = ctx.accounts.owner.key();
        ctx.accounts.config.nonce = 0;
        Ok(())
    }

    //Register Application Contracts
    pub fn register_chain(ctx:Context<RegisterChain>, chain_id:u16, emitter_addr:String) -> Result<()> {
        ctx.accounts.emitter_acc.chain_id = chain_id;
        ctx.accounts.emitter_acc.emitter_addr = emitter_addr;
        Ok(())
    }

    //Submit Foreign Purchase
}