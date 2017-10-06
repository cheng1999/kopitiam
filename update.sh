#!/bin/sh
echo updating....
wget http://192.168.0.111/update.zip -O update.zip > /dev/null
unzip -o update.zip >/dev/null
echo updated!
node index.js

