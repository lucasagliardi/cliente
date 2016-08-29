// 
// Here is how to define your module 
// has dependent on mobile-angular-ui
// 
var app = angular.module('driverVipApp', [
  'ngRoute',
  'mobile-angular-ui',
  'toaster',
  'ngMask',
  'ngAudio',
  'ngAutocomplete',
  // touch/drag feature: this is from 'mobile-angular-ui.gestures.js'
  // it is at a very beginning stage, so please be careful if you like to use
  // in production. This is intended to provide a flexible, integrated and and 
  // easy to use alternative to other 3rd party libs like hammer.js, with the
  // final pourpose to integrate gestures into default ui interactions like 
  // opening sidebars, turning switches on/off ..
  'mobile-angular-ui.gestures'
]);

app.run(function ($rootScope, $location, loginService) {
  $rootScope.$on("$routeChangeStart", function (event, next, current) {
    $rootScope.authenticated = false;
    loginService.get('session').then(function (results) {
      if (results.id) {
        $rootScope.authenticated = true;
        $rootScope.id = results.id;
        $rootScope.nome = results.nome;
        $rootScope.email = results.email;
      } else {
        var nextUrl = next.$$route.originalPath;
        if (nextUrl == '/signup' || nextUrl == '/login') {

        } else {
          $location.path("/login");
        }
      }
    });
  });
});

// 
// You can configure ngRoute as always, but to take advantage of SharedState location
// feature (i.e. close sidebar on backbutton) you should setup 'reloadOnSearch: false' 
// in order to avoid unwanted routing.
// 
app.config(function ($routeProvider) {
  $routeProvider.when('/', { templateUrl: 'login/login.html', controller: 'loginCtrl', role: '0' });
  $routeProvider.when('/login', { templateUrl: 'login/login.html', controller: 'loginCtrl' });
  $routeProvider.when('/logout', { templateUrl: 'login/login.html', controller: 'logoutCtrl' });
  $routeProvider.when('/signup', { templateUrl: 'login/signup.html', controller: 'loginCtrl' });
  $routeProvider.when('/historicoViagens', { templateUrl: 'historicoViagens/historicoViagens.html', controller: 'historicoViagensCtrl', reloadOnSearch: false });
  $routeProvider.when('/viagem', { templateUrl: 'viagem/viagem.html', controller: 'viagemCtrl', reloadOnSearch: false });
  $routeProvider.otherwise({ redirectTo: '/login' });
});

// 
// `$touch example`
// 
app.directive('starRating', function () {
  return {
    scope: {
      rating: '=',
      maxRating: '@',
      readOnly: '@',
      click: "&",
      mouseHover: "&",
      mouseLeave: "&"
    },
    restrict: 'EA',
            template:
            "<div style='display: inline-block; margin: 0px; padding: 0px; cursor:pointer;' ng-repeat='idx in maxRatings track by $index'> \
                    <img ng-src='{{((hoverValue + _rating) <= $index) && \"assets/img/avaliacao2.png\" || \"assets/img/avaliacao.png\"}}' \
                    ng-Click='isolatedClick($index + 1)' \
                    ng-mouseenter='isolatedMouseHover($index + 1)' \
                    ng-mouseleave='isolatedMouseLeave($index + 1)'></img> \
            </div>",
    compile: function (element, attrs) {
      if (!attrs.maxRating || (Number(attrs.maxRating) <= 0)) {
        attrs.maxRating = '5';
      };
    },
    controller: function ($scope, $element, $attrs) {
      $scope.maxRatings = [];

      for (var i = 1; i <= $scope.maxRating; i++) {
        $scope.maxRatings.push({});
      };

      $scope._rating = $scope.rating;

      $scope.isolatedClick = function (param) {
        if ($scope.readOnly == 'true') return;

        $scope.rating = $scope._rating = param;
        $scope.hoverValue = 0;
        $scope.click({
          param: param
        });
      };

      $scope.isolatedMouseHover = function (param) {
        if ($scope.readOnly == 'true') return;

        $scope._rating = 0;
        $scope.hoverValue = param;
        $scope.mouseHover({
          param: param
        });
      };

      $scope.isolatedMouseLeave = function (param) {
        if ($scope.readOnly == 'true') return;

        $scope._rating = $scope.rating;
        $scope.hoverValue = 0;
        $scope.mouseLeave({
          param: param
        });
      };
    }
  };
});
app.directive('toucharea', ['$touch', function ($touch) {
  // Runs during compile
  return {
    restrict: 'C',
    link: function ($scope, elem) {
      $scope.touch = null;
      $touch.bind(elem, {
        start: function (touch) {
          $scope.touch = touch;
          $scope.$apply();
        },

        cancel: function (touch) {
          $scope.touch = touch;
          $scope.$apply();
        },

        move: function (touch) {
          $scope.touch = touch;
          $scope.$apply();
        },

        end: function (touch) {
          $scope.touch = touch;
          $scope.$apply();
        }
      });
    }
  };
}]);

