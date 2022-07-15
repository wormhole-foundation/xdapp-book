
cd server/

export FLASK_APP=server

if [ ! -d "venv/" ] 
then
    echo "please create venv"
fi

. venv/bin/activate

flask run