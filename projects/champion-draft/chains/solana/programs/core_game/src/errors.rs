use anchor_lang::prelude::*;

#[error_code]
pub enum MessengerError {
    #[msg("Posted VAA Key Mismatch")]
    VAAKeyMismatch,

    #[msg("Posted VAA Emitter Chain ID or Address Mismatch")]
    VAAEmitterMismatch,
}

#[error_code]
pub enum BattleError {
    #[msg("The champion is not active this round")]
    RoundMismatch,
    #[msg("The level discrepency between champions is too high")]
    LevelMismatch,
}
