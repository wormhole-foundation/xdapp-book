use crate::constants::ROUNDS;
use crate::errors::BattleError;
use anchor_lang::prelude::*;
use borsh;

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct ChampionStats {
    attack: u32,
    defense: u32,
    speed: u32,
    crit_rate: u32,
    level: u32,
    xp: u32,
    upgrade_points: u32,
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct AudienceVotes {
    attack: u32,
    defense: u32,
    speed: u32,
    crit_rate: u32,
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct Champion {
    champion_hash: Pubkey,
    owner: Pubkey,
    uri: String,
    vaa_seq: u64,
    round: u32,
    stats: ChampionStats,
    votes: AudienceVotes,
}

impl Champion {
    /// given a byte value, creates a stat by dividing the byte value by `scale` and adding `offset`.
    /// e.g. byte_to_stat(n, 2, 5) would produce values in the range [5, n/2 + 5]
    fn byte_to_stat(byte: u8, scale: u32, offset: u32) -> u32 {
        (byte as u32) / scale + offset
    }
    /// create a new pseudorandom champion using the given seed
    pub fn new(seed: u32) -> Self {
        // convert the 4 byte seed into 4 individual bytes
        let bytes = seed.to_be_bytes();
        // convert the 4 bytes into 8 half_bytes (each in the range 0-16) by using bitmasking
        let half_bytes = [
            bytes[0] & 0x0f,
            bytes[0] >> 4,
            bytes[1] & 0x0f,
            bytes[1] >> 4,
            bytes[2] & 0x0f,
            bytes[2] >> 4,
            bytes[3] & 0x0f,
            bytes[3] >> 4,
        ];
        Self {
            stats: ChampionStats {
                // attack in range [5,13]
                attack: Self::byte_to_stat(half_bytes[0], 2, 5),
                // defense in range [1,4]
                defense: Self::byte_to_stat(half_bytes[1], 5, 1),
                // speed in range [1,17]
                speed: Self::byte_to_stat(half_bytes[2], 1, 1),
                // crit_rate in range [10,26]
                crit_rate: Self::byte_to_stat(half_bytes[3], 1, 10),

                level: 1,
                xp: 0,
                upgrade_points: 1,
            },
            votes: AudienceVotes {
                attack: 0,
                defense: 0,
                speed: 0,
                crit_rate: 0,
            },
            champion_hash: Pubkey::default(),
            owner: Pubkey::default(),
            uri: "".to_string(),
            vaa_seq: 0,
            round: 0,
        }
    }

    /// simulate a battle between two champions using `randomness` as a source of randomness
    pub fn battle(&self, other: &Self, randomness: [u8; 32]) -> Result<BattleOutcome> {
        // gets a random byte from the input source of randomness
        let mut get_random_byte = {
            let mut i = 0;
            move || {
                let byte = randomness[i];
                i = (i + 1) % 32;
                byte as u32
            }
        };

        // simulate one round of fighting between an attacker and defender to find the amount of
        // damage dealt
        let calculate_damage =
            |attacker: &Champion,
             defender: &Champion,
             crit_threshold: u32,
             get_random_byte: &mut dyn FnMut() -> u32| {
                let damage_multiplier = get_random_byte() + 257;

                let damage = if get_random_byte() < crit_threshold {
                    (attacker.stats.attack * 2 * damage_multiplier) / defender.stats.defense / 512
                } else {
                    (attacker.stats.attack * damage_multiplier) / defender.stats.defense / 512
                };
                damage
            };

        // ensure that the level difference between the two champions is not too large
        if (self.stats.level > other.stats.level && self.stats.level - other.stats.level > 3)
            || (other.stats.level > self.stats.level && other.stats.level - self.stats.level > 3)
        {
            return Err(BattleError::LevelMismatch.into());
        }

        let self_threshold_to_hit =
            (self.stats.speed * 0xff) / (self.stats.speed) + (other.stats.speed);
        let self_threshold_to_crit = (self.stats.speed * 0xff) / 100;
        let other_threshold_to_crit = (other.stats.speed * 0xff) / 100;

        // simulate `ROUNDS` rounds of fighting
        let mut damage_by_self = 0;
        let mut damage_by_other = 0;
        let battle_events: [BattleEvent; ROUNDS] = (0..ROUNDS)
            .map(|_| {
                if get_random_byte() < self_threshold_to_hit {
                    let damage =
                        calculate_damage(self, other, self_threshold_to_crit, &mut get_random_byte);
                    damage_by_self += damage;
                    BattleEvent {
                        attacker: self.champion_hash,
                        damage,
                    }
                } else {
                    let damage = calculate_damage(
                        other,
                        self,
                        other_threshold_to_crit,
                        &mut get_random_byte,
                    );
                    damage_by_other += damage;
                    BattleEvent {
                        attacker: other.champion_hash,
                        damage,
                    }
                }
            })
            .collect::<Vec<_>>()
            .try_into()
            .unwrap();

        // determine who won the battle and calculate XP payouts
        if damage_by_self >= damage_by_other {
            let mut winner_xp = (damage_by_other * 50) / (damage_by_self + damage_by_other + 1);
            let mut loser_xp = 50 - winner_xp;
            winner_xp += 25;
            loser_xp += 8;

            Ok(BattleOutcome {
                events: battle_events,
                winner: self.champion_hash,
                loser: other.champion_hash,
                winner_xp,
                loser_xp,
            })
        } else {
            let mut winner_xp = (damage_by_self * 50) / (damage_by_self + damage_by_other);
            let mut loser_xp = 50 - winner_xp;
            winner_xp += 25;
            loser_xp += 8;
            Ok(BattleOutcome {
                events: battle_events,
                winner: other.champion_hash,
                loser: self.champion_hash,
                winner_xp,
                loser_xp,
            })
        }
    }

    /// turns bytes into a champion assuming that the bytes were serialized using the EVM
    /// serialization standard
    pub fn from_evm(vaa: &[u8]) -> Self {
        msg!("vaa: {:?}", vaa);
        // EVM pads each item to 32 bytes, so we can chunk the encoded vaa into 32 byte chunks
        let chunks: Vec<_> = vaa.chunks(32).collect();

        // pick out 32 byte chunks
        let bytes_champion_hash_bytes: &[u8; 32] = chunks[1].try_into().unwrap();
        let bytes_owner: &[u8; 32] = chunks[2].try_into().unwrap();
        let bytes_vaa_seq: &[u8; 8] = chunks[3][24..32].try_into().unwrap();
        let bytes_round: &[u8; 4] = chunks[4][28..32].try_into().unwrap();
        let bytes_attack: &[u8; 4] = chunks[5][28..32].try_into().unwrap();
        let bytes_defense: &[u8; 4] = chunks[6][28..32].try_into().unwrap();
        let bytes_speed: &[u8; 4] = chunks[7][28..32].try_into().unwrap();
        let bytes_crit_rate: &[u8; 4] = chunks[8][28..32].try_into().unwrap();
        let bytes_level: &[u8; 4] = chunks[9][28..32].try_into().unwrap();
        let bytes_xp: &[u8; 4] = chunks[10][28..32].try_into().unwrap();
        let bytes_upgrade_points: &[u8; 4] = chunks[11][28..32].try_into().unwrap();
        let bytes_votes_attack: &[u8; 4] = chunks[12][28..32].try_into().unwrap();
        let bytes_votes_defense: &[u8; 4] = chunks[13][28..32].try_into().unwrap();
        let bytes_votes_speed: &[u8; 4] = chunks[14][28..32].try_into().unwrap();
        let bytes_votes_crit_rate: &[u8; 4] = chunks[15][28..32].try_into().unwrap();
        let bytes_uri_len: &[u8; 8] = chunks[17][24..32].try_into().unwrap();

        // convert 32 bytes chunks into various sized integers
        let champion_hash_bytes = bytes_champion_hash_bytes;
        let owner = bytes_owner;
        let vaa_seq = u64::from_be_bytes(*bytes_vaa_seq);
        let round = u32::from_be_bytes(*bytes_round);
        let attack = u32::from_be_bytes(*bytes_attack);
        let defense = u32::from_be_bytes(*bytes_defense);
        let speed = u32::from_be_bytes(*bytes_speed);
        let crit_rate = u32::from_be_bytes(*bytes_crit_rate);
        let level = u32::from_be_bytes(*bytes_level);
        let xp = u32::from_be_bytes(*bytes_xp);
        let upgrade_points = u32::from_be_bytes(*bytes_upgrade_points);
        let votes_attack = u32::from_be_bytes(*bytes_votes_attack);
        let votes_defense = u32::from_be_bytes(*bytes_votes_defense);
        let votes_speed = u32::from_be_bytes(*bytes_votes_speed);
        let votes_crit_rate = u32::from_be_bytes(*bytes_votes_crit_rate);

        // the URI needs some special handling since it's variable length. We first get the length
        // and then use it to determine how many bytes to parse
        let uri_len = u64::from_be_bytes(*bytes_uri_len) as usize;
        let uri = std::str::from_utf8(&vaa[(18 * 32)..(18 * 32 + uri_len)])
            .unwrap()
            .to_string();

        let mut champion = Champion {
            champion_hash: Pubkey::new_from_array(*champion_hash_bytes),
            owner: Pubkey::new_from_array(*owner),
            vaa_seq,
            round,
            stats: ChampionStats {
                attack,
                defense,
                speed,
                crit_rate,
                level,
                xp,
                upgrade_points,
            },
            votes: AudienceVotes {
                attack: votes_attack,
                defense: votes_defense,
                speed: votes_speed,
                crit_rate: votes_crit_rate,
            },
            uri,
        };

        return champion;
    }

    /// serializes a champion into bytes following the EVM abi serialization standard
    pub fn into_evm(&self) -> Vec<u8> {
        let mut vaa = vec![0; 32 * 18];
        let mut vaa_chunks = vaa.chunks_mut(32);
        vaa_chunks
            .next()
            .unwrap()
            .copy_from_slice(&self.champion_hash.to_bytes());
        vaa_chunks
            .next()
            .unwrap()
            .copy_from_slice(&self.owner.to_bytes());
        vaa_chunks.next().unwrap()[24..32].copy_from_slice(&self.vaa_seq.to_be_bytes().to_vec());
        vaa_chunks.next().unwrap()[28..32].copy_from_slice(&self.round.to_be_bytes().to_vec());
        vaa_chunks.next().unwrap()[28..32]
            .copy_from_slice(&self.stats.attack.to_be_bytes().to_vec());
        vaa_chunks.next().unwrap()[28..32]
            .copy_from_slice(&self.stats.defense.to_be_bytes().to_vec());
        vaa_chunks.next().unwrap()[28..32]
            .copy_from_slice(&self.stats.speed.to_be_bytes().to_vec());
        vaa_chunks.next().unwrap()[28..32]
            .copy_from_slice(&self.stats.crit_rate.to_be_bytes().to_vec());
        vaa_chunks.next().unwrap()[28..32]
            .copy_from_slice(&self.stats.level.to_be_bytes().to_vec());
        vaa_chunks.next().unwrap()[28..32].copy_from_slice(&self.stats.xp.to_be_bytes().to_vec());
        vaa_chunks.next().unwrap()[28..32]
            .copy_from_slice(&self.stats.upgrade_points.to_be_bytes().to_vec());
        vaa_chunks.next().unwrap()[28..32]
            .copy_from_slice(&self.votes.attack.to_be_bytes().to_vec());
        vaa_chunks.next().unwrap()[28..32]
            .copy_from_slice(&self.votes.defense.to_be_bytes().to_vec());
        vaa_chunks.next().unwrap()[28..32]
            .copy_from_slice(&self.votes.speed.to_be_bytes().to_vec());
        vaa_chunks.next().unwrap()[28..32]
            .copy_from_slice(&self.votes.crit_rate.to_be_bytes().to_vec());
        vaa
    }
}

#[derive(Debug, Clone, Copy, Default, AnchorSerialize, AnchorDeserialize)]
pub struct BattleEvent {
    pub attacker: Pubkey,
    pub damage: u32,
}

#[account]
#[derive(Default, Debug)]
pub struct BattleOutcome {
    pub events: [BattleEvent; ROUNDS],
    pub winner: Pubkey,
    pub loser: Pubkey,
    pub winner_xp: u32,
    pub loser_xp: u32,
}

#[account]
pub struct ChampionAccount {
    pub owner: Pubkey,
    pub champion: Champion,
}

#[account]
pub struct WormholeMessageAccount {
    pub data: [u8; 64],
}

#[account]
#[derive(Default)]
pub struct Config {
    pub owner: Pubkey,
    pub nonce: u32,
    pub current_msg: String,
}

#[account]
#[derive(Default)]
pub struct EmitterAddrAccount {
    pub chain_id: u16,
    pub emitter_addr: String,
}

//Empty account, we just need to check that it *exists*
#[account]
pub struct ProcessedVAA {}
