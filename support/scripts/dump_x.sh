#!/bin/bash

if [ "`whoami`" != 'postgres' ] ; then
	echo "Please run this script as the user 'postgres'."
	exit 2
fi

if [ $# != 1 ] ; then
	echo "Usage: $0 database"
	echo "Example: $0 FB2010_05"
	exit 1
fi

DB=$1

for table in `echo "\dt" | psql $DB | sed y/\ /\\\\\\n/ | grep 'x_'` ; do

	pg_dump -t $table $DB > ${DB}_${table}.dump
	
done

