angular.module('starter.controllers', ['kinvey', 'ngCordova'])

.controller('DashCtrl', function($scope) {

    $scope.myTest = function() {
        console.log('inside myTest');
        $ionicSideMenuDelegate.toggleLeft();
    };
})

.controller('MyVideoCtrl', function($scope, $kinvey, $stateParams) {
    console.log($stateParams.videoId);
    //$scope.chat = Chats.get($stateParams.chatId);
    var promise = $kinvey.Files.stream($stateParams.videoId, {
        tls: false
    });
    promise.then(function(file) {
        console.log(file);
        var url = file._downloadURL;
        file._downloadURL = 'https://docs.google.com/gview?embedded=true&url=' + file._downloadURL;
        console.log(url);
        $scope.file = file;
    });
})

.controller('PlacesCtrl', function($kinvey, $scope, $rootScope) {

    console.log('places ctrl');
    $scope.placesData = {
        range: "",
        interest: ""
    };

    $scope.doRefresh = function() {
        // this grabs current location, the distance specified and any points
        // of interest specified and does a lookup to Google Places to find
        // points of interest dta within the radius specified
        console.log('current_loc = ' + $rootScope.current_loc);
        console.log($scope.placesData.range);
        console.log($scope.placesData.interest);

        var distance = parseInt($scope.placesData.range);
        console.log('distance = ' + distance);
        var dataStore = $kinvey.DataStore.getInstance('places', $kinvey.DataStoreType.Network);

        var myzone = [$rootScope.current_loc[1], $rootScope.current_loc[0]];

        var query = new $kinvey.Query();
        query.equalTo('keyword', $scope.placesData.interest).near('_geoloc', myzone, distance);
        console.log(query);

        dataStore.find(query).subscribe(function(places) {
            console.log(places);
            $scope.places = places;
            $scope.$digest();
            return;
        });

    }

})


