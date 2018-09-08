// Initialize Firebase
var config = {
	apiKey: "AIzaSyA__unc1EqKKc5k-vQZ54j8DwESmquNU2M",
	authDomain: "teampocky2018-1536380254596.firebaseapp.com",
	databaseURL: "https://teampocky2018-1536380254596.firebaseio.com",
	projectId: "teampocky2018-1536380254596",
	storageBucket: "teampocky2018-1536380254596.appspot.com",
	messagingSenderId: "124278017153"
};
firebase.initializeApp(config);
var firestore = firebase.firestore();
var myLat, myLon;
var map;
var markers = [];
var reports;


// USER LOCATION TRACKING SECTION
function showPosition(position) {
	console.log("Updating my Location: " + position.coords);
	myLat = position.coords.latitude;
	myLon = position.coords.longitude;
}

function showError(error) {
	console.log("something failed");
}
var options = {
	enableHighAccuracy: false,
	timeout: 3000,
	maximumAge: 0
};

navigator.geolocation.watchPosition(showPosition, showError, options);

function init() {
	getLocation();
	timeout();
}

function timeout() {
	setTimeout(function () {
		if (myLat == undefined) {
			console.log("Timeout-ing");
			timeout();
		} else {
			initMap();
		}
	}, 1000);
}

function initMap() {
	var latlon = new google.maps.LatLng(myLat, myLon)
	var mapVar = document.getElementById("postMap");
	mapVar.style.height = '400px';
	mapVar.style.width = '500px';

	var myOptions = {
		center: latlon,
		zoom: 14,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		mapTypeControl: false,
		navigationControlOptions: {
			style: google.maps.NavigationControlStyle.SMALL
		}
	}

	map = new google.maps.Map(mapVar, myOptions);

	getReports();
}

function getReports() {
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(null);
	}
	markers = [];
	reports = [];
	firestore.collection("collisions").get().then(
		function (querySnapshot) {
			querySnapshot.forEach(function (doc) {
				reports.push([doc.data().LatLon, doc.data().Time]);
			})
			addMarkers(map, reports);
		});

}

function addMarkers(map, reports) {
	for (var i = 0; i < reports.length; i++) {
		var reportLatLon = new google.maps.LatLng(reports[i][0].latitude, reports[i][0].longitude);
		var marker = new google.maps.Marker({
			position: reportLatLon,
			map: map,
			title: "Dangerous Driver!"
		});
		markers.push(marker);
	}
}

function reportDriver() {
	firestore.collection("collisions").add({
		LatLon: new firebase.firestore.GeoPoint(myLat, myLon),
		Time: new firebase.firestore.Timestamp(Math.round(new Date().getTime() / 1000), 0)
	});

	getReports();
}

/*
$("#sendData").click(function(){
    myLat = undefined;
    console.log("HERE");
    getLocation();
    timeout();
    console.log(myLat);
    firestore.collection("collisions").add({ 
        LatLon: new firebase.firestore.GeoPoint(myLat, myLon),
        Time: new firebase.firestore.Timestamp(Math.round(new Date().getTime()/1000), 0)
    });

    getReports();
    
    // var currentLongitude = position.coords.longitude;
    // var currentLatitude = position.coords.latitude;

    //console.log("Latitude: " + currentLatitude + ", Longitude: " + currentLongitude);
});

$("#receiveData").click(function(){
    console.log("receiving map data");

    $.ajax({
        url: "getMarkers.php",
        type: "GET",
        dataType: "json",
        data: { output: 'json' },
        success: function (data) {
            console.log("Data returned from server: " + data);
            console.log(JSON.stringify(data));

            
        },
        error: function (jqXHR, textStatus, errorThrown) {
           console.log("Something went wrong: " + errorThrown);
        }

    });

    //creates the variable that holds the coordinates.  this will be obtained from the database
    var latlon = new google.maps.LatLng(49.249016, -123.002320) //49.249016, -123.002320

    //create a variable for the map
    var mapVar = document.getElementById("receivedMap");
    mapVar.style.height = "300px";
    mapVar.style.width = '300px';

    //styles the map
    var myOptions = {
        center:latlon,zoom:14,
        mapTypeId:google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        navigationControlOptions:{style:google.maps.NavigationControlStyle.SMALL}
    }
    
    //actually draws the map
    var dangerMap = new google.maps.Map(document.getElementById("receivedMap"), myOptions);

    //adds the marker using the coordinate variable
    var marker = new google.maps.Marker({position:latlon, map:dangerMap, title:"Dangerous driver here!"});

    
});
*/

function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(showPosition, showError);
	} else {
		x.innerHTML = "Geolocation is not supported by this browser.";
	}
}

/*function showPosition(position) {

    myLat = position.coords.latitude;
    myLon = position.coords.longitude;

    
    var latlon = new google.maps.LatLng(lat, lon)
    var mapVar = document.getElementById("postMap");
    mapVar.style.height = '250px';
    mapVar.style.width = '500px';

    var myOptions = {
        center:latlon,zoom:14,
        mapTypeId:google.maps.MapTypeId.ROADMAP,
        mapTypeControl:false,
        navigationControlOptions:{style:google.maps.NavigationControlStyle.SMALL}
    }
    
    var map = new google.maps.Map(document.getElementById("postMap"), myOptions);
    var marker = new google.maps.Marker({position:latlon,map:map,title:"You are here!"});

    //stringify turns into string
    var latString = JSON.stringify(lat);
    var lonString = JSON.stringify(lon);

    //parse turns data(string) into object
    //var latObj = JSON.parse(latString);
    //var lonObj = JSON.parse(lonString);

    console.log("latString: " + latString);
    console.log("lonString: " + lonString);

   // console.log("jsonName: " + latObj);
    //console.log("jsonScore: " + lonObj);

    //console.log("latObj type of" + typeof(latString));

    var coorObj = {lat: latString, long: lonString}; //unused for now
    
    console.log("coorObj type of" + typeof(coorObj));

    //ajax call to send data
    $.ajax({
        url: "storeMarker.php",
        type: "GET",
        dataType: "json",
        data: {
            lat : latString,
            lon: lonString,
            coor: coorObj
          },  
        success: function (data) {
            console.log("Data sent to server: " + data);

        },
        error: function (jqXHR, textStatus, errorThrown) {
           console.log("Something went wrong: " + errorThrown);
        }

    });
}*/
