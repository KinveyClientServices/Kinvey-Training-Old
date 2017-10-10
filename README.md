# SDE-Angular-Generic

This app is written using the Ionic Framework, which leverages the Kinvey AngularJS libraries to communicate with the backend.

This app demonstrates the following functionality.
Authentication with KinveyAuth or Mobile Identity Connect.  It is possible to show changing the identity provider on the backend to connect to different authentication systems without changing a single line of code on the client.
Interfacing with the Kinvey Datastore.  The products collection contains a list of Kinvey products for sales people to showcase to their customers.  The Datastore can be created on the fly on the backend, data can be imported, and that data is immediately available within the app.  With the product collection you can show GET and GET by query.  Elsewhere in the app, we can also show INSERT (on a different collection).
Offline access.  Once the products collection is imported, you can put your device in airplane mode and show that the data is still accessible and searchable while offline.  On various tabs, you can also show autogeneration of records and syncing to the backend/
Filestore - you can put PDF and other file content in the filestore and see them streamed to the client.  FIXME:  Currently, if you open a file, you have to close the app and reopen.  Unlike in the browser, that view doesn't have a back button.
accounts collection - show importing the data and then "flip the switch" to either SFDC, REST, SQL Server, or (with a little BL) SAP.
tasks Collection - Import data and then you can show, can connect to sharepoint

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

11/11/2016
- added support for pull-to-refresh on products screen
- improved the way we display files
- fixed drilldown on accounts screen
- minor UI fixes

