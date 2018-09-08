<?php
    $methodType = $_SERVER['REQUEST_METHOD'];

    // DB Login  
    /*$servername = "db752815477.db.1and1.com";
    $dblogin = "db752815477";   
    $adminpass = "password"; 
    $dbname = "db752815477";*/

    $servername = "localhost";
    $dblogin = "root";
    $password = "";
    $dbname = "test";

    //echo "inside file";

    if ($methodType === "GET") {

        $latitude = $_GET["lat"];
        $longitude = $_GET["lon"];
        //echo $latitude;
        //echo $longitude;
        //echo "hi";

        try {
            $conn = new PDO("mysql:host=$servername;dbname=$dbname", $dblogin, $password);

                // set the PDO error mode to exception
                $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
                //  echo "inserting..";
                $sql = "INSERT INTO `coor` (latitude, longitude) VALUES ('$latitude', '$longitude')";

                $statement = $conn->prepare($sql);
                $statement->execute();

                $data= $statement;
                $json =  json_encode($data); 

        } catch(PDOException $e) {
            $data = array("errorlol", $e->getMessage());
        }

    } else {
        // simple error message, only taking POST requests
        $data = array("status" => "fail", "msg" => "Error: only GET allowed.");
    }

    echo json_encode($data, JSON_FORCE_OBJECT);

?>