.controller('MapCtrl', function($scope, $kinvey, $rootScope) {
    console.log('mapctrl');
    var gmarkers = [];

    // init sets up the map
    // TODO:  make the map center be around current location
    //
    $scope.initialize = function() {

            console.log('initializing map');

            var myLatlng = new google.maps.LatLng(39.8282109, -98.5795706);

            var mapOptions = {
                center: myLatlng,
                zoom: 3,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            $rootScope.map = new google.maps.Map(document.getElementById("mymap"),
                mapOptions);
        } // end initialize


    // if the user has specified a distance, this grabs the points of interest in the Account
    // collection around that radius.  If a distance is not specified, all geo points in Account
    // collection are returned
    //
    $scope.doRefresh = function() {
            //check to see if a range has been specified
            console.log('refresh');
            if (document.getElementById("myrange").value == "") {
                console.log('no range');
                var dataStore = $kinvey.DataStore.getInstance('accounts', $kinvey.DataStoreType.Network);

                dataStore.find().subscribe(function(locations) {
                    console.log(locations);
                    locations = locations.cache;
                    for (var i = 0; i < locations.length; i++) {
                        var mylat = parseInt(locations[i]._geoloc[0]);
                        var mylong = parseInt(locations[i]._geoloc[1]);
                        console.log(mylat + ", " + mylong);
                        console.log(locations[i].company.name);
                        var info = new google.maps.InfoWindow({
                            content: '<b>Who:</b> ' + locations[i].name + '<br><b>Notes:</b> ' + locations[i].company.name
                        });


                        var mapOptions = {

                            mapTypeId: google.maps.MapTypeId.ROADMAP
                        };

                        var myLatlng = new google.maps.LatLng(mylat, mylong);
                        var marker = new google.maps.Marker({
                            position: myLatlng,
                            map: $rootScope.map,
                            title: locations[i].name
                        });
                        gmarkers.push(marker);
                        google.maps.event.addListener(marker, 'click', (function(info) {
                            return function() {
                                info.open($rootScope.map, this);
                            }
                        })(info));

                    }

                });
            } else {
                console.log('range specified');
                console.log('gmarker len = ' + gmarkers.length);
                console.log($rootScope.current_loc);

                var myrange = document.getElementById("myrange").value;
                console.log('myrange = ' + myrange);

                console.log('getting position');

                // Query for geo points close by.
                var query = new $kinvey.Query();
                var dataStore = $kinvey.DataStore.getInstance('accounts', $kinvey.DataStoreType.Network);
                query.near('_geoloc', $rootScope.current_loc, myrange);
                //debugger;
                var promise = dataStore.find(query).subscribe(function(models) {
                    console.log(models);

                    console.log('num markers = ' + models.length);
                    for (i = 0; i < gmarkers.length; i++) {
                        console.log('clearing marker...');
                        gmarkers[i].setMap(null);
                    }


                    for (var i = 0; i < models.length; i++) {
                        var mylat = parseInt(models[i]._geoloc[0]);
                        var mylong = parseInt(models[i]._geoloc[1]);
                        console.log(mylat + ", " + mylong);
                        console.log(models[i].accountcompany);
                        var info = new google.maps.InfoWindow({
                            content: '<b>Who:</b> ' + models[i].accountname + '<br><b>Notes:</b> ' + models[i].accountcompany
                        });

                        var mapOptions = {
                            //center: myLatlng,
                            //zoom: 3,
                            mapTypeId: google.maps.MapTypeId.ROADMAP
                        };

                        var myLatlng = new google.maps.LatLng(mylat, mylong);
                        var marker = new google.maps.Marker({
                            position: myLatlng,
                            map: $rootScope.map,
                            title: models[i].name
                        });

                        gmarkers.push(marker);

                        google.maps.event.addListener(marker, 'click', (function(info) {
                            return function() {
                                info.open($rootScope.map, this);
                            }
                        })(info));

                    }
                    $scope.$digest();
                    return
                }, function(err) {
                    console.log(err);
                });

            }

        } // end doRefresh

    $scope.$on('$ionicView.beforeEnter', function() {

        console.log('before entering map view');
        var dataStore = $kinvey.DataStore.getInstance('accounts');

        dataStore.find().subscribe(function(locations) {
            console.log(locations);
            locations = locations;
            console.log(locations.length);
            for (var i = 0; i < locations.length; i++) {
                var mylat = parseInt(locations[i]._geoloc[0]);
                var mylong = parseInt(locations[i]._geoloc[1]);
                console.log(mylat + ", " + mylong);

                var info = new google.maps.InfoWindow({
                    content: '<b>Who:</b> ' + locations[i].accountname + '<br><b>Company:</b> ' + locations[i].accountcompany
                });

                var mapOptions = {

                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };

                var myLatlng = new google.maps.LatLng(mylat, mylong);
                var marker = new google.maps.Marker({
                    position: myLatlng,
                    map: $rootScope.map,
                    title: locations[i].name
                });
                gmarkers.push(marker);
                google.maps.event.addListener(marker, 'click', (function(info) {
                    return function() {
                        info.open($rootScope.map, this);
                    }
                })(info));

            }

        });
    });



})


.controller('SearchCtrl', function($scope, $kinvey, $sce) {

    // this grabs the Products names for the dropdown select
    //
    $scope.$on('$ionicView.beforeEnter', function() {
        console.log('load search view');

        var dataStore = $kinvey.DataStore.getInstance('products', $kinvey.DataStoreType.Network);

        dataStore.find().subscribe(function(result) {
            var products = result;
            console.log(products);
            $scope.products = products;
            $scope.$digest();
        });
    });

    // this grabs the entity in the Products collection that the user selects
    // from the dropdown
    //
    $scope.searchme = function() {
        console.log('inside searchctrl');

        console.log(document.getElementById("chosenProduct").value);
        var dataStore = $kinvey.DataStore.getInstance('products', $kinvey.DataStoreType.Network);

        var query = new $kinvey.Query();
        query.equalTo('title', document.getElementById("chosenProduct").value);
        dataStore.find(query).subscribe(function(result) {
            var thisproduct = result;
            console.log(thisproduct);
            $scope.thisproduct = thisproduct;
            $scope.$digest();
            return;
        });
    };
})

.controller('InsertTicketCtrl', function($scope, $kinvey, $ionicLoading, $cordovaFile) {

    $scope.taskInfo = {
        myfile: "",
        savedurl: ""
    }

    //$scope.fileAnalysis = {};

    $scope.reportMe = function() {
        console.log('reportme');
        console.log($scope.taskInfo.savedurl);

        // post filename to custom endpoint
        //
        var promise = $kinvey.CustomEndpoint.execute('analyzeImage', {
            filename: $scope.taskInfo.savedurl
        });
        promise.then(function(response) {
            console.log('here');
            console.log(response[0]);
            console.log(response[0].labelAnnotations);
            var myannotations = response[0].labelAnnotations;

            if (response[0].faceAnnotations != null) {
                var faceannotations = response[0].faceAnnotations;

                var joyLikelihood = faceannotations[0].joyLikelihood;
                var angerLikelihood = faceannotations[0].angerLikelihood;
                var sorrowLikelihood = faceannotations[0].sorrowLikelihood;
                var surpriseLikelihood = faceannotations[0].surpriseLikelihood;

                var myemotions = "EMOTIONS:";

                if (joyLikelihood == "VERY_UNLIKELY" || joyLikelihood == "UNKNOWN") {
                    joyLikelihood = false;
                } else {
                    joyLikelihood = true;
                    myemotions = myemotions + " HAPPY";
                }

                if (angerLikelihood == "VERY_UNLIKELY" || angerLikelihood == "UNKNOWN") {
                    angerLikelihood = false;
                } else {
                    angerLikelihood = true;
                    myemotions = myemotions + " ANGRY";
                }

                if (sorrowLikelihood == "VERY_UNLIKELY" || sorrowLikelihood == "UNKNOWN") {
                    sorrowLikelihood = false;
                } else {
                    sorrowLikelihood = true;
                    myemotions = myemotions + " SAD";
                }

                if (surpriseLikelihood == "VERY_UNLIKELY" || surpriseLikelihood == "UNKNOWN") {
                    surpriseLikelihood = false;
                } else {
                    surpriseLikelihood = true;
                    myemotions = myemotions + " SURPRISE";
                }


                console.log(joyLikelihood);
                console.log(angerLikelihood);
                console.log(sorrowLikelihood);
                console.log(surpriseLikelihood);

                console.log(faceannotations);
            }

            if (response[0].textAnnotations != null) {

            }
            var dataArray = new Array;

            for (var o in myannotations) {
                dataArray.push(myannotations[o].description);
            }

            var photoLabels = dataArray.join(", ");
            photoLabels = "ANALYSIS:  " + photoLabels;

            if (myemotions && myemotions.length > 9) {
                photoLabels = photoLabels + "\n\n" + myemotions;
            }

            if (response[0].textAnnotations != null) {
                photoLabels = photoLabels + "<br>TEXT: " + response[0].textAnnotations[0].description;
            }
            console.log(photoLabels);

            console.log(dataArray);
            $ionicLoading.show({
                template: photoLabels,
                noBackdrop: true,
                duration: 5000
            });

            $scope.fileAnalysis = response[0];
        }).catch(function(err) {
            console.log(err);
        });

    }

    $scope.insertme = function() {
        console.log($scope.taskInfo.myfile);

        var fileUri = $scope.taskInfo.myfile;

        if (fileUri != "") {

            window.resolveLocalFileSystemURL(fileUri,
                function(fileEntry) {
                    fileEntry.file(function(file) {
                        console.log(file);

                        var reader = new FileReader();
                        var myindex = $scope.taskInfo.myfile.lastIndexOf('/') + 1;
                        var mystring = $scope.taskInfo.myfile.substring(myindex);

                        reader.onload = function(event) {
                            console.log('onload');;
                            console.log(event);
                        }

                        reader.onloadend = function(event) {
                            console.log('onloadend');
                            var imagedata = event.target._result;
                            console.log(imagedata.byteLength);
                            var metadata = {
                                filename: "ServicePic.jpg",
                                mimeType: "image/jpeg",
                                size: imagedata.byteLength,
                                public: true
                            };
                            console.log(event);

                            var promise = $kinvey.Files.upload(imagedata, metadata)
                                .then(function(myfile) {
                                    console.log(myfile);
                                    var promise = $kinvey.Files.stream(myfile._id)
                                        .then(function(file) {
                                            console.log(file);
                                            $scope.taskInfo.savedurl = file._downloadURL;

                                        })
                                        .catch(function(error) {
                                            console.log(error);
                                        });

                                })
                                .catch(function(error) {
                                    console.log(error);
                                });
                        };

                        reader.readAsArrayBuffer(file);
                    });
                }
            );
        }

        // insert task
        //
        var mytask = document.getElementById("task").value;
        document.getElementById("task").value = "";
        console.log(mytask);

        var myduedate = document.getElementById("duedate").value;
        console.log(duedate);
        document.getElementById("duedate").value = "";



        var mycomplete = document.getElementById("completed").checked;
        console.log(mycomplete);


        var complete = false;
        if (mycomplete == true) {
            complete = true;
        } else {
            complete = false;
        }


        var data = {};

        data.action = mytask;
        data.duedate = myduedate;
        data.completed = complete;
        data.class = "personal";
        data.Title = "Personal Task";
        data.savedpic = $scope.taskInfo.savedurl;
        console.log(JSON.stringify(data));

        var dataStore = $kinvey.DataStore.getInstance('tasks', $kinvey.DataStoreType.Network);

        dataStore.save(data).then(function(result) {
            console.log(result);
        }).catch(function(error) {
            console.log(error);
        });

        $ionicLoading.show({
            template: 'task inserted',
            noBackdrop: true,
            duration: 2000
        });
    }

    $scope.picMe = function() {
        console.log('saving picture');

        if(!navigator.camera) alert('No camera available.')

        navigator.camera.getPicture(onSuccess, onFail, {
            quality: 50,
            destinationType: Camera.DestinationType.FILE_URI
        });

        function onSuccess(imageURI) {
            var image = document.getElementById('myImage');
            image.src = imageURI;
            $scope.taskInfo.myfile = imageURI;
            console.log(imageURI);
            // now you need to write this back
        }

        function onFail(message) {
            alert('Failed because: ' + message);
        }
    }
})


.controller('ProductCtrl', function($scope, $kinvey) {

    var dataStore = $kinvey.DataStore.getInstance('products', $kinvey.DataStoreType.Network);

    // grab all products for display on the Products tab
    //
    $scope.$on('$ionicView.beforeEnter', function() {

        console.log('inside productctrl');

        dataStore.find().subscribe(function(result) {
            var products = result;
            console.log(products);
            $scope.products = products;
            $scope.$digest();
        });
    });

    $scope.doRefresh = function() {
        console.log('refresh');
        dataStore.find().subscribe(function(result) {
            var products = result;
            console.log(products);
            $scope.products = products;
            $scope.$digest();
        });
        $scope.$broadcast('scroll.refreshComplete');
    }
})

.controller('PatientCtrl', function($scope, $kinvey, $state, $rootScope) {

    // integrates with redox to pull patient data
    // Use:  Timothy Bixby or Barbara Bixby
    // NOTE:  Prescriptions returned will be the same for all patients
    //

    console.log('inside patientctrl');

    $scope.patient = {
        _id: "",
        MaritalStatus: "",
        FirstName: "",
        LastName: "",
        DOB: "",
        Nickname: "",
        SSN: "",
        Sex: ""
    };

    var patientStore = $kinvey.DataStore.getInstance('patients', $kinvey.DataStoreType.Network);
    var drugStore = $kinvey.DataStore.getInstance('clinicalsummary', $kinvey.DataStoreType.Network);

    $scope.searchme = function() {
        console.log('inside searchme');

        console.log($scope.patient.FirstName);
        console.log($scope.patient.LastName);

        var query = new $kinvey.Query();
        query.equalTo('FirstName', $scope.patient.FirstName)
            .equalTo('LastName', $scope.patient.LastName);
        //.equalTo('DOB',$scope.patient.DOB);
        patientStore.find(query).subscribe(function(models) {
            console.log("subscribe fired " + JSON.stringify(models));
            if (models.length == 1) {
                console.log("updating view");
                $scope.patient = models[0];
                $scope.$digest();
            } else {
                alert("no results found, please specify FirstName, LastName")
            }
        }, function(err) {
            console.log("err " + JSON.stringify(err));
        }, function(res) {
            console.log("subscribe complete");
        });
    }

    $scope.admitme = function(patient) {
        console.log('inside admitme');
        console.log(patient);

        patientStore.save({
            eventType: "Arrival",
            _id: $scope.patient._id
        }).then(function(models) {
            console.log("success " + JSON.stringify(models));
            $scope.status = "Admitted (" + models[0].Message + ")";
            $scope.$digest();
            alert("Admission successful, confirmation# = " + models[0].Message)
        }, function(err) {
            console.log("err " + JSON.stringify(err));
        });
    }

    $scope.drugme = function(patient) {
        console.log('inside drugme');
        console.log(patient);

        var query = new $kinvey.Query();
        query.equalTo('FirstName', 'Matthew')
            .equalTo('LastName', 'DeLacey');

        drugStore.find(query).subscribe(function(models) {
            console.log(models);
            //set drug info in global scope
            $rootScope.mydrugs = models[0].Medications;

            $state.go('menu.drugs');
            console.log('should have moved');
        }, function(err) {
            console.log("err " + JSON.stringify(err));
        });
    }

})



.controller('ProjectsCtrl', function($scope, $kinvey) {

    // syncs with the tasks list collection
    //
    $scope.doRefresh = function() {
        console.log('tasksrefresh');
        //TODO: LAB: Use a sync store to synchronize tasks data
    }

    $scope.$on('$ionicView.beforeEnter', function() {
        console.log('tasks load view');
        //TODO: LAB: Use a sync store to pull latest tasks data

    })
})

.controller('RefCtrl', function($scope, $kinvey) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    $scope.doRefreshRef = function() {
        console.log('ref refresh view');
        //TODO: LAB: Use a file store to download files

    }

    $scope.$on('$ionicView.beforeEnter', function() {
        console.log('ref load view');

        //TODO: LAB: Use a file store to download files

    });
})

