use anchor_lang::prelude::*;

#[account]
pub struct Config {
    pub owner: Pubkey,
    pub nonce: u64,
}

#[account]
#[derive(Default)]
pub struct EmitterAddrAccount{
    pub chain_id: u16,
    pub emitter_addr: String
}

//Empty account, we just need to check that it *exists*
#[account]
pub struct ProcessedVAA {}

#[account]
pub struct MintInfo {
    pub mint: Pubkey
}