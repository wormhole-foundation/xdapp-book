use anchor_lang::prelude::*;
use crate::account::*;
use anchor_spl::token::{Mint};
use mpl_token_metadata::ID as metadata_program_id;
use crate::wormhole::*;
use crate::constant::*;
use std::str::FromStr;
use anchor_spl::token::ID as spl_id;
use crate::*;

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
    #[account(
        init,
        seeds = [b"redeemer"],
        bump,
        space = 8,
        payer=owner
    )]
    pub redeemer: Account<'info, Redeemer>,


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
#[instruction(chain_id:u16, emitter_addr:Vec<u8>)]
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
        space=8+2+32
    )]
    pub emitter_acc: Account<'info, EmitterAddrAccount>,
}


#[derive(Accounts)]
pub struct SubmitForeignPurchase<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
    #[account(
        mut,
        seeds = [b"config"],
        bump,
    )]
    pub config: Account<'info, Config>,
    #[account(
        init,
        seeds = [
            vaa_hash(core_bridge_vaa.clone()).as_slice()
        ],
        bump,
        payer = payer,
        space = 64
    )]
    pub receipt: Account<'info, Receipt>,

    // Fetch the VAA
    /// CHECK: Checked in lib.rs because it requires some fancy hashing
    #[account(
        constraint = core_bridge_vaa.to_account_info().owner == &Pubkey::from_str(CORE_BRIDGE_ADDRESS).unwrap()
    )]
    pub core_bridge_vaa: AccountInfo<'info>,
    #[account(
        init,
        seeds=[
            (EmitterAddrAccount::try_from_slice(&emitter_acc.data.borrow())?).emitter_address.as_slice().as_ref(),
            (EmitterAddrAccount::try_from_slice(&emitter_acc.data.borrow())?).emitter_chain.to_be_bytes().as_ref(),
            (PostedMessageData::try_from_slice(&core_bridge_vaa.data.borrow())?.0).sequence.to_be_bytes().as_ref()
        ],
        payer=payer,
        bump,
        space=8
    )]
    pub processed_vaa: Account<'info, ProcessedVAA>,
    /// CHECK: Checks that it's registered with token bridge 
    #[account(
        seeds = [
            (PostedMessageData::try_from_slice(&core_bridge_vaa.data.borrow())?.0).emitter_chain.to_be_bytes().as_ref(),
            (PostedMessageData::try_from_slice(&core_bridge_vaa.data.borrow())?.0).emitter_address.as_ref()
        ],
        seeds::program = &Pubkey::from_str(TOKEN_BRIDGE_ADDRESS).unwrap(),
        bump,
    )]
    pub emitter_acc: AccountInfo<'info>,



    


    // Complete Transfer of P3
    #[account(
        mut,
        seeds = [b"config"],
        bump,
        seeds::program = Pubkey::from_str(TOKEN_BRIDGE_ADDRESS).unwrap()
    )]
    /// CHECK: Token Bridge Config
    pub token_bridge_config: AccountInfo<'info>,
    /// CHECK: Processed claim PDA for Portal
    #[account(
        mut,
        seeds = [
            (PostedMessageData::try_from_slice(&core_bridge_vaa.data.borrow())?.0).emitter_address.as_ref(),
            (PostedMessageData::try_from_slice(&core_bridge_vaa.data.borrow())?.0).emitter_chain.to_be_bytes().as_ref(),
            (PostedMessageData::try_from_slice(&core_bridge_vaa.data.borrow())?.0).sequence.to_be_bytes().as_ref(),
        ],
        bump,
        seeds::program = Pubkey::from_str(TOKEN_BRIDGE_ADDRESS).unwrap()
    )]
    pub token_bridge_claim_key: AccountInfo<'info>,

    /// CHECK: TODO: Probably should check that this is owned by the SPL program and belongs to Config acc
    #[account(mut)]
    pub weth_ata_account: AccountInfo<'info>,
    
    #[account(
        mut,
        seeds = [b"redeemer"],
        bump,
    )]
    pub redeemer: Account<'info, Redeemer>,

    /// CHECK: Can be the same as mint_ata_account if no relayer
    #[account(mut)]
    pub fee_recipient: AccountInfo<'info>,

    #[account(mut)]
    pub weth_mint: Account<'info, Mint>,

    /// CHECK: The warapped meta for the wrapped mint
    #[account(
        seeds = [
            b"meta",
            weth_mint.key().to_bytes().as_ref()
        ],
        bump,
        seeds::program = Pubkey::from_str(TOKEN_BRIDGE_ADDRESS).unwrap()
    )]
    pub weth_mint_wrapped_meta: AccountInfo<'info>,

    /// CHECK: The mint authority for the wrapped token you're passing in
    #[account(
        seeds = [b"mint_signer"],
        seeds::program = Pubkey::from_str(TOKEN_BRIDGE_ADDRESS).unwrap(),
        bump,
    )]
    pub mint_authority_wrapped: AccountInfo<'info>,
    pub rent_account: Sysvar<'info, Rent>,
    /// CHECK: Make sure this is the right core bridge account
    #[account(
        constraint = core_bridge.key() == Pubkey::from_str(CORE_BRIDGE_ADDRESS).unwrap()
    )]
    pub core_bridge: AccountInfo<'info>,
    /// CHECK: SPL Program should be actual SPL Program
    #[account(
        constraint = spl_program.key() == spl_id
    )]
    pub spl_program: AccountInfo<'info>,

    /// CHECK: Make sure this is the right token bridge account
    #[account(
        constraint = token_bridge.key() == Pubkey::from_str(TOKEN_BRIDGE_ADDRESS).unwrap()
    )]
    pub token_bridge: AccountInfo<'info>
}

