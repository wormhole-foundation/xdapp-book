#!/usr/bin/env bash

ACCOUNT_MNEMONIC="acid father roof true tongue kiwi hero forget aim cabbage practice napkin supreme produce arm evolve cereal fame embark local glide hole warrior above frost"
FOUNDER_ADDRESS='LR4AGMWMJX76L3PQF6POXLSMPXXE45U35JGFO3W6D342ED57FOVSHVM3MQ'
SANDBOX_CMD='./sandbox.algorand/sandbox'

# Check if Algorand sandbox/ repo exists.
# If it doesn't then clone
if [ ! -d "./sandbox.algorand" ] 
then
    git clone https://github.com/algorand/sandbox sandbox.algorand
fi

if [[ -z $PYTHON_CMD ]]; then
    PythonCmd="python3.10"
else
    PythonCmd=$PYTHON_CMD
fi 

command -v $PythonCmd >/dev/null 2>&1 || { echo "Python interpreter '$PythonCmd' not installed" >&2; exit 1; }


# Start Algorand sandbox

$SANDBOX_CMD reset 
if [[ $? -eq 1 ]]; then
    $SANDBOX_CMD up dev -v
fi

# Fund account
SOURCE_ACCOUNT=$($SANDBOX_CMD goal account list | head -n 1 | awk '{print $2}')
$SANDBOX_CMD goal clerk send -f $SOURCE_ACCOUNT -t $FOUNDER_ADDRESS -a 1000000000000000

# Deploy Algorand wormhole contracts using admin tools

echo Python Interpreter: $PythonCmd

echo '{}' > wormhole/algorandcnNftMetadata.json

cd wormhole/algorand
$PythonCmd -m pip install -r requirements.txt 
$PythonCmd admin.py --devnet  --boot --mnemonic "$ACCOUNT_MNEMONIC"


