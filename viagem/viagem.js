// SERVIÇOS QUE CHAMAM O BACK-END
app.factory("viagemService", ['$http', 'toaster', function ($http, toaster) {
    var serviceBase = 'service/viagem/';
    var serviceBaseCidade = 'service/cidade/';
    var obj = {};

    obj.toast = function (data) {
        toaster.pop(data.status, "", data.message, 10000, 'trustedHtml');
    };
    // CHAMADA SERVICO DE LISTAGEM
    obj.getCidades = function () {
        return $http.get(serviceBaseCidade + 'cidades');
    }
    // CHAMADA SERVICO DE CALCULO TARIFA
    obj.calcularTarifa = function (viagem) {
        return $http.get(serviceBase + 'calcularTarifa?cidadePartida=' + viagem.cidadePartida + '&distancia=' + viagem.distancia);
    }
    obj.statusViagem = function (id) {
        return $http.get(serviceBase + 'statusViagem?id=' + id);
    };
    obj.consultaPagamento = function (obj) {
        return $http.get(serviceBase + 'consultaPagamento?idCliente=' + obj.idCliente + '&idSolicitacao=' + obj.idSolicitacao);
    };
    obj.confirmaPagamento = function (obj) {
        return $http.get(serviceBase + 'confirmaPagamento?idCliente=' + obj.idCliente + '&idSolicitacao=' + obj.idSolicitacao + '&status=' + obj.status);
    };
    // CHAMADA SERVICO DE LOCALIZAR MOTORISTA
    obj.localizaMotorista = function (id) {
        return $http.get(serviceBase + 'localizaMotorista?id=' + id);
    }
    // CHAMADA SERVICO DE CANCELAMENTO
    obj.cancelarViagem = function (id) {
        return $http.get(serviceBase + 'cancelarViagem?id=' + id);
    }
    // CHAMADA SERVICO QUE SALVA EDIÇAO OU INSERSAO
    obj.solicitar = function (viagem) {
        return $http.post(serviceBase + 'solicitar', { viagem: viagem });
    };
    obj.avaliarViagem = function (obj) {
        return $http.get(serviceBase + 'avaliarViagem?id=' + obj.idSolicitacao + '&nota=' + obj.nota);
    };

    return obj;
}]);
// CONTROLER DE LISTAGEM
app.controller('viagemCtrl', function ($scope, ngAudio, $route, loginService, viagemService, $interval, $location) {
    loginService.get('session').then(function (results) {
        $scope.audioChegada = ngAudio.load('assets/audio/chegada.mp3');
        $scope.audioCancelado = ngAudio.load('assets/audio/cancelado.mp3');
        $scope.audioAceitou = ngAudio.load('assets/audio/aceitou.mp3');
        $scope.ponto = false;
        if (results.id) {
            $scope.SecaoCliente = {
                id: results.id,
                nome: results.nome,
                email: results.email
            };
            $scope.mostrou = false;
            $scope.mapeado = false;
            $scope.viagem = {};
            $scope.viagem.pontoReferencia = '';
            function activate() {
                var map;
                var directionsDisplay;
                var directionsService = new google.maps.DirectionsService();
                function initialize() {
                    var styles = [
                        {
                            "stylers": [
                                { "hue": "#000000" },
                                { "invert_lightness": false },
                                { "saturation": -100 },
                                { "lightness": 10 },
                                { "gamma": 1 }
                            ]
                        }
                    ];
                    var styledMap = new google.maps.StyledMapType(styles,
                        { name: "Styled Map" });
                    directionsDisplay = new google.maps.DirectionsRenderer();
                    var latlng = new google.maps.LatLng(-18.8800397, -47.05878999999999);

                    var options = {
                        zoom: 5,
                        center: latlng,
                        mapTypeId: google.maps.MapTypeId.ROADMAP,
                        mapTypeControlOptions: {
                            mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
                        }
                    };

                    map = new google.maps.Map(document.getElementById("mapa"), options);
                    directionsDisplay.setMap(map);

                    map.mapTypes.set('map_style', styledMap);
                    map.setMapTypeId('map_style');
                }
                initialize();
                $scope.mostraCaminho = function () {
                    for (var i = 0; i < $scope.enderecoPartida.address_components.length; i++) {
                        for (var j = 0; j < $scope.enderecoPartida.address_components[i].types.length; j++) {
                            if ($scope.enderecoPartida.address_components[i].types[j] == 'administrative_area_level_2') {
                                var cidadePartida = $scope.enderecoPartida.address_components[i].long_name;
                                // return;
                            }
                        }
                    }
                    var enderecoPartida = $scope.enderecoPartida.formatted_address;
                    if ($scope.enderecoDestino == '') {
                        var enderecoChegada = enderecoPartida;
                    } else {
                        var enderecoChegada = $scope.enderecoDestino.formatted_address;
                    }
                    var request = {
                        origin: enderecoPartida,
                        destination: enderecoChegada,
                        travelMode: google.maps.TravelMode.DRIVING
                    };
                    directionsService.route(request, function (result, status) {
                        console.log(result);
                        var distanciaText = result.routes[0].legs[0].distance.text;
                        var distancia = result.routes[0].legs[0].distance.value;
                        $scope.distanciaText = distanciaText;
                        var objEnvio = {
                            cidadePartida: cidadePartida,
                            distancia: distancia
                        };
                        $scope.distancia = distancia;
                        viagemService.calcularTarifa(objEnvio).then(function (response) {
                            $scope.tarifa = response.data[0].tarifa;
                            $scope.idResult = response.data[0].idResult;
                            $scope.result = response.data[0].result;
                            $scope.servico = response.data[0].servico;
                        });
                        if (status == google.maps.DirectionsStatus.OK) {
                            directionsDisplay.setDirections(result);
                        }
                    });
                };
            }
            activate();

            $scope.calcularTarifa = function (viagem) {
                $scope.mostraCaminho();

            };



            $scope.solicitar = function () {
                if ($scope.enderecoDestino) {
                    var endDestino = $scope.enderecoDestino.formatted_address;
                } else {
                    var endDestino = '';
                }
                var objEnvioFinal = {
                    id: $scope.SecaoCliente.id,
                    cidadePartida: $scope.enderecoPartida.address_components[2].long_name,
                    enderecoPartida: $scope.enderecoPartida.formatted_address,
                    latitudePartida: $scope.enderecoPartida.geometry.location.lat(),
                    longitudePartida: $scope.enderecoPartida.geometry.location.lng(),
                    pontoReferencia: $scope.viagem.pontoReferencia,
                    enderecoDestino: endDestino,
                    latitudeDestino: $scope.enderecoDestino.geometry.location.lat(),
                    longitudeDestino: $scope.enderecoDestino.geometry.location.lng(),
                    servico: $scope.servico,
                    tarifa: $scope.tarifa,
                    distancia: $scope.distancia
                };
                viagemService.solicitar(objEnvioFinal).then(function (response) {
                    $scope.resultado = response.data[0].resultado;
                    $scope.codigo = response.data[0].codigo;
                    $scope.idSolicitacao = response.data[0].idSolicitacao;
                    if ($scope.codigo == 1) {
                        $scope.localizaMotorista();
                    } else {
                        $scope.loading = false;
                        $scope.estadoTela = 3;
                    }

                });
            };

            function statusViagem(id) {
                $scope.estadoTela = 2;
                chamadaServico2();
                function chamadaServico2() {
                    viagemService.statusViagem(id).then(function (response) {
                        $scope.dadosStatus = response.data[0];
                    });
                };
                $scope.killtimer2 = function () {
                    if (angular.isDefined(timer2)) {
                        $interval.cancel(timer2);
                        timer2 = undefined;
                    }
                };
                $scope.aceito = 0;
                $scope.chegou = 0;
                $scope.cancelado = 0;
                var timer2 = $interval(function () {
                    if ($scope.dadosStatus.status == 0) {
                        if ($scope.aceito === 0) {
                            $scope.audioAceitou.play();
                        }
                        $scope.statusViagem = 25;
                        $scope.estadoBotao = 9;
                        $scope.aceito++;
                        chamadaServico2();
                    } else if ($scope.dadosStatus.status == 1) {
                        if ($scope.chegou === 0 || $scope.chegou === 20) {
                            $scope.audioChegada.play();
                        }
                        $scope.statusViagem = 50;
                        $scope.estadoBotao = 9;
                        $scope.chegou++;
                        chamadaServico2();
                    } else if ($scope.dadosStatus.status == 2) {
                        $scope.statusViagem = 75;
                        $scope.estadoBotao = 0;
                        chamadaServico2();
                    } else if ($scope.dadosStatus.status == 3) {
                        $scope.statusViagem = 100;
                        $scope.estadoBotao = 1;
                        $scope.killtimer2();
                        $scope.consultaPagamento();
                    } else if ($scope.dadosStatus.status == null || $scope.dadosStatus.status == 8) {
                        if ($scope.cancelado === 0) {
                            $scope.audioCancelado.play();
                        }
                        $scope.killtimer2();
                        $route.reload('viagem');
                        var data = {
                            status: 'error',
                            message: 'Viagem Cancelado pelo motorista!'
                        };
                        viagemService.toast(data);
                        $scope.cancelado++;
                    }
                }, 3000);

            }

            $scope.localizaMotorista = function () {
                $scope.estadoTela = 1;
                $scope.estadoBotao = 9;
                $scope.loading = true;
                //id usuario volta
                var chamou = 0;
                chamadaServico();
                function chamadaServico() {
                    viagemService.localizaMotorista($scope.SecaoCliente.id).then(function (response) {
                        $scope.dadosViagem = response.data[0];
                        $scope.dadosViagem.idSolicitacao = response.data[0].idSolicitacao;
                    });
                };
                $scope.killtimer = function () {
                    if (angular.isDefined(timer)) {
                        $interval.cancel(timer);
                        timer = undefined;
                    }
                };
                var timer = $interval(function () {
                    if ($scope.dadosViagem.status == 1) {
                        $scope.killtimer();
                        statusViagem($scope.dadosViagem.idSolicitacao);
                        $scope.loading = false;
                    } else if (chamou > 20) {
                        $scope.loading = false;
                        $scope.estadoTela = 3;
                        $scope.resultado = 'Nenhum carro disponivel, tente novamente mais tarde.'
                        $scope.killtimer();
                        $scope.cancelar();
                    }
                    else {
                        chamou++;
                        chamadaServico();
                    }
                }, 3000);

                $scope.consultaPagamento = function () {
                    var objPagamento = {
                        idCliente: $scope.SecaoCliente.id,
                        idSolicitacao: $scope.dadosViagem.idSolicitacao
                    }
                    viagemService.consultaPagamento(objPagamento).then(function (response) {
                        $scope.formaPagamento = response.data[0].result;
                    });
                };
                $scope.confirmaPagamento = function (status) {
                    var objPagamento = {
                        idCliente: $scope.SecaoCliente.id,
                        idSolicitacao: $scope.dadosViagem.idSolicitacao,
                        status: status
                    }
                    viagemService.confirmaPagamento(objPagamento).then(function (response) {
                        $scope.pagamentoConfirmacao = response.data[0].result;
                    });
                };
                $scope.avaliacao = 0;

                $scope.clickAvaliacao = function (param) {
                    $scope.avaliacao = param;
                };
                $scope.avaliar = function () {
                    var objAvaliacao = {
                        idSolicitacao: $scope.dadosViagem.idSolicitacao,
                        nota: $scope.avaliacao
                    }
                    viagemService.avaliarViagem(objAvaliacao).then(function (response) {
                        var data = {
                            status: 'success',
                            message: 'Obrigado por utilizar o Driver Vip!'
                        };
                        $route.reload('viagem');
                        viagemService.toast(data);
                    });
                };
            };

            $scope.cancelar = function () {
                $scope.statusViagem = 0;
                $scope.killtimer();
                $scope.loading = false;
                viagemService.cancelarViagem($scope.id).then(function (response) {
                    var data = {
                        status: 'error',
                        message: 'Viagem cancelada!'
                    };
                    viagemService.toast(data);
                });
            };
        }
    });
});
