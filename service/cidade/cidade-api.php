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
		//listagem de cidades
		private function cidades(){	
			if($this->get_request_method() != "GET"){
				$this->response('',406);
			}
			$query="SELECT distinct ca.id, ca.nome FROM CIDADE_ATENDIDA ca order by ca.id desc";
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
		//edicao de cidade
		private function cidade(){	
			if($this->get_request_method() != "GET"){
				$this->response('',406);
			}
			$id = (int)$this->_request['id'];
			if($id > 0){	
				$query="SELECT distinct ca.id, ca.nome, ca.tipo FROM CIDADE_ATENDIDA ca where ca.id=$id";
				$r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
				if($r->num_rows > 0) {
					$result = $r->fetch_assoc();	
					$this->response($this->json($result), 200); // send user details
				}
			}
			$this->response('',204);	// If no records "No Content" status
		}
		//insercao do cidade
		private function inserirCidade(){
			
			if($this->get_request_method() != "POST"){
				$this->response('',406);
			}
			$cidade = json_decode(file_get_contents("php://input"),true);
			$column_names = array('nome', 'tipo');
			$keys = array_keys($cidade);
			$columns = '';
			$values = '';
			foreach($column_names as $desired_key){ // Check the cidade received. If blank insert blank into the array.
			   if(!in_array($desired_key, $keys)) {
			   		$$desired_key = '';
				}else{
					$$desired_key = $cidade[$desired_key];
				}
				$columns = $columns.$desired_key.',';
				$values = $values."'".$$desired_key."',";
			}
			$query = "INSERT INTO CIDADE_ATENDIDA(".trim($columns,',').") VALUES(".trim($values,',').")";
			if(!empty($cidade)){
				$r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
				$success = array('status' => "Sucesso", "msg" => "Cidade criada com Sucesso.", "data" => $cidade);
				$this->response($this->json($success),200);
			}else
				$this->response('',204);	//"No Content" status
			
		}
		private function salvarCidade(){
			if($this->get_request_method() != "POST"){
				$this->response('',406);
			}
			$cidade = json_decode(file_get_contents("php://input"),true);
	
			$id = (int)$cidade['id'];
			$column_names = array('nome', 'tipo');
			$keys = array_keys($cidade['cidade']);
			$columns = '';
			$values = '';
			foreach($column_names as $desired_key){ // Check the cidade received. If key does not exist, insert blank into the array.
			   if(!in_array($desired_key, $keys)) {
			   		$$desired_key = '';
				}else{
					$$desired_key = $cidade['cidade'][$desired_key];
				}
				$columns = $columns.$desired_key."='".$$desired_key."',";
			}
			$query = "UPDATE CIDADE_ATENDIDA SET ".trim($columns,',')." WHERE id=$id";
			if(!empty($cidade)){
				$r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
				$success = array('status' => "Success", "msg" => "Cidade ".$id." atualizada com Sucesso.", "data" => $cidade);
				$this->response($this->json($success),200);
			}else
				$this->response('',204);	// "No Content" status
		}
		
		private function excluirCidade(){
			if($this->get_request_method() != "DELETE"){
				$this->response('',406);
			}
			$id = (int)$this->_request['id'];
			if($id > 0){				
				$query="DELETE FROM CIDADE_ATENDIDA WHERE id = $id";
				$r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
				$success = array('status' => "Successo", "msg" => "Cidade excluida com sucesso.");
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
	$api->processApi();
?>