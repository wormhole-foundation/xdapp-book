setup redis
```
sudo yum install redis
sudo systemctl start redis
redis-cli ping
```

setup python
```
sudo yum install python38-devel
python3.8 -m pip venv venv
source venv/bin/activate
python -m pip install -r requirements.txt 
deactivate
cd ..
./startServer.sh
```

