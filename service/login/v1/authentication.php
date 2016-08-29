<?php 
$app->get('/session', function() {
    $db = new DbHandler();
    $session = $db->getSession();
    $response["id"] = $session['id'];
    $response["email"] = $session['email'];
    $response["nome"] = $session['nome'];
    $response["nome"] = $session['nome'];
    echoResponse(200, $session);
});

$app->post('/login', function() use ($app) {
    require_once 'passwordHash.php';
    $r = json_decode($app->request->getBody());
    verifyRequiredParams(array('email', 'senha'),$r->pessoa);
    $response = array();
    $db = new DbHandler();
    $senha = $r->pessoa->senha;
    $email = $r->pessoa->email;
    
    $user = $db->getOneRecord("select id, nome, sobrenome, cpf, senha, email, data_nascimento from PESSOA where celular='$email' or email='$email';");
    if ($user != NULL) {
        if(passwordHash::check_password($user['senha'],$senha)){
        $response['status'] = "success";
        $response['message'] = 'Login efetuado com sucesso.';
        $response['nome'] = $user['nome'];
        $response['sobrenome'] = $user['sobrenome'];
        $response['cpf'] = $user['cpf'];
        $response['id'] = $user['id'];
        $response['email'] = $user['email'];
        $response['data_nascimento'] = $user['data_nascimento'];
        if (!isset($_SESSION)) {
            session_start();
        }
        $_SESSION['id'] = $user['id'];
        $_SESSION['email'] = $email;
        $_SESSION['nome'] = $user['nome'];
        } else {
            $response['status'] = "error";
            $response['message'] = 'Erro no login, usuario ou senha incorretos.';
        }
    }else {
            $response['status'] = "error";
            $response['message'] = 'Este usuario não esta cadastrado.';
        }
    echoResponse(200, $response);
});
$app->post('/signUp', function() use ($app) {
    $response = array();
    $r = json_decode($app->request->getBody());
    verifyRequiredParams(array('email', 'nome', 'senha'),$r->pessoa);
    require_once 'passwordHash.php';
    $db = new DbHandler();
    $celular = $r->pessoa->celular;
    $nome = $r->pessoa->nome;
    $sobrenome = $r->pessoa->sobrenome;
    $email = $r->pessoa->email;
    $cpf = $r->pessoa->cpf;
    $data_nascimento = $r->pessoa->data_nascimento;
    $senha = $r->pessoa->senha;
    $foto = $r->pessoa->foto;
    $isUserExists = $db->getOneRecord("select 1 from PESSOA where celular='$celular' or email='$email' or cpf='$cpf'");
    if(!$isUserExists){
        $r->pessoa->senha = passwordHash::hash($senha);
        $tabble_name = "PESSOA";
        $column_names = array('celular', 'nome', 'sobrenome', 'cpf', 'email', 'senha', 'data_nascimento','foto');
        $result = $db->insertIntoTable($r->pessoa, $column_names, $tabble_name);
        if ($result != NULL) {
            $response["status"] = "success";
            $response["message"] = "Usuário criado com sucesso.";
            $response["id"] = $result;
            // if (!isset($_SESSION)) {
            //     session_start();
            // }
            // $_SESSION['id'] = $response["id"];
            // $_SESSION['celular'] = $celular;
            // $_SESSION['nome'] = $nome;
            // $_SESSION['email'] = $email;
            echoResponse(200, $response);
        } else {
            $response["status"] = "error";
            $response["message"] = "Falha ao criar usuário. Tente novamente.";
            echoResponse(201, $response);
        }            
    }else{
        $response["status"] = "error";
        $response["message"] = "Este usuário já existe em nossa base de dados!";
        echoResponse(201, $response);
    }
});
$app->get('/logout', function() {
    $db = new DbHandler();
    $session = $db->destroySession();
    $response["status"] = "info";
    $response["message"] = "Logout feito com sucesso";
    echoResponse(200, $response);
});
?>