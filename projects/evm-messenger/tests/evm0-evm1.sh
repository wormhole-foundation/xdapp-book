node orchestrator.js evm0 deploy
node orchestrator.js evm1 deploy
node orchestrator.js evm0 register_chain evm1
node orchestrator.js evm1 register_chain evm0
node orchestrator.js evm0 send_msg "From: evm0\nMsg: Hello World!"
node orchestrator.js evm1 submit_vaa evm0 latest
node orchestrator.js evm1 send_msg "From: evm1\nMsg: Hello World!"
node orchestrator.js evm0 submit_vaa evm1 latest
sleep 10
node orchestrator.js evm0 get_current_msg
node orchestrator.js evm1 get_current_msg