.controller('PartnerDetailCtrl', function($scope, $kinvey, $stateParams) {
    // if you click on a partner on the partner menu, this will do a join to the invoice 
    // menu and pull up additional detaiil. 
    // NOTE:  not all Accounts have a detail record, look in the Invoices collection
    // at a field called AccountID which maps to the _id in accounts collection
    //
    console.log('inside partnerdetailctrl');
    console.log($stateParams.partnerId);

    var dataStore = $kinvey.DataStore.getInstance('accounts', $kinvey.DataStoreType.Network);

    dataStore.findById($stateParams.partnerId).subscribe(function(result) {

        console.log(result);
        $scope.invoices = result.invoice;
        $scope.$digest();
    });
})



.controller('OfflineCtrl', function($scope, $kinvey, $ionicLoading) {
    console.log('inside offline ctrl');

    $scope.autoCreate = function(n) {
        var tasks = [];
        for (var i = 0; i < n; i++) {
            const task = {
                "accountname": "Account #" + i,
                "accountcompany": "Company #" + i,
                "autogen": true,
                "Title": "Sync Data"
            }
            tasks.push(task);
        }
        console.log(tasks);
        saveToStore(tasks);
    }

    var dataStore = $kinvey.DataStore.getInstance('accounts', $kinvey.DataStoreType.Sync);

    function saveToStore(data) {
        //save the task to the store
        dataStore.save(data).then(function(result) {
            console.log(result);
            //render(result);
            console.log(data);
            $scope.accounts = $scope.accounts.concat(result);
            $scope.$digest();
            $ionicLoading.show({
                template: '' + data.length + ' task(s) inserted',
                noBackdrop: true,
                duration: 2000
            });

        }).catch(function(error) {
            console.log(error);
        });
    }

    $scope.syncme = function() {
        console.log('syncme');
        dataStore.sync().then(function(result) {
            console.log(result);
            console.log('pull = ');
            console.log(result.pull);
            console.log('push=');
            console.log(result.push);
            $scope.servicetechs = result.pull;
            $scope.$digest();
        }).catch(function(error) {
            console.log(error);
        });
    }

    $scope.deltame = function() {
        console.log('deltame');
        //dataStore.useDeltaFetch = true;
        dataStore.pull(null, { useDeltaFetch: true }).then(function(result) {
            console.log(result);
            /*console.log('pull = ');
            console.log(result.pull);
            console.log('push=');
            console.log(result.push);*/
            $scope.accounts = result;
            $scope.$digest();
        }).catch(function(error) {
            console.log(error);
        });

    }

    $scope.$on('$ionicView.beforeEnter', function() {
        console.log('offline load view');
        var dataStore = $kinvey.DataStore.getInstance('accounts', $kinvey.DataStoreType.Sync);
        dataStore.pull().then(function(result) {
            console.log(result);
            $scope.accounts = result;
            $scope.$digest();
        });

    });

    function render(result) {
        const resultArr = [].concat(result);
        $ionicLoading.show({
            template: '' + resultArr.length + ' task(s) inserted',
            noBackdrop: true,
            duration: 2000
        });
        $scope.$digest();
    }

})



