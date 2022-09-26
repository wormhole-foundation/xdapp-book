#!/usr/bin/env bash

#500A
seed_amt=500000000

mnemonics=(
    "genuine burger urge heart spot science vague guess timber rich olympic cheese found please then snack nice arrest coin seminar pyramid adult flip absorb apology"
    "train rather absorb mouse tone scorpion group vacuum depth nothing assault silent fox relax depart lady hurdle million jaguar ensure define mule silk able order"
    "loan journey alarm garage bulk olympic detail pig edit other brisk sense below when false ripple cute buffalo tissue again boring manual excuse absent injury"
)

# Needs to be run against a clean sb or it may pick up unfunded accts
accts=(`$sb goal account list | awk '{print $3}'`)
funder=${accts[0]}

echo "Funding from: $funder"

for m in "${mnemonics[@]}"
do
    acct=`$sb goal account import -m "$m" |grep 'Imported' | awk '{print $2}' | tr -d '\r'`
    echo "Imported $acct"

    #TODO write to file and cat them all together to send grouped txn?
    $sb goal clerk send -f$funder -t$acct -a$seed_amt
done