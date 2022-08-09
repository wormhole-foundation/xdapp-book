use anchor_lang::prelude::*;

mod account;
mod constant;
mod context;
mod error;
mod event;

use account::*;
use constant::*;
use context::*;
use error::*;
use event::*;

declare_id!("24FoTeX7BKbhTh3UF3feWusoAVKDPWZneiEqhXLVzZPL");

#[program]
pub mod solana {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