.controller('PartnerCtrl', function($scope, $kinvey) {

    $scope.doRefresh = function() {
        console.log('refresh');

        //TODO: LAB: Use a network store to get latest accounts data
    }

    $scope.$on('$ionicView.beforeEnter', function() {
        console.log('accounts load view');
        //TODO: LAB: Use a network store to get latest accounts data

    })
})



.controller('BrandCtrl', function($scope, $kinvey) {

    $scope.doRefreshBrand = function() {
        console.log('refresh brand');
        $kinvey.DataStore.find('brand').then(function(mybrand) {
            console.log(mybrand);
            $scope.mybrand = mybrand;
        });
    }

    $scope.$on('$ionicView.beforeEnter', function() {
        console.log('partner load view');
        $kinvey.DataStore.find('brand').then(function(brand) {
            console.log(brand);
            $scope.mybrand = brand;
        });
    });

})

.controller('DrugCtrl', function($scope, $state, $kinvey, $rootScope) {
    console.log('inside DrugCtrl');
    console.log($rootScope.mydrugs);
    $scope.drugs = $rootScope.mydrugs;
})



.controller('MenuCtrl', function($scope, $kinvey, $ionicSideMenuDelegate, $ionicModal) {
    console.log('inside menuctrl');
    $scope.toggleLeft = function() {
        console.log('inside toggleleft');
        $ionicSideMenuDelegate.toggleLeft();
    };

    $ionicModal.fromTemplateUrl('templates/modal.html', function(modal) {
        $scope.modal = modal;
    }, {
        animation: 'slide-in-up'
    });
})



