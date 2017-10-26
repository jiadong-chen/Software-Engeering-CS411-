angular.module('cs411', ['ngRoute', 'ngCookies'])
    .directive('nameDisplay', function () {
        return {
            scope: true,
            restrict: 'EA',
            template: "<b>This can be anything {{name}}</b>"
        }
    })
    .controller('cs411ctrl', function ($scope, $http, $cookies) {

        //CREATE (POST)
        $scope.createUser = function () {
            if ($scope.dbID) {
                $scope.updateUser($scope.dbID)
            }
            else {
                const request = {
                    method: 'post',
                    url: 'http://localhost:3000/api/db',
                    data: {
                        name: $scope.name,
                        UID: $scope.UID,
                        // department: $scope.department
                    }
                }
                $http(request)
                    .then(function (response) {
                            $scope.inputForm.$setPristine()
                            $scope.name = $scope.UID = $scope.department = ''
                            $scope.getUsers()
                            console.log(response)
                        },
                        function (error) {
                            if (error.status === 401) {
                                $scope.authorized = false
                                $scope.h2message = "Not authorized to add "
                                console.log(error)
                            }
                        }
                    )
            }
        }

        //get geolocations of place entered through geocode api
        $scope.getgeo = function (input1, input2,_id) {
            $scope.twitter = false
            $http.get('http://localhost:3000/api/geocode/' + input1)
                .then(function (response) {
                    //toggle of showing the coordinates
                    $scope.showgeo = !$scope.showgeo
                    //setting our flag coordinates for future use
                    $scope.flag = response.data
                    $scope.flaglat = $scope.flag.lat
                    $scope.flaglng = $scope.flag.lng

                })
        }

        //searching for nearby restaurants within 1000 meters
        $scope.ressearch = function (input) {
            $http.get('http://localhost:3000/api/ressrc/' + input)
                .then(function (response) {
                    //toggle of showing the coordinates
                    $scope.showres = !$scope.showres
                    let result = response.data.results
                    $scope.resresult = result
                })
        }

        //setting up the search about a certain place
        $scope.plcsrc = function (input) {
            $http.get('http://localhost:3000/api/plcsrc/'+input)
                .then(function (response) {
                    //toggle of showing the filter
                    $scope.showplcsrc = !$scope.showplcsrc
                    let result = response.data.results
                    $scope.plcsrcresult = result
                })
        }

        //setting up google search of the place entered
        $scope.googlesearch = function (input) {
            $scope.google = false
            $scope.twitter = true
            $http.get('http://localhost:3000/api/googlesearch/'+input)
                .then(function (response) {
                    //toggle for showing
                    let result = response.data.links
                    $scope.showg = !$scope.showg
                    $scope.gresult = result
                })
        }



        //READ (GET)
        $scope.getUsers = function () {
            $http.get('http://localhost:3000/api/db')
                .then(function (response) {
                    $scope.users = response.data

                })
        }
        //UPDATE (PUT)
        $scope.setUserUpdate = function (user) {
            $scope.buttonMessage = "Update"
            $scope.h2message = "Updating "
            $scope.name = user.name
            $scope.UID = user.UID
            $scope.dbID = user._id
            // $scope.department = user.department

        }
        $scope.updateUser = function (userID) {
            const request = {
                method: 'put',
                url: 'http://localhost:3000/api/db/' + userID,
                data: {
                    name: $scope.name,
                    UID: $scope.UID,
                    // department: $scope.department,
                    _id: userID
                }
            }
            $http(request)
                .then(function (response) {
                    $scope.inputForm.$setPristine()
                    $scope.name = $scope.UID = $scope.department = ''
                    $scope.h2message = "Add user"
                    $scope.buttonMessage = "Add User"
                    $scope.getUsers()
                    $scope.dbID = null
                })

        }

        //DELETE (DELETE)
        $scope.deleteUser = function (_id) {

            const request = {
                method: 'delete',
                url: 'http://localhost:3000/api/db/' + _id,
            }
            $http(request)
                .then(function (response) {
                        $scope.inputForm.$setPristine()
                        $scope.name = $scope.UID = $scope.department = ''
                        $scope.getUsers()
                    }
                )
        }

        $scope.initApp = function ( ) {
            $scope.buttonState = "create"
            $scope.h2message = "Add user"
            $scope.buttonMessage = "Add User"
            $scope.authorized = false
            $scope.showLogin = false
            $scope.showcrim = false
            $scope.showres = false
            $scope.showgeo = false
            $scope.showg = false
            $scope.showres = false
            $scope.showplcsrc = false
            $scope.getUsers()
            //Grab cookies if present
            let authCookie = $cookies.get('authStatus')
            $scope.authorized = !!authCookie
        }





    })
    .config(['$routeProvider',
        function ($routeProvider) {
            $routeProvider
                .when('/:status', {
                    templateUrl: '',
                    controller: 'authController'
                })
                .when(':status', {
                    templateUrl: '',
                    controller: 'authController'
                })
                .otherwise({
                    redirectTo: '/'
                })
        }])





    //This controller handles toggling the display of details in the user list
    .controller('listController', function ($scope) {
        $scope.display = false

        $scope.showInfo = function () {
            $scope.display = !$scope.display
        }
    })
