node messenger.js eth0 deploy
node messenger.js eth1 deploy
sleep 5
node messenger.js eth0 register_chain eth1
node messenger.js eth1 register_chain eth0
node messenger.js eth0 send_msg "From: eth0\nMsg: Hello World!"
node messenger.js eth1 submit_vaa eth0 latest
node messenger.js eth1 send_msg "From: eth1\nMsg: Hello World!"
node messenger.js eth0 submit_vaa eth1 latest
sleep 10
node messenger.js eth0 get_current_msg
node messenger.js eth1 get_current_msg