.controller('HomeCtrl', function($scope, $kinvey, $ionicSideMenuDelegate, $rootScope, $state) {
    console.log('home');

    $scope.$on('$ionicView.beforeEnter', function() {
        // we're authenticated, grab logo and color scheme
        console.log('home');
        var query = new $kinvey.Query();
        query.equalTo('ActiveBrand', true);
        var activeUser = $kinvey.User.getActiveUser();

        if (!activeUser) {
            // activeUser is null, go to account tab
            $state.go('menu.tabs.account');
            return;
        }
        console.log(activeUser);

        var dataStore = $kinvey.DataStore.getInstance('DemoBrandingData', $kinvey.DataStoreType.Network);


        dataStore.find().subscribe(function(result) {
            console.log(result);
            var brand = result;
            console.log(brand);
            $rootScope.primarycolor = brand[0].PrimaryColor;

            if (brand[0].LogoFileName.indexOf('http') == -1) {
                console.log('local path');
                brand[0].LogoFileName = "img/" + brand[0].LogoFileName;
            }
            $rootScope.logo = brand[0].LogoFileName;
            $rootScope.screenText = brand[0].HomeScreenText;
            $rootScope.textColor = brand[0].PrimaryTextColor;
            $rootScope.customer = brand[0].CustomerName;
            $rootScope.accountsname = brand[0].AccountsName;
            $rootScope.tasksname = brand[0].TasksName;
            $rootScope.addtaskname = brand[0].AddTaskName;
            $rootScope.calcname = brand[0].CalculatorName;
            $rootScope.productsname = brand[0].ProductsName;
            $scope.$digest();
        });
    });
})



