node orchestrator.js eth0 deploy
node orchestrator.js eth1 deploy
node orchestrator.js eth0 register_chain eth1
node orchestrator.js eth1 register_chain eth0
node orchestrator.js eth0 send_msg "From: eth0\nMsg: Hello World!"
node orchestrator.js eth1 submit_vaa eth0 latest
node orchestrator.js eth1 send_msg "From: eth1\nMsg: Hello World!"
node orchestrator.js eth0 submit_vaa eth1 latest
sleep 10
node orchestrator.js eth0 get_current_msg
node orchestrator.js eth1 get_current_msg
