// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js

var onNotificationCallback = function(notification) {
  alert(notification.message);
};

angular.module('starter', ['ionic', 'kinvey', 'starter.controllers', 'ngIOS9UIWebViewPatch', 'ngCordova'])

.run(function($ionicPlatform, $kinvey, $rootScope, $state, $location) {

    $rootScope.primarycolor = "#D44B2B";
    $rootScope.productsname = "Products";
    determineBehavior($kinvey, $rootScope, $state);

    
    if ($kinvey.User.getActiveUser()) {
        $kinvey.Push.register();
    }

    $kinvey.Push.onNotification(onNotificationCallback);
    

    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleLightContent();
        }

        try {
        navigator.geolocation.getCurrentPosition(function(loc) {
            console.log('getting position');
            var coord = [loc.coords.latitude, loc.coords.longitude];
            console.log(coord);
            $rootScope.current_loc = coord;
        });
    } catch (evt) {
        alert('fail' + evt.message);
    }

        /*$kinvey.Push.onNotification(function(notification) {
      alert(notification.message);
    });*/
        
    });
})




.config(function($stateProvider, $urlRouterProvider, $kinveyProvider, $ionicConfigProvider, $sceDelegateProvider) {


    $sceDelegateProvider.resourceUrlWhitelist([
       // Allow same origin resource loads.
       'self',
       // Allow loading from our assets domain.  Notice the difference between * and **.
       'http://storage.googleapis.com/**',
       'https://docs.google.com/**']);
    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $ionicConfigProvider.tabs.position('bottom');

    //TODO: LAB: initialize the Kinvey SDK

    $stateProvider
        .state('menu', {
            url: "/menu",
            abstract: true,
            templateUrl: "templates/menu.html",
            controller: 'MenuCtrl'
        })

    .state('menu.tabs', {
        url: "/tab",
        views: {
            'menuContent': {
                templateUrl: "templates/tabs.html"
            }
        }
    })

    // setup an abstract state for the tabs directive
    .state('tab', {
        url: "/tab",
        abstract: true,
        templateUrl: "templates/tabs.html"
    })

    // Each tab has its own nav history stack:

    .state('menu.tabs.home', {
        url: '/home',
        views: {
            'tab-home': {
                templateUrl: 'templates/home.html',
                controller: 'HomeCtrl'
            }
        }
    })


    .state('menu.projects', {
        url: '/projects',
        views: {
            'menuContent': {
                templateUrl: 'templates/projects.html',
                controller: 'ProjectsCtrl'
            }
        }
    })

    .state('menu.partner', {
        url: '/partner',
        views: {
            'menuContent': {
                templateUrl: 'templates/partners.html',
                controller: 'PartnerCtrl'
            }
        }
    })

    .state('menu.partner-detail', {
        url: '/partner/:partnerId',
        views: {
            'menuContent': {
                templateUrl: 'templates/partner-detail.html',
                controller: 'PartnerDetailCtrl'
            }
        }
    })

    .state('menu.ref', {
        url: '/ref',
        views: {
            'menuContent': {
                templateUrl: 'templates/ref.html',
                controller: 'RefCtrl'
            }
        }
    })


    .state('menu.brand', {
        url: '/brand',
        views: {
            'menuContent': {
                templateUrl: 'templates/brand.html',
                controller: 'BrandCtrl'
            }
        }
    })


    .state('menu.newticket', {
        url: "/newticket",
        views: {
            'menuContent': {
                templateUrl: "templates/newticket.html",
                controller: 'InsertTicketCtrl'
            }
        }
    })

    .state('menu.geo', {
        url: "/geo",
        views: {
            'menuContent': {
                templateUrl: "templates/map.html",
                controller: 'MapCtrl'
            }
        }
    })

      .state('menu.patient', {
        url: "/patient",
        views: {
            'menuContent': {
                templateUrl: "templates/patient.html",
                controller: 'PatientCtrl'
            }
        }
    })

      .state('menu.drugs', {
      url: '/drugs',
      views: {
        'menuContent': {
          templateUrl: 'templates/drugs.html',
          controller: 'DrugCtrl'
        }
      }
    })


.state('menu.places', {
        url: "/places",
        views: {
            'menuContent': {
                templateUrl: "templates/places.html",
                controller: 'PlacesCtrl'
            }
        }
    })



    .state('menu.tabs.products', {
        url: '/products',
        views: {
            'tab-products': {
                templateUrl: 'templates/products.html',
                controller: 'ProductCtrl'
            }
        }
    })

      .state('menu.offline', {
        url: '/offline',
        views: {
            'menuContent': {
                templateUrl: 'templates/offline.html',
                controller: 'OfflineCtrl'
            }
        }
    })

    .state('menu.tabs.search', {
        url: '/search',
        views: {
            'tab-search': {
                templateUrl: 'templates/search.html',
                controller: 'SearchCtrl'
            }
        }
    })

    .state('menu.video', {
      url: '/video/:videoId',
      views: {
        'menuContent': {
          templateUrl: 'templates/myvideo.html',
          controller: 'MyVideoCtrl'
        }
      }
    })



    .state('menu.tabs.account', {
        url: '/account',
        views: {
            'tab-account': {
                templateUrl: 'templates/tab-account.html',
                controller: 'AccountCtrl'
            }
        }
    });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('menu/tab/home');

});





//function selects the desired behavior depending on whether the user is logged or not
function determineBehavior($kinvey, $rootScope, $state, $scope) {
    //var activeUser = new $kinvey.User();
    //activeUser = activeUser.getActiveUser();
console.log( 'INSIDE DETERMINEBEHAVIOR');
    //console.log( activeUser );
    console.log("$state.current.name: " + $state.current.name);
    var activeUser = $kinvey.User.getActiveUser();

    if (!activeUser) {
      console.log("activeUser null redirecting");
      if ($state.current.name != 'menu.tab.account') {
          $state.go('menu.tabs.account');
      }
      return;
    } else {
      //we have an active user
      console.log("activeUser not null");
      $state.go('menu.tabs.home', null, {reload:true});
    
  }
}