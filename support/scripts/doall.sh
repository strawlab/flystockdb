#!/bin/bash

if [ $# != 3 ] ; then
	echo "Usage: $0 database username password"
	echo "Example: $0 FB2010_05 dbuser Ta82fw"
	exit 1
fi

database=$1
username=$2
password=$3

./fly.rb $database $username $password
./compress_transitions.rb $database $username $password

