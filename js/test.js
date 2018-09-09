// Initialize Firebase

var config = {
    apiKey: "AIzaSyB3PaSky2q1QOLA7ruDjjUubz4ZNbv-_-o",
    authDomain: "byklistpolice.firebaseapp.com",
    databaseURL: "https://byklistpolice.firebaseio.com",
    projectId: "byklistpolice",
    storageBucket: "byklistpolice.appspot.com",
    messagingSenderId: "490807079267"
};


  firebase.initializeApp(config);
  var firestore = firebase.firestore();
  var myLat, myLon;
  var map;
  var markers = [];
  var reports = [];
  var filteredReports = [];


// USER LOCATION TRACKING SECTION
function showPosition(position) {
    myLat = position.coords.latitude;
    myLon = position.coords.longitude;
}
function showError(error) {
    console.log("something failed");
}
var options = {
  enableHighAccuracy: false,
  timeout: 5000,
  maximumAge: 0
};

navigator.geolocation.watchPosition(showPosition, showError, options);

// Set up listener for the database
function setUpListener() {
firestore.collection("collisions").onSnapshot(function(snapshot) {
        snapshot.docChanges().forEach(function(change) {
            if (change.type === "added") {
                var newReport = change.doc.data();
                reports.push([newReport.LatLon, newReport.Time]);
                var newLatLon = new google.maps.LatLng(newReport.LatLon.latitude, newReport.LatLon.longitude);
                var newTime = newReport.Time;
                if(newLatLon !== undefined && newTime !== undefined) {
                    addMarker(newLatLon, newTime);
                }
            }
        });
    });
}


function init(){
    getLocation();
    timeout();
}

function timeout() {
    setTimeout(function () {
        if(myLat == undefined) {
            timeout();
        }
        else {
            initMap();
        }
    }, 1000);
}
var layer;
var heatMap;

function initMap() {
    var latlon = new google.maps.LatLng(myLat, myLon)
    var mapVar = document.getElementById("postMap");
    mapVar.style.height = '500px';
    mapVar.style.width = '600px';

    var myOptions = {
        center:latlon,
        zoom:14,
        mapTypeId:google.maps.MapTypeId.ROADMAP,
        mapTypeControl:false,
        navigationControlOptions:{style:google.maps.NavigationControlStyle.SMALL}
    }
    
    map = new google.maps.Map(mapVar, myOptions);

    layer = new google.maps.FusionTablesLayer({
        query: {
            select: 'location',
            from: '1VibrAaLq_1nHsl9ay39b5vmlf0pQu_aseU5F_zz3'
        },
        heatmap: {
            enabled: true
        },
        styles: [{
            where: 'Modes Veh-Ped',
            polygonOptions: {
                fillColor: '#0000FF',
                fillOpacity: 0.9

            }
        }]
    });
    heatMap = layer.setMap(map);
    heatMap;

    getReports();    
    setUpListener();
}

$(function(){
    var heatMapOff = {
      clicked: function(){
        layer.setMap(null);
      }
    };
    $('#heatMapOff')[0].onclick = heatMapOff.clicked;
  });

$(function(){
var heatMapOn = {
    clicked: function(){
    layer.setMap(map);
    }
};
$('#heatMapOn')[0].onclick = heatMapOn.clicked;
});

function getReports() {
    reports = [];
    firestore.collection("collisions").get().then(
        function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                reports.push([doc.data().LatLon, doc.data().Time]);
            })
            addMarkers(map);
        });

}


function addMarkers(map) {

    for (var j =0; j < markers.length; j++) {
        markers[j].setMap(null);
    }
    markers = [];

    timeFilterReports();
    
    for (var i = 0; i<filteredReports.length; i++) {
        var needToAdd = true;
        var reportLatLon = new google.maps.LatLng(filteredReports[i][0].latitude, filteredReports[i][0].longitude);
        for(var j = 0; j < markers.length; j++) {
            if(markers[j].getPosition() == reportLatLon) {
                needToAdd = false;
            }
        }
        if(needToAdd) {
            addMarker(reportLatLon, filteredReports[i][1]);
        }
    }
}

function timeFilterReports() {
    var selectVal = document.getElementById("timeSelect");
    var dateToFilter = new Date();
    filteredReports = [];
    switch(selectVal.value) {
        case "DAY":
            dateToFilter = new Date(dateToFilter - 86400000);
            break;
        case "WEEK":
            dateToFilter = new Date(dateToFilter - (7 * 86400000));
            break;
        case "MONTH":
            dateToFilter = new Date(dateToFilter - (31 * 86400000));
            break;
        case "SIXMONTH":
            dateToFilter = new Date(dateToFilter - (6 * 31 * 86400000));
            break;
        default:
            filteredReports = reports;
            return;
    }
    for(var i = 0; i < reports.length; i++) {
        if (new Date(reports[i][1]) > dateToFilter) {
            filteredReports.push(reports[i]);
        }
    }
}

function addMarker(latlon, time) {
        var marker = new google.maps.Marker({position:latlon,
                map:map,
                title:'Dangerous Driver!'});
            var infowindow = new google.maps.InfoWindow({
              content: 'Dangerous driver reported at:' + "<br />" + time,
            });
            marker.addListener('click', function() {
              infowindow.open(map, marker);
            });

            markers.push(marker);
    }

function reportDriver() {
    firestore.collection("collisions").add({ 
        LatLon: new firebase.firestore.GeoPoint(myLat, myLon),
        Time: new firebase.firestore.Timestamp(Math.round(new Date().getTime()/1000), 0)
    });
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

