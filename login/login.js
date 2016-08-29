// SERVIÇOS QUE CHAMAM O BACK-END
app.factory("loginService", ['$http', 'toaster', function ($http, toaster) {
    var serviceBase = 'service/login/v1/';
    var obj = {};

    obj.toast = function (data) {
        toaster.pop(data.status, "", data.message, 10000, 'trustedHtml');
    };

    obj.get = function (q) {
        return $http.get(serviceBase + q).then(function (results) {
            return results.data;
        });
    };
    obj.post = function (q, object) {
        return $http.post(serviceBase + q, object).then(function (results) {
            return results.data;
        });
    };
    obj.put = function (q, object) {
        return $http.put(serviceBase + q, object).then(function (results) {
            return results.data;
        });
    };
    obj.delete = function (q) {
        return $http.delete(serviceBase + q).then(function (results) {
            return results.data;
        });
    };


    return obj;
}]);
app.controller('loginCtrl', function ($scope, $rootScope, $routeParams, $location, $http, loginService) {
    //initially set those objects to null to avoid undefined error
    $scope.login = {};
    $scope.signup = {};
    $scope.doLogin = function (login) {
        console.log(login);
        loginService.post('login', {
            pessoa: login
        }).then(function (results) {
            loginService.toast(results);
            if (results.status == "success") {
                $location.path('viagem');
            }
        });
    };

    $scope.signup = { celular: '', cpf: '', data_nascimento: '', email: '', foto: '', nome: '', senha: '', senha2: '', sobrenome: '' };
    $scope.signUp = function (pessoa) {
        pessoa.cpf = pessoa.cpf.replace('.','');
        pessoa.cpf = pessoa.cpf.replace('.','');
        pessoa.cpf = pessoa.cpf.replace('-','');
        pessoa.celular = pessoa.celular.replace('(','');
        pessoa.celular = pessoa.celular.replace(')','');
        pessoa.celular = pessoa.celular.replace('-','');
        pessoa.celular = pessoa.celular.replace(' ','');
        loginService.post('signUp', {
            pessoa: pessoa
        }).then(function (results) {
            loginService.toast(results);
            if (results.status == "success") {
                $location.path('login');
            }
        });
    };
    $scope.logout = function () {
        loginService.get('logout').then(function (results) {
            loginService.toast(results);
            $location.path('login');
        });
    }
});