app.directive('focus', function () {
  return function (scope, element) {
    element[0].focus();
  }
});
app.directive("validaCpf", function () {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, element, attrs, modelCtrl) {
      function isValidCpf(cpf) {
        cpf = cpf.replace(/[^\d]+/g, '');
        if (cpf == '') return false;
        // Elimina CPFs invalidos conhecidos    
        if (cpf.length != 11 ||
          cpf == "00000000000" ||
          cpf == "11111111111" ||
          cpf == "22222222222" ||
          cpf == "33333333333" ||
          cpf == "44444444444" ||
          cpf == "55555555555" ||
          cpf == "66666666666" ||
          cpf == "77777777777" ||
          cpf == "88888888888" ||
          cpf == "99999999999")
          return false;
        // Valida 1o digito 
        var add = 0;
        for (var i = 0; i < 9; i++)
          add += parseInt(cpf.charAt(i)) * (10 - i);
        var rev = 11 - (add % 11);
        if (rev == 10 || rev == 11)
          rev = 0;
        if (rev != parseInt(cpf.charAt(9)))
          return false;
        // Valida 2o digito 
        add = 0;
        for (i = 0; i < 10; i++)
          add += parseInt(cpf.charAt(i)) * (11 - i);
        rev = 11 - (add % 11);
        if (rev == 10 || rev == 11)
          rev = 0;
        if (rev != parseInt(cpf.charAt(10)))
          return false;
        return true;
      }
    }
  }
});
app.directive('cpfValido', function () {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, elem, attrs, ctrl) {

      scope.$watch(attrs.ngModel, function () {
        if (elem[0].value.length == 0) {
          ctrl.$setValidity('cpfValido', true);
        }
        else if (elem[0].value.length < 11) {
          //aplicar o algoritmo de validação completo do CPF
          ctrl.$setValidity('cpfValido', false);
        }
        else {
          ctrl.$setValidity('cpfValido', true)
          console.log('eu aqui');
        };
      });
    }
  };
});
app.directive('passwordMatch', [function () {
  return {
    restrict: 'A',
    scope: true,
    require: 'ngModel',
    link: function (scope, elem, attrs, control) {
      var checker = function () {

        //get the value of the first password
        var e1 = scope.$eval(attrs.ngModel);

        //get the value of the other password  
        var e2 = scope.$eval(attrs.passwordMatch);
        if (e2 != null)
          return e1 == e2;
      };
      scope.$watch(checker, function (n) {

        //set the form control to valid if both 
        //passwords are the same, else invalid
        control.$setValidity("passwordNoMatch", n);
      });
    }
  };
}]);


