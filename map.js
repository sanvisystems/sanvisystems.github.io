mapboxgl.accessToken = 'pk.eyJ1IjoiYmlzaGFsc2Fya2VyIiwiYSI6ImNqbzZqbTY3bjA1MnMzcG9qNDQzZWQ2aGMifQ._DQe2FjiGILKw00cndvFqQ';
const map = new mapboxgl.Map({
container: 'map',
style: 'mapbox://styles/mapbox/bright-v9',
center: [0, 0],
zoom: 16
});

var nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'top-right');

geojson.features.forEach(function(marker) {
        // create a HTML element for each feature
        var el = document.createElement('div');
        el.className = 'marker';

        // make a marker for each feature and add to the map
        new mapboxgl.Marker(el)
        .setLngLat(marker.geometry.coordinates)
        .addTo(map);
});

map.on('load', function () {
    map.addSource('mypoint', { type: 'geojson', data: {
                "type": "FeatureCollection",
                "features": [
		                {
		                    "type": "Feature",
		                    "geometry": {
		                        "type": "Point",
		                        "coordinates": [0, 0]
		                    },
		                    "properties": {
		                        "icon": "circle"
		                    }
		                }
                	]
               } 
           });

    map.addLayer({
        "id": "mypoint",
        "type": "symbol",
        "source": "mypoint",
        "layout": {
	            "icon-image": "{icon}-15",
	            "text-field": "{title}",
	            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
	            "text-offset": [0, 0.6],
	            "text-anchor": "top"
        }
    });
});

getLocation();	


function getLocation() {
    if (navigator.geolocation) {       
        navigator.geolocation.watchPosition(showPosition, showError, {enableHighAccuracy: true});
    } else { 
        alert("Geolocation is not supported by this browser.");
    }
}

function showPosition(position) {
    map.jumpTo({'center': [position.coords.longitude, position.coords.latitude]});
    map.getSource('mypoint').setData({
                "type": "FeatureCollection",
                "features": [
		                {
		                    "type": "Feature",
		                    "geometry": {
		                        "type": "Point",
		                        "coordinates": [position.coords.longitude, position.coords.latitude]
		                    },
		                    "properties": {
		                        "icon": "circle"
		                    }
		                }
                	]
               });

    var nearby = [];
    var places = "";
    var i = 0;
    while(i < geojson.features.length){
        var dis = distance(geojson.features[i].geometry.coordinates[1], geojson.features[i].geometry.coordinates[0], position.coords.latitude, position.coords.longitude, "K");
        if(dis < 1.5){
            var data = {
                name: geojson.features[i].properties.title,
                distance: dis.toFixed(2) + " km"
            };
            nearby.push(data);

            places = places + "<div class='places'><h3>"+geojson.features[i].properties.title+"</h3><p>"+dis.toFixed(2) +" km</p></div><hr>";
        }  
        i++;
    }
    document.getElementById('info').innerHTML = places;
    console.log(nearby);
}

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            alert("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            alert("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.");
            break;
	}
}

function distance(lat1, lon1, lat2, lon2, unit) {
        var radlat1 = Math.PI * lat1/180
        var radlat2 = Math.PI * lat2/180
        var radlon1 = Math.PI * lon1/180
        var radlon2 = Math.PI * lon2/180
        var theta = lon1-lon2
        var radtheta = Math.PI * theta/180
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        dist = Math.acos(dist)
        dist = dist * 180/Math.PI
        dist = dist * 60 * 1.1515
        if (unit=="K") { dist = dist * 1.609344 }
        if (unit=="N") { dist = dist * 0.8684 }
        return dist
}