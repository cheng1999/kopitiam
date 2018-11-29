#!/bin/sh
mkdir /tmp/db
mv db/* /tmp/db
zip -r update.zip .>/dev/null;
mv update.zip /var/www/html
mv /tmp/db/* db/