//
// `$drag` example: drag to dismiss
//
app.directive('dragToDismiss', function ($drag, $parse, $timeout) {
  return {
    restrict: 'A',
    compile: function (elem, attrs) {
      var dismissFn = $parse(attrs.dragToDismiss);
      return function (scope, elem) {
        var dismiss = false;

        $drag.bind(elem, {
          transform: $drag.TRANSLATE_RIGHT,
          move: function (drag) {
            if (drag.distanceX >= drag.rect.width / 4) {
              dismiss = true;
              elem.addClass('dismiss');
            } else {
              dismiss = false;
              elem.removeClass('dismiss');
            }
          },
          cancel: function () {
            elem.removeClass('dismiss');
          },
          end: function (drag) {
            if (dismiss) {
              elem.addClass('dismitted');
              $timeout(function () {
                scope.$apply(function () {
                  dismissFn(scope);
                });
              }, 300);
            } else {
              drag.reset();
            }
          }
        });
      };
    }
  };
});
app.directive('dragToDismissLeft', function ($drag, $parse, $timeout) {
  return {
    restrict: 'A',
    compile: function (elem, attrs) {
      var dismissFn = $parse(attrs.dragToDismissLeft);
      return function (scope, elem) {
        var dismissLeft = false;

        $drag.bind(elem, {
          transform: $drag.TRANSLATE_LEFT,
          move: function (drag) {
            // console.log();
            // drag.transform.rotateZ
            if (Math.abs(drag.distanceX) >= drag.rect.width / 4) {
              dismissLeft = true;
              elem.addClass('dismiss-left');
            } else {
              dismissLeft = false;
              elem.removeClass('dismiss-left');
            }
          },
          cancel: function () {
            elem.removeClass('dismiss-left');
          },
          end: function (drag) {
            if (dismissLeft) {
              elem.addClass('dismitted-left');
              $timeout(function () {
                scope.$apply(function () {
                  dismissFn(scope);
                });
              }, 300);
            } else {
              drag.reset();
            }
          }
        });
      };
    }
  };
});

//
// Another `$drag` usage example: this is how you could create 
// a touch enabled "deck of cards" carousel. See `carousel.html` for markup.
//
app.directive('carousel', function () {
  return {
    restrict: 'C',
    scope: {},
    controller: function () {
      this.itemCount = 0;
      this.activeItem = null;

      this.addItem = function () {
        var newId = this.itemCount++;
        this.activeItem = this.itemCount === 1 ? newId : this.activeItem;
        return newId;
      };

      this.next = function () {
        this.activeItem = this.activeItem || 0;
        this.activeItem = this.activeItem === this.itemCount - 1 ? 0 : this.activeItem + 1;
      };

      this.prev = function () {
        this.activeItem = this.activeItem || 0;
        this.activeItem = this.activeItem === 0 ? this.itemCount - 1 : this.activeItem - 1;
      };
    }
  };
});

app.directive('carouselItem', function ($drag) {
  return {
    restrict: 'C',
    require: '^carousel',
    scope: {},
    transclude: true,
    template: '<div class="item"><div ng-transclude></div></div>',
    link: function (scope, elem, attrs, carousel) {
      scope.carousel = carousel;
      var id = carousel.addItem();

      var zIndex = function () {
        var res = 0;
        if (id === carousel.activeItem) {
          res = 2000;
        } else if (carousel.activeItem < id) {
          res = 2000 - (id - carousel.activeItem);
        } else {
          res = 2000 - (carousel.itemCount - 1 - carousel.activeItem + id);
        }
        return res;
      };

      scope.$watch(function () {
        return carousel.activeItem;
      }, function () {
        elem[0].style.zIndex = zIndex();
      });

      $drag.bind(elem, {
        //
        // This is an example of custom transform function
        //
        transform: function (element, transform, touch) {
          // 
          // use translate both as basis for the new transform:
          // 
          var t = $drag.TRANSLATE_BOTH(element, transform, touch);

          //
          // Add rotation:
          //
          var Dx = touch.distanceX,
            t0 = touch.startTransform,
            sign = Dx < 0 ? -1 : 1,
            angle = sign * Math.min((Math.abs(Dx) / 700) * 30, 30);

          t.rotateZ = angle + (Math.round(t0.rotateZ));

          return t;
        },
        move: function (drag) {
          if (Math.abs(drag.distanceX) >= drag.rect.width / 4) {
            elem.addClass('dismiss');
          } else {
            elem.removeClass('dismiss');
          }
        },
        cancel: function () {
          elem.removeClass('dismiss');
        },
        end: function (drag) {
          elem.removeClass('dismiss');
          if (Math.abs(drag.distanceX) >= drag.rect.width / 4) {
            scope.$apply(function () {
              carousel.next();
            });
          }
          drag.reset();
        }
      });
    }
  };
});
app.directive('appFilereader', function ($q) {
  var slice = Array.prototype.slice;

  return {
    restrict: 'A',
    require: '?ngModel',
    link: function (scope, element, attrs, ngModel) {
      if (!ngModel) return;

      ngModel.$render = function () { };

      element.bind('change', function (e) {
        var element = e.target;

        $q.all(slice.call(element.files, 0).map(readFile))
          .then(function (values) {
            if (element.multiple) ngModel.$setViewValue(values);
            else ngModel.$setViewValue(values.length ? values[0] : null);
          });

        function readFile(file) {
          var deferred = $q.defer();

          var reader = new FileReader();
          reader.onload = function (e) {
            deferred.resolve(e.target.result);
          };
          reader.onerror = function (e) {
            deferred.reject(e);
          };
          reader.readAsDataURL(file);

          return deferred.promise;
        }

      }); //change

    } //link
  }; //return
});
app.directive('dragMe', ['$drag', function ($drag) {
  return {
    controller: function ($scope, $element) {
      $drag.bind($element,
        {
          //
          // Here you can see how to limit movement 
          // to an element
          //
          transform: $drag.TRANSLATE_INSIDE($element.parent()),
          end: function (drag) {
            // go back to initial position
            drag.reset();
          }
        },
        { // release touch when movement is outside bounduaries
          sensitiveArea: $element.parent()
        }
      );
    }
  };
}]);

