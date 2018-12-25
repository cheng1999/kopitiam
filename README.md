
# Kopitiam 
A Kopitiam boy, whom a son of taokenion Lian Kiew Cafe started this project based on her need.
As it makes for kopitiam, it is simple, just in the way like kopitiam. A Kopitiam food ordering system, not restaurant food ordering system. Only a few simple features are available which is enough for Kopitiam to operate. 

# Features
- Ordering
- Statistics
- Settings

*take note that this is unlike the restaurant, as below:*
- no bill will printout for payment, only ordered foods printout in receipt paper.
- no food promotion feature.

## Screenshots 
![](https://github.com/cheng1999/Kopitiam/blob/master/docs/screenshots/tables.jpg)
![](https://raw.githubusercontent.com/cheng1999/Kopitiam/master/docs/screenshots/order.jpg)
![](https://github.com/cheng1999/Kopitiam/blob/master/docs/screenshots/setting.jpg)
![](https://github.com/cheng1999/Kopitiam/blob/master/docs/screenshots/statistics.jpg)

## Installation 

If you use a tablet as the server, termux is required to be installed on the devices as the environment to run the server-side script.

### Step 1:
Install [Termux](https://play.google.com/store/apps/details?id=com.termux) from Google Play Store.

### Step 2:
```bash
pkg install wget
exit
```
restart termux, then
```bash
wget -O - https://github.com/cheng1999/kopitiam/releases/download/0.7/install.sh | sh
```
now server is ready.

### Step 3:
To setup client-side application, simply open chrome, direct to < http://your-device-ip:8080/ >, then add to home screen.

examples: 
- ordering interface: < http://192.168.0.111:8080/ >
- site map          : < http://192.168.0.111:8080/menu.html >
- statistics        : < http://192.168.0.111:8080/statistics.html >
- configuration     : < http://192.168.0.111:8080/config.html >


setup printer by yourself.
more details MAYBE updated next time.


## Contributing
My dad and mom help me to test this system in their Kopitiam, Lian Kiew Cafe.

They always scolded me when the system comes bugs. :.(


## Authors
* **Lee Guo Cheng** - *Initial work* - [cheng1999](https://github.com/cheng1999)


## License
no idea.

