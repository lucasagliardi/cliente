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
		//lista historico
		private function viagens(){	
			if($this->get_request_method() != "GET"){
				$this->response('',406);
			}
			$id = (int)$this->_request['id'];
			$dias = (int)$this->_request['dias'];
			if($id > 0){
				$r = $this->mysqli->query("SET NAMES 'utf8';") or die($this->mysqli->error.__LINE__);
				$query="SELECT v.dataHora, v.origem, v.destino, v.motorista, v.valor FROM VIAGENS_USUARIO v where v.id = $id and v.dias <= $dias";
				$r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
				if($r->num_rows > 0){
				$result = array();
				while($row = $r->fetch_assoc()){
					$result[] = $row;
				}
				$this->response($this->json($result), 200); // send user details
			}
			}
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