//
// For this trivial demo we have just a unique MainController 
// for everything
//
app.controller('mainCtrl', function ($rootScope, $scope) {
  $scope.swiped = function (direction) {
    console.log('entrou');
    alert('Swiped ' + direction);
  };

  // User agent displayed in home page
  $scope.userAgent = navigator.userAgent;

  // Needed for the loading screen
  $rootScope.$on('$routeChangeStart', function () {
    $rootScope.loading = true;
  });

  $rootScope.$on('$routeChangeSuccess', function () {
    $rootScope.loading = false;
  });

  // Fake text i used here and there.
  $scope.lorem = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Vel explicabo, aliqid eaque soluta nihil eligendi adipisci error, illum corrupti nam fuga omnis quod quaerat mollitia expedita impedit dolores ipsam. Obcaecati.';

  // 
  // 'Scroll' screen
  // 
  var scrollItems = [];

  for (var i = 1; i <= 100; i++) {
    scrollItems.push('Item ' + i);
  }

  $scope.scrollItems = scrollItems;

  $scope.bottomReached = function () {
    /* global alert: false; */
    alert('Congrats you scrolled to the end of the list!');
  };

  // 
  // Right Sidebar
  // 
  $scope.chatUsers = [
    { name: 'Carlos  Flowers', online: true },
    { name: 'Byron Taylor', online: true },
    { name: 'Jana  Terry', online: true },
    { name: 'Darryl  Stone', online: true },
    { name: 'Fannie  Carlson', online: true },
    { name: 'Holly Nguyen', online: true },
    { name: 'Bill  Chavez', online: true },
    { name: 'Veronica  Maxwell', online: true },
    { name: 'Jessica Webster', online: true },
    { name: 'Jackie  Barton', online: true },
    { name: 'Crystal Drake', online: false },
    { name: 'Milton  Dean', online: false },
    { name: 'Joann Johnston', online: false },
    { name: 'Cora  Vaughn', online: false },
    { name: 'Nina  Briggs', online: false },
    { name: 'Casey Turner', online: false },
    { name: 'Jimmie  Wilson', online: false },
    { name: 'Nathaniel Steele', online: false },
    { name: 'Aubrey  Cole', online: false },
    { name: 'Donnie  Summers', online: false },
    { name: 'Kate  Myers', online: false },
    { name: 'Priscilla Hawkins', online: false },
    { name: 'Joe Barker', online: false },
    { name: 'Lee Norman', online: false },
    { name: 'Ebony Rice', online: false }
  ];

  //
  // 'Forms' screen
  //  
  $scope.rememberMe = true;
  $scope.email = 'me@example.com';

  $scope.login = function () {
    alert('You submitted the login form');
  };

  // 
  // 'Drag' screen
  // 
  $scope.notices = [];

  for (var j = 0; j < 10; j++) {
    $scope.notices.push({ icon: 'envelope', message: 'Notice ' + (j + 1) });
  }

  $scope.deleteNotice = function (notice) {
    var index = $scope.notices.indexOf(notice);
    if (index > -1) {
      $scope.notices.splice(index, 1);
    }
  };
});