#[derive(Accounts)]
pub struct ClaimForeignPurchase<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
    #[account(
        mut,
        seeds = [b"config"],
        bump,
    )]
    pub config: Account<'info, Config>,
    #[account(mut)]
    pub receipt: Account<'info, Receipt>,


    // Mint SOL#T SPL tokens to Contract PDA
    #[account(mut)]
    pub xmint_token_mint: Account<'info, Mint>,
    #[account(
        seeds=[b"mint_authority"],
        bump,
        mut
    )]
    pub xmint_authority: Account<'info, MintInfo>,
    /// CHECK: TODO: Check if owned by SPL program 
    #[account(mut)]
    pub xmint_ata_account: AccountInfo<'info>,


    // P1 Portal Transfer to Recepient 
    #[account(
        seeds = [
            xmint_token_mint.key().to_bytes().as_slice(),
        ],
        bump,
        seeds::program = Pubkey::from_str(TOKEN_BRIDGE_ADDRESS).unwrap(),
        mut
    )]
    /// CHECK: The seeds constraint should check validity
    pub token_bridge_mint_custody: AccountInfo<'info>,
    #[account(
        seeds = [
            b"authority_signer",
        ],
        bump,
        seeds::program = Pubkey::from_str(TOKEN_BRIDGE_ADDRESS).unwrap(),
    )]
    /// CHECK: The seeds constraint should check validity
    pub token_bridge_authority_signer: AccountInfo<'info>,
    #[account(
        seeds = [
            b"custody_signer",
        ],
        bump,
        seeds::program = Pubkey::from_str(TOKEN_BRIDGE_ADDRESS).unwrap(),
    )]
    /// CHECK: The seeds constraint should check validity
    pub token_bridge_custody_signer: AccountInfo<'info>,
    #[account(
        seeds = [
            b"Bridge",
        ],
        bump,
        seeds::program = Pubkey::from_str(CORE_BRIDGE_ADDRESS).unwrap(),
        mut,
    )]
    /// CHECK: The seeds constraint should check validity
    pub core_bridge_config: AccountInfo<'info>,
    #[account(mut)]
    pub xmint_transfer_msg_key: Signer<'info>,
    #[account(
        seeds=[
            b"emitter",
        ],
        bump,
        seeds::program = Pubkey::from_str(TOKEN_BRIDGE_ADDRESS).unwrap(),
    )]
    /// CHECK: The seeds constraint should check validity
    pub token_bridge_emitter: AccountInfo<'info>,
    #[account(
        seeds=[
            b"Sequence",
            token_bridge_emitter.key().as_ref()
        ],
        bump,
        seeds::program = Pubkey::from_str(CORE_BRIDGE_ADDRESS).unwrap(),
        mut
    )]
    /// CHECK: The seeds constraint should check validity
    pub token_bridge_sequence_key: AccountInfo<'info>,
    #[account(
        seeds = [
            b"fee_collector".as_ref()
        ],
        bump,
        seeds::program = Pubkey::from_str(CORE_BRIDGE_ADDRESS).unwrap(),
        mut
    )]
    /// CHECK: If someone passes in the wrong account, Guardians won't read the message
    pub core_bridge_fee_collector: AccountInfo<'info>,
    pub clock: Sysvar<'info, Clock>,
    /// CHECK: Core Bridge matches constant address
    #[account(
        constraint = core_bridge.key() == Pubkey::from_str(CORE_BRIDGE_ADDRESS).unwrap()
    )]
    pub core_bridge: AccountInfo<'info>,



    /// CHECK: SPL Program should be actual SPL Program
    #[account(
        constraint = spl_program.key() == spl_id
    )]
    pub spl_program: AccountInfo<'info>,
    #[account(
        mut,
        seeds = [b"config"],
        bump,
        seeds::program = Pubkey::from_str(TOKEN_BRIDGE_ADDRESS).unwrap()
    )]
    /// CHECK: Token Bridge Config
    pub token_bridge_config: AccountInfo<'info>,
    pub rent_account: Sysvar<'info, Rent>,

    /// CHECK: Make sure this is the right token bridge account
    #[account(
        constraint = token_bridge.key() == Pubkey::from_str(TOKEN_BRIDGE_ADDRESS).unwrap()
    )]
    pub token_bridge: AccountInfo<'info>
}