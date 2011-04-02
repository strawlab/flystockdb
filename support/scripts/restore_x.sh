#!/bin/bash

if [ "`whoami`" != 'postgres' ] ; then
	echo "Please run this script as the user 'postgres'."
	exit 2
fi

if [ $# != 3 ] ; then
	echo "Usage: $0 database original_user new_user"
	echo "Example: $0 FB2010_05 joachim gazebo"
	exit 1
fi

DB=$1
ORIGINAL_USER=$2
NEW_USER=$3

echo "CREATE DATABASE $DB OWNER ${NEW_USER}" | psql postgres

for i in *.dump ; do

	cat $i | sed s/${ORIGINAL_USER}/${NEW_USER}/g | psql $DB

done

