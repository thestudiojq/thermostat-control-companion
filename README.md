# thermostat-control-companion

Companion app for our *Thermostat Controller* iPhone app, which lets you monitor and control your **Venstar** thermostat. The main purpose of this companion app is to allow for push notifications via the iPhone app. But, if you wanted, it could also be used as a standalone readout of the core data coming from the thermostat.

iOS app available [here](https://apps.apple.com/ca/app/thermostat-controller/id6502414185).

## What it does

The app monitors your Venstar thermostat via its local API, and, if it detects a change in state (i.e. goes from being idle to active or vice versa), then it triggers a push notification that gets sent to your iPhone via the *Thermostat Controller* app. 

*Note that it's likely that your thermostat will change states quite often during the day, especially if it's quite cold or hot (and you have AC) out, so you may receive many notifications. Perfect if, like me, you love home automation lol. Perhaps less perfect for others...*

## Installation

The following instructions apply to Linux, macOS and Windows. 

First make sure Node.js and npm are installed on your system. You can do this by opening a terminal (or command prompt) session and typing the following:

```
node -v
```

And:

```
npm -v
```

If both of those commands output a version number, then they are both installed. If they do not, then [download and install Node.js](https://nodejs.org/en/download) before continuing. 

--------------------------------

Download the latest release from [here](https://github.com/thestudiojq/thermostat-control-companion/releases) and place the files in a directory of your choosing. 

Another option is to open terminal, create the directory you want and clone this repo into that directory. An example (done on Linux):

```
# Create a directory for tccompanion
sudo mkdir /opt/tccompanion

# Depending on the directory, you may need to update the ownership. e.g.:
sudo chown -R ${USER}: /opt/tccompanion

# Clone the thermostat-control-companion repository
git clone --depth 1 https://github.com/thestudiojq/thermostat-control-companion.git /opt/tccompanion
```

Once the files are in place (whether you downloaded the release or cloned the repo), open terminal and navigate to the folder you put it in and install the necessary dependencies. i.e.:

```
cd /opt/tccompanion
npm ci
```

## App as a service

On certain operating systems, you're able to run the app as a service, so it runs in the background and restarts when the computer restarts, etc.

The following is an example of how to do this on Linux.

Create a systemctl config file for tccompanion:

```
sudo nano /etc/systemd/system/tccompanion.service
```

And place the following in that file:

```
[Unit]
Description=tccompanion
After=network.target

[Service]
Environment=NODE_ENV=production
Type=exec
ExecStart=/usr/bin/npm start
WorkingDirectory=/opt/tccompanion
StandardOutput=inherit
StandardError=inherit
Restart=always
RestartSec=10s
User=root

[Install]
WantedBy=multi-user.target
```

You can adjust some of those settings as you see fit. For example, you may want to assign a user other than root. Or you may not want the restart set to always. Or you may want to set `StandardOutput=null` if you don't want messages filling up the syslog. Etc.

## Running (and stopping) the app

### Not as a service

If you aren't running the app as a service, then open a new terminal window, navigate to the folder where you installed it and run the following command:

```
npm start
```

To stop the app, just hit Control-C in the terminal window.

### As a service

If you're running the app as a service, then enable it with this command:

```
sudo systemctl enable tccompanion
```

And start it with the following command:

```
sudo systemctl start tccompanion
```

It will now automatically run in the background and restart when you restart your computer.

You can check the status with:

```
sudo systemctl status tccompanion
```

And stop it with:

```
sudo systemctl stop tccompanion
```

And restart it with:

```
sudo systemctl restart tccompanion
```

And disable it with:

```
sudo systemctl disable tccompanion
```

And check the logs for it with e.g.:

```
sudo journalctl -u tccompanion -f
```

## Setup

After you start the app, visit `localhost:3218` in your browser. You'll see a table that normally reads out the core thermostat data. This info won't be correct at the moment. Click on the **Settings** button at the top to visit the config page. Here you can enter the following info:

* **IP Address**: This is the local IP Address of your thermostat. If you're using the iPhone app, you should already know this, as you would've had to enter it in that app. If you don't know it, you can find it by doing the following on your thermostat (instructions are for the T7900 model):
    * Tap MENU.
    * Then Wi-Fi.
    * Then WiFi Status.
    * Here it will display the IP address of the unit.
* **API Key**: Enter here the same API key you created for/used in the iPhone app. If you haven't already created one for the iPhone app, then note that the API key must be in UUIDv4 format, otherwise it will be rejected and you won't get push notifications on your phone. There are many ways/places to generate a UUIDv4 key. For example: https://generate-uuid.com/
* **Interval**: This is how often, in seconds, you want the app to query your thermostat. i.e. If you set this to 53, the app will query your thermostat every 53 seconds. The default is 120.
* **Remote Retrieval Mode**: Enable this if you would like to make use of the remote mode option in the phone app, so you can fetch thermostat data to your phone even when you are not on the same Wi-Fi network as the thermostat. This works in addition to (and does not affect) the push notification functionality. 

--------------------------------

If you'd prefer, you could, instead, just insert the above data directly into the `data.json` file found in the **data** folder.

e.g.:

```
sudo nano /opt/tccompanion/data/data.json
```

### Updating config

If you're updating the config from the browser, note that the API key field will be empty when you visit the settings page. This is by design and does not mean that your key isn't saved. You can udpate the IP and/or interval and leave the API key field blank, and it will retain the previously-saved value for the API key. If you input something in the API Key field, then, naturally, it will overwrite the previously-saved data.

## Using

There isn't much to using the app. You just let it run and it will fetch the thermostat data at the specific interval and, if there is a thermostat state change (e.g. idle to active or vice versa), it will trigger a push notification to your phone.

If you're running into issues with the app, such as not getting push notifications or the app not reading the (correct) data from the thermostat, then first visit `localhost:3218` in your browser. Config issues will be noted with an error message under the table. If there's nothing there, then check the output via terminal. So, if you aren't running the app as a service, then any errors will just be output to the console/terminal window where the app is running as they happen. If you're running it as a service, then check the journal in a terminal window. e.g:

```
sudo journalctl -u tccompanion -f

# or

sudo journalctl -u tccompanion -n 50

# etc.
```

And make the issue happen again. This should report back more details on the issue/error, which should hopefully allow you to troubleshoot and diagnose the problem.

## Security

This app runs locally and reads your Venstar thermostat data locally. If you are not using the remote retrieval mode, then the only thing not local is the data that is sent for the push notifications. For this, the app sends two pieces of data out: A message (the content of the push notification) to indicate the state change of the thermostat and your API key. The message is just forwarded to Apple's push notification service and not saved or stored anywhere by us. However, it is necessary for us to store your API key in order to correctly send the push notification to your device that has the iPhone app installed. The key is hashed before being placed in our database. And this is why we enforce the UUIDv4 format.

### Remote retrieval mode

If you are using the remote retrieval mode, then, each time the app fetches the thermostat data (e.g. at the specified interval), it will send this thermostat data to our server, where it will be stored, so that you can fetch it from the phone app. Only the data from the latest fetch is stored (i.e. it overwrites the previous data each time). The following data is stored:

* API key (hashed and must be in UUIDv4 format)
* Current temperature
* Set heat temperature
* Set cool temperature
* Current humidity level
* Current mode
* Current state
* Current fan mode
* Current fan state
* Stage 1 runtimes for today and each of the previous six days