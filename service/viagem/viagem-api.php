<?php
 	require_once("../Rest.inc.php");
	
	class API extends REST {
		public $data = "";
 		const DB_SERVER = "db_drvip.mysql.dbaas.com.br";
		const DB_USER = "db_drvip";
		const DB_PASSWORD = "flav0409";
		const DB = "db_drvip";

		private $db = NULL;
		private $mysqli = NULL;
		public function __construct(){
			parent::__construct();				// Init parent contructor
			$this->dbConnect();					// Initiate Database connection
		}
		
		/*
		 *  Connect to Database
		*/
		private function dbConnect(){
			$this->mysqli = new mysqli(self::DB_SERVER, self::DB_USER, self::DB_PASSWORD, self::DB);
		}
		
		/*
		 * Dynmically call the method based on the query string
		 */
		public function processApi(){
			$func = strtolower(trim(str_replace("/","",$_REQUEST['x'])));
			if((int)method_exists($this,$func) > 0)
				$this->$func();
			else
				$this->response('',404); // If the method not exist with in this class "Page not found".
		}
		
		private function calcularTarifa(){	
			$distancia = (int)$this->_request['distancia'];
			$cidadePartida = (string)$this->_request['cidadePartida'];
			$r = $this->mysqli->query("SET NAMES 'utf8';") or die($this->mysqli->error.__LINE__);
 			$call ="CALL CALCULA_TARIFA(1, 1, 1, '".$cidadePartida."', ".$distancia.", @servico, @tarifa, @idResult, @result);";
			$r = $this->mysqli->query($call) or die($this->mysqli->error.__LINE__);
 			$query ="SELECT @servico as servico, @tarifa as tarifa, @idResult as idResult, @result as result;";
			$r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
			// var_dump($r);
			if($r->num_rows > 0){
				$result = array();
				while($row = $r->fetch_assoc()){
					$result[] = $row;
				}
				$this->response($this->json($result), 200); // send user details
			}
			$this->response('',204);	// If no records "No Content" status
		}
		private function avaliarViagem(){	
			$id = (int)$this->_request['id'];
			$nota = (int)$this->_request['nota'];
 			$r = $this->mysqli->query("SET NAMES 'utf8';") or die($this->mysqli->error.__LINE__);
 			$call ="CALL AVALIAR_PARCEIRO(".$id.",".$nota.");";
			$r = $this->mysqli->query($call) or die($this->mysqli->error.__LINE__);
			if($r->num_rows > 0){
				$result = array();
				while($row = $r->fetch_assoc()){
					$result[] = $row;
				}
				$this->response($this->json($result), 200); // send user details
			}
			$this->response('',204);	// If no records "No Content" status
		}
		private function consultaPagamento(){
			$idCliente = (int)$this->_request['idCliente'];
			$idSolicitacao = (int)$this->_request['idSolicitacao'];
 			$r = $this->mysqli->query("SET NAMES 'utf8';") or die($this->mysqli->error.__LINE__);
 			$call ="CALL USUARIO_CONFIRMA_PAGTO(1,".$idCliente.",".$idSolicitacao.",'', @idForma, @idResult, @result);";
			$r = $this->mysqli->query($call) or die($this->mysqli->error.__LINE__);
 			$query ="SELECT @idForma as idForma, @idResult as idResult, @result as result;";
			$r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
			if($r->num_rows > 0){
				$result = array();
				while($row = $r->fetch_assoc()){
					$result[] = $row;
				}
				$this->response($this->json($result), 200); // send user details
			}
			$this->response('',204);	// If no records "No Content" status
		}
		private function confirmaPagamento(){
			$idCliente = (int)$this->_request['idCliente'];
			$idSolicitacao = (int)$this->_request['idSolicitacao'];
			$status = (string)$this->_request['status'];
 			$r = $this->mysqli->query("SET NAMES 'utf8';") or die($this->mysqli->error.__LINE__);
 			$call ="CALL USUARIO_CONFIRMA_PAGTO(2,".$idCliente.",".$idSolicitacao.",'".$status."', @idForma, @idResult, @result);";
			$r = $this->mysqli->query($call) or die($this->mysqli->error.__LINE__);
 			$query ="SELECT @idResult as idResult, @result as result;";
			$r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
			if($r->num_rows > 0){
				$result = array();
				while($row = $r->fetch_assoc()){
					$result[] = $row;
				}
				$this->response($this->json($result), 200); // send user details
			}
			$this->response('',204);	// If no records "No Content" status
		}
		private function statusViagem(){	
			$id = (int)$this->_request['id'];
			$latitude = 0;
			$longitude = 0;
 			$r = $this->mysqli->query("SET NAMES 'utf8';") or die($this->mysqli->error.__LINE__);
 			$call ="CALL STATUS_VIAGEM(".$id.",'".$latitude."', '".$longitude."', @estimativaTempo, @status, @result);";
			$r = $this->mysqli->query($call) or die($this->mysqli->error.__LINE__);
 			$query ="SELECT  @estimativaTempo as estimativaTempo, @status as status, @result as result;";
			$r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
			if($r->num_rows > 0){
				$result = array();
				while($row = $r->fetch_assoc()){
					$result[] = $row;
				}
				$this->response($this->json($result), 200); // send user details
			}
			$this->response('',204);	// If no records "No Content" status
		}
		private function solicitar(){
			if($this->get_request_method() != "POST"){
				$this->response('',406);
			}
			$viagem = json_decode(file_get_contents("php://input"),true);
			$viagem = $viagem['viagem'];
			$id = (int)$viagem['id'];
			$cidadePartida = (string)$viagem['cidadePartida'];
			$enderecoPartida = (string)$viagem['enderecoPartida'];
			$latitudePartida = (string)$viagem['latitudePartida'];
			$longitudePartida = (string)$viagem['longitudePartida'];
			$pontoReferencia = (string)$viagem['pontoReferencia'];
			$enderecoDestino = (string)$viagem['enderecoDestino'];
			$latitudeDestino = (string)$viagem['latitudeDestino'];
			$longitudeDestino = (string)$viagem['longitudeDestino'];
			$servico = (int)$viagem['servico'];
			$tarifa = (float)$viagem['tarifa'];
			$distancia = (float)$viagem['distancia'];
			$idCorporativo = 3;
 			$r = $this->mysqli->query("SET NAMES 'utf8';") or die($this->mysqli->error.__LINE__);
			 $call ="CALL SOLICITA_VIAGEM(".$id.",'".$cidadePartida."','".$enderecoPartida."','".$latitudePartida."','".$longitudePartida."', '".$pontoReferencia."',
			 '".$enderecoDestino."','".$latitudeDestino."','".$longitudeDestino."',".$servico.", ".$tarifa.", ".$distancia.",".$idCorporativo.", @idSolicitacao, @cod, @result );";
			$r = $this->mysqli->query($call) or die($this->mysqli->error.__LINE__);
 			$query ="SELECT  @idSolicitacao as idSolicitacao, @cod as codigo, @result as resultado;";
			$r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
			if($r->num_rows > 0){
				$result = array();
				while($row = $r->fetch_assoc()){
					$result[] = $row;
				}
				$this->response($this->json($result), 200); // send user details
			}
			$this->response('',204);	// If no records "No Content" status
		}
		private function localizaMotorista(){	
			$id = (int)$this->_request['id'];
 			$r = $this->mysqli->query("SET NAMES 'utf8';") or die($this->mysqli->error.__LINE__);
 			$call ="CALL PARCEIRO_VIAGEM(".$id.", @idSolicitacao, @idParceiro, @placa, @marca, @modelo, @cor, @nome, @celular, @status);";
			$r = $this->mysqli->query($call) or die($this->mysqli->error.__LINE__);
 			$query ="SELECT @idSolicitacao as idSolicitacao, @idParceiro as idParceiro, @placa as placa, @marca as marca, @modelo as modelo, @cor as cor, @nome as nome, @celular as celular, @status as status;";
			$r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
			if($r->num_rows > 0){
				$result = array();
				while($row = $r->fetch_assoc()){
					$result[] = $row;
				}
				$this->response($this->json($result), 200); // send user details
			}
			$this->response('',204);	// If no records "No Content" status
		}
		private function cancelarViagem(){	
			$id = (int)$this->_request['id'];
 			$r = $this->mysqli->query("SET NAMES 'utf8';") or die($this->mysqli->error.__LINE__);
 			$call ="CALL USUARIO_CANCELA_VIAGEM(".$id.");";
			$r = $this->mysqli->query($call) or die($this->mysqli->error.__LINE__);
			if($r->num_rows > 0){
				$result = array();
				while($row = $r->fetch_assoc()){
					$result[] = $row;
				}
				$this->response($this->json($result), 200); // send user details
			}
			$this->response('',204);	// If no records "No Content" status
		}
		private function viagem(){	
	
		}
		/*
		 *	Encode array into JSON
		*/
		private function json($data){
			if(is_array($data)){
				return json_encode($data);
			}
		}
	}
	
	// Initiiate Library
	
	$api = new API;
	$api->processApi();
?>