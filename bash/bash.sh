#!/bin/sh
case "$1" in

  "delaylaunch")
    sleep 1
    node index.js 2&>>err.log
    ;;

  "update")
    echo "updating...."
    wget http://192.168.0.111/update.zip -O update.zip > /dev/null
    unzip -o update.zip >/dev/null
    sh bash/update.sh
    echo "done"
    ;;

  "restoredb")
    echo "restore...."
    unzip -o views/backupdb.zip >/dev/null
    echo "done"
    ;;

  "backupdb")
    rm views/backupdb.zip
    zip -r views/backupdb.zip db/* >/dev/null;
    echo "done"
    ;;

  *)
    echo "invalid arguments."
    exit
    ;;
esac

