#!/bin/sh

#wget -O - http://192.168.0.111/install.sh | sh
echo '### Installing required package...'

yes | pkg update
yes | pkg install nodejs sqlite libsqlite unzip zip vim curl
#termux install unzip and unzip
#pkg install unzip zip

mkdir kopitiam; cd kopitiam

echo '### Downloading...'
curl -s https://api.github.com/repos/cheng1999/Kopitiam/releases/latest \
| grep 'browser_download_url' \
| grep 'kopitiam.zip' \
| cut -d '"' -f 4 \
| wget -i -

echo '### Extracting...'
unzip -o kopitiam.zip >/dev/null

echo '### System configuring...'
# target='~/../usr/etc'
# cp $target/bash.bashrc $target/bash.bashrc.bak
# echo 'cd kopitiam; node index.js' >> $target/bash.bashrc
cd ~/../usr/etc

if [ ! -f bash.bashrc.bak ]; then
  cp bash.bashrc bash.bashrc.bak
  echo 'termux-wake-lock; cd kopitiam; node index.js' >> bash.bashrc
fi

echo '### Installed!'

cd ~/kopitiam
node index.js
