node treasury.js evm0 deploy
node treasury.js evm1 deploy
node treasury.js evm0 register_chain evm1
node treasury.js evm1 register_chain evm0

node treasury.js evm0 get_tokens 100
node treasury.js evm0 attest_token evm1
node treasury.js evm1 get_token_counts
node treasury.js evm0 bridge_token evm1 50
node treasury.js evm0 get_token_counts
node treasury.js evm1 get_token_counts