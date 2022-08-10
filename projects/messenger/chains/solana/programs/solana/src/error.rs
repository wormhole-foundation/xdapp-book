use anchor_lang::prelude::*;

#[error_code]
pub enum MessengerError {
    #[msg("Posted VAA Key Mismatch")]
    VAAKeyMismatch,

    #[msg("Posted VAA Emitter Chain ID or Address Mismatch")]
    VAAEmitterMismatch,
}