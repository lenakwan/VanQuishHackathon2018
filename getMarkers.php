<?php

$methodType = $_SERVER['REQUEST_METHOD'];

    /*Database information*/
    $servername = "localhost";
    $dblogin = "root";
    $password = "";
    $dbname = "test";

    $statement;
    $data = array("status" => "fail", "msg" => "On $methodType");

    if ($methodType === 'GET') {
        if(isset($_GET['output'])) {
            $output = $_GET['output'];

          try {
            $conn = new PDO("mysql:host=$servername;dbname=$dbname", $dblogin, $password);

            // set the PDO error mode to exception
            $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
           
            //echo "the data is: " . $data;
        } catch(PDOException $e) {
            $data = array("error", $e->getMessage());
        } /////////////////////////////////////////////////////////

        switch($output) {

            case "html": 
            //echo "hai";
                $sql  = "SELECT * FROM coor";
                $statement = $conn->prepare($sql);
                $statement->execute();
                $count = $statement->rowCount();
                echo "Number of returned values is $count.";
                foreach($statement as $item){
                    echo $item["latitude"];
                    echo " ";
                    echo $item["longitude"];
                }; 
              //  echo "hey";


            case "json":
            $sql = "SELECT * FROM coor"; 

            $statement = $conn->prepare($sql);
            $statement->execute();  

           // $data= $statement;
          //  $json =  json_encode($data); 

            foreach($statement as $item){
                echo $item["latitude"];
                echo " ";
                echo $item["longitude"];
            }; 
            //while($r = mysql_fetch_assoc($result)) $rows[] = $r;
            //print json_encode($rows);

           /* $statement = $conn->prepare($sql);
            $statement->execute();  

            $spaces1;
            $spaces2;
            //echo "the statement is: " . $statement;
            //probably try to change this to json...
            
            foreach($statement as $item){
                echo $item["latitutde"];
                echo " ";
                echo $item["longitude"];
            } */
            
            
            break; 
            echo json_encode($data, JSON_FORCE_OBJECT);
        }
        
    }
    
} else {
    $data = array("msg" => "Error: only GET allowed");
}

//echo json_encode($data, JSON_FORCE_OBJECT);
?>