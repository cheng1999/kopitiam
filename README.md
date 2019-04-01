

# Kopitiam 
A Kopitiam boy, whom a son of taokenion Lian Kiew Cafe started this project based on her need.

As it makes for kopitiam, it is simple, just in the way like kopitiam. A Kopitiam food ordering system, not restaurant food ordering system. Only a few simple features are available which is enough for Kopitiam to operate. 

# Features
- Ordering
- Statistics
- Settings

*take note that this is unlike the restaurant, as below:*

- no bill will printout for payment, only ordered foods directly printout in receipt style.
- no food promotion feature.

## Screenshots 
![](https://raw.githubusercontent.com/cheng1999/Kopitiam/master/docs/screenshots/tables.png)

![](https://raw.githubusercontent.com/cheng1999/Kopitiam/master/docs/screenshots/order.png)

![](https://raw.githubusercontent.com/cheng1999/Kopitiam/master/docs/screenshots/setting.png)

![](https://raw.githubusercontent.com/cheng1999/Kopitiam/master/docs/screenshots/statistics.png)

## Installation 

If you use a tablet as the server, termux is required to be installed on the devices as the environment to run the server-side script.

### Step 1:
Install 
[Termux](https://play.google.com/store/apps/details?id=com.termux) 
and 
[Firefox](https://play.google.com/store/apps/details?id=org.mozilla.firefox)
form Google Play Store

### Step 2:
run in termux: 
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
To setup client-side application, simply open Firefox, direct to < http://your-device-ip:8080/ca-cert.crt >, download and install the certificate for Firefox local ssh connection.
Note that Certificate trusted only in host 192.168.0.2 and 192.168.1.2, so make sure your server reserved such ip in router.

### Step 4:
Direct to the webapp link as below in Firefox, add to home screen as you need.

- admin panel : `https//your-device-ip:8081/admin.html`
- order client: `https//your-device-ip:8081/`
** default password : 1234 **
> examples: 
> - admin panel : `https//192.168.0.2:8081/admin.html`
> - order client: `https//192.168.0.2:8081/`

Setup lan printer by yourself.
more details MAYBE updated next time.


## Contributing
My dad and mom help me to test this system in their Kopitiam, Lian Kiew Cafe.

They always scolded me when the system comes bugs. :.(


## Authors
* **Lee Guo Cheng** - *Initial work* - [cheng1999](https://github.com/cheng1999)


## License
no idea.


