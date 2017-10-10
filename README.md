# Kinvey-Training

This app is written using the Ionic Framework, which leverages the Kinvey AngularJS libraries to communicate with the backend.

This is the front end code for the Kinvey Developer Training. Please follow the instructions below to set up your environment before attending a training.

### Prerequisites
* Install nodejs https://nodejs.org/en/
* Install git cli: https://git-scm.com/downloads
* Install Ionic: npm install -g ionic cordova (https://ionicframework.com/docs/intro/installation/)

### Getting started
* git clone git@github.com:KinveyClientServices/SDE-Angular-Generic3.git
* git checkout feature/{your_team_name}
* ionic serve

To have ionic install your cordova plugins from the root directory run:
ionic state restore

It is possible that you might need to install an earlier version of the ios platform.  Try the standard cordova platform add ios first, but if that yields failures, try:
ionic platform add ios@3.9.2


You may need to modify your plist file to give permissions for unsecure http traffic and/or for giving permissions to access device geo capabilities:
```
<key>NSAppTransportSecurity</key>
<dict>
<key>NSAllowsArbitraryLoads</key><true/>
</dict>
<key>NSLocationAlwaysUsageDescription</key>
<string>Your message goes here</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>Your message goes here</string>
```


CHANGES
03/23/2017
- clarified installation of plugin
- updated sdk to 3.4.2



