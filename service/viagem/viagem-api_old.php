<?php
 	require_once("../Rest.inc.php");
	
	class API extends REST {
		public $data = "";
 		const DB_SERVER = "localhost";
		const DB_USER = "root";
		const DB_PASSWORD = "";
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
		private function calcularTarifa(){
			if($this->get_request_method() != "GET"){
				$this->response('',406);
			}

			$cidadeDestino = "Canoas";
			$cidadePartida = "Porto Alegre";
			$distancia = 20000;
			echo "aqui";
 			$call ="CALL calcula_tarifa('".$cidadePartida."','".$cidadeDestino."',".$distancia.", @servico, @tarifa );";
			$r = $this->mysqli->exec($call) or die($this->mysqli->error.__LINE__);
 			$query ="SELECT @servico, @tarifa;";
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
		//listagem de viagens
		private function viagens(){	
			if($this->get_request_method() != "GET"){
				$this->response('',406);
			}
			$query="SELECT distinct ca.id, ca.nome, ca.chave_viagem FROM viagens_atendidas ca order by ca.id desc";
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
		//edicao de viagem
		private function viagem(){	
			if($this->get_request_method() != "GET"){
				$this->response('',406);
			}
			$id = (int)$this->_request['id'];
			if($id > 0){	
				$query="SELECT distinct ca.id, ca.nome, ca.chave_viagem FROM viagens_atendidas ca where ca.id=$id";
				$r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
				if($r->num_rows > 0) {
					$result = $r->fetch_assoc();	
					$this->response($this->json($result), 200); // send user details
				}
			}
			$this->response('',204);	// If no records "No Content" status
		}
		//insercao do viagem
		private function inserirViagem(){
			
			if($this->get_request_method() != "POST"){
				$this->response('',406);
			}
			$viagem = json_decode(file_get_contents("php://input"),true);
			$column_names = array('cidadeDestino', 'chave_viagem');
			$keys = array_keys($viagem);
			$columns = '';
			$values = '';
			foreach($column_names as $desired_key){ // Check the viagem received. If blank insert blank into the array.
			   if(!in_array($desired_key, $keys)) {
			   		$$desired_key = '';
				}else{
					$$desired_key = $viagem[$desired_key];
				}
				$columns = $columns.$desired_key.',';
				$values = $values."'".$$desired_key."',";
			}
			$query = "INSERT INTO viagens_atendidas(".trim($columns,',').") VALUES(".trim($values,',').")";
			if(!empty($viagem)){
				$r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
				$success = array('status' => "Sucesso", "msg" => "Viagem criada com Sucesso.", "data" => $viagem);
				$this->response($this->json($success),200);
			}else
				$this->response('',204);	//"No Content" status
			
		}
		private function salvarViagem(){
			if($this->get_request_method() != "POST"){
				$this->response('',406);
			}
			$viagem = json_decode(file_get_contents("php://input"),true);
			$id = (int)$viagem['id'];
			$column_names = array('nome', 'chave_viagem');
			$keys = array_keys($viagem['viagem']);
			$columns = '';
			$values = '';
			foreach($column_names as $desired_key){ // Check the viagem received. If key does not exist, insert blank into the array.
			   if(!in_array($desired_key, $keys)) {
			   		$$desired_key = '';
				}else{
					$$desired_key = $viagem['viagem'][$desired_key];
				}
				$columns = $columns.$desired_key."='".$$desired_key."',";
			}
			$query = "UPDATE viagens_atendidas SET ".trim($columns,',')." WHERE id=$id";
			if(!empty($viagem)){
				$r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
				$success = array('status' => "Success", "msg" => "Viagem ".$id." atualizada com Sucesso.", "data" => $viagem);
				$this->response($this->json($success),200);
			}else
				$this->response('',204);	// "No Content" status
		}
		
		private function excluirViagem(){
			if($this->get_request_method() != "DELETE"){
				$this->response('',406);
			}
			$id = (int)$this->_request['id'];
			if($id > 0){				
				$query="DELETE FROM viagens_atendidas WHERE id = $id";
				$r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
				$success = array('status' => "Successo", "msg" => "Viagem excluida com sucesso.");
				$this->response($this->json($success),200);
			}else
				$this->response('',204);	// If no records "No Content" status
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
?>