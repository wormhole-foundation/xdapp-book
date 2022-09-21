

use anchor_lang::prelude::*;

#[error_code]
pub enum XmintError {
    #[msg("Posted VAA Key Mismatch")]
    VAAKeyMismatch,

    #[msg("Posted VAA Emitter Chain ID or Address Mismatch")]
    VAAEmitterMismatch,
}