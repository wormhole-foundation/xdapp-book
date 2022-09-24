use anchor_lang::prelude::*;

#[account]
pub struct Config {
    pub owner: Pubkey,
    pub nonce: u32,
}

#[account]
#[derive(Default)]
pub struct EmitterAddrAccount{
    pub emitter_chain: u16,
    pub emitter_address: [u8; 32],
}

//Empty account, we just need to check that it *exists*
#[account]
pub struct ProcessedVAA {}

#[account]
pub struct Redeemer {}

#[account]
pub struct MintInfo {
    pub mint: Pubkey
}