.controller('AccountCtrl', function($scope, $state, $kinvey, $cordovaPush, $http, $ionicLoading) {
    $scope.userData = {
        email: "",
        password: ""
    };

    $scope.validateUserKinvey = function() {

        console.log($scope.userData.email);

        //TODO: LAB: Login with a Kinvey basic user
        promise.then(
            function(response) {
                // Kinvey login finished with success
                $scope.submittedError = false;
                console.log('logged in with KinveyAuth2');
                $state.go('menu.tabs.home');
                //TODO: LAB: register for push notifications
            }).catch(
            function(error) {
                //Kinvey login finished with error
                $scope.submittedError = true;
                $scope.errorDescription = error.description;
                console.log(error);

                if (error.name == "InsufficientCredentialsError") {
                    console.log('insufficient credentials');
                }
                $ionicLoading.show({
                    template: error.message,
                    noBackdrop: true,
                    duration: 2000
                });
                console.log("Error login " + error.description); //
            });
    };



    $scope.validateUser = function() {
        console.log('login user');

        var user = new $kinvey.User();
        //TODO: LAB: login with Mobile Identity Connect
        promise.then(function(user) {
            console.log('logged in');
            $scope.submittedError = false;
            console.log(user);
            //TODO: LAB: register for push notifications
        }).catch(function(error) {
            console.log(error);
            return null;
        }).then(function() {
            $state.go('menu.tabs.home');
        }, function(err) {
            console.log("error logging in");
            $scope.submittedError = true;
            $scope.errorDescription = err.description;
            console.log(err);
            console.log("Error login " + err.description);
            $state.go('menu.tabs.account');
        });
    }

    $scope.signUp = function() {

        console.log($scope.userData.email);
        console.log($scope.userData.password);

        if ($scope.userData.email == "" || $scope.userData.password == '') {
            $ionicLoading.show({
                template: "Please fill out username and password",
                noBackdrop: true,
                duration: 2000
            });
            return;
        }

        //TODO: LAB: Signup a new Kinvey User
        console.log("signup promise");
        promise.then(
            function() {
                //Kinvey signup finished with success
                $scope.submittedError = false;
                console.log("signup success");
                $state.go('menu.tabs.home');
            },
            function(error) {
                //Kinvey signup finished with error
                $scope.submittedError = true;
                $scope.errorDescription = error.description;
                console.log(error);
                $ionicLoading.show({
                    template: error.message,
                    noBackdrop: true,
                    duration: 2000
                });
            }
        );
    };

    $scope.logout = function() {
        console.log('logout user2');
        //Kinvey logout starts

        //TODO: LAB: Unregister for push notifications
        //TODO: LAB: Logout the active user

        $ionicLoading.show({
            template: "User logged out",
            noBackdrop: true,
            duration: 2000
        });
    }
});