// SERVIÇOS QUE CHAMAM O BACK-END
app.factory("historicoViagensService", ['$http', 'toaster', function ($http, toaster) {
    var serviceBase = 'service/historicoViagens/';
    var obj = {};

    obj.toast = function (data) {
        toaster.pop(data.status, "", data.message, 10000, 'trustedHtml');
    };
    // CHAMADA SERVICO DE LISTAGEM
    obj.getViagens = function (obj) {
        return $http.get(serviceBase + 'viagens?id=' + obj.id + '&dias=' + obj.dias);
    }

    return obj;
}]);
// CONTROLER DE LISTAGEM
app.controller('historicoViagensCtrl', function ($scope, $route, loginService, historicoViagensService, $interval, $location) {
    loginService.get('session').then(function (results) {

        if (results.id) {
            $scope.SecaoCliente = {
                id: results.id,
                nome: results.nome,
                email: results.email
            };
        }
        $scope.dias = 7;
        $scope.buscarViagens = function () {
            var objEnvio = {
                id: $scope.SecaoCliente.id,
                dias: $scope.dias
            };
            historicoViagensService.getViagens(objEnvio).then(function (data) {
                $scope.viagens = data.data;
            });
        };
        $scope.buscarViagens();
    });
});
