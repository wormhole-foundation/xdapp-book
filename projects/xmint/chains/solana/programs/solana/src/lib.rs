use anchor_lang::prelude::*;
use mpl_token_metadata::instruction::create_metadata_accounts_v3;
use mpl_token_metadata::ID as metadata_program_id;
use anchor_lang::solana_program::program::invoke_signed;

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
    pub fn register_chain(ctx:Context<RegisterChain>, chain_id:u16, emitter_addr:String) -> Result<()> {
        ctx.accounts.emitter_acc.chain_id = chain_id;
        ctx.accounts.emitter_acc.emitter_addr = emitter_addr;
        Ok(())
    }

    //Submit Foreign Purchase
}