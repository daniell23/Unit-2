// create a map connect to the id of div in HTML 
//set the initial view point and zoom level when we open the map on web
var map = L.map('myMap').setView([51.505, -0.09], 13);

//download the map layer from the openstreet map and add to our web map
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

//create a marker on the web map. Then we can see the location on the map
var marker = L.marker([51.5, -0.09]).addTo(map);

//create a circle base on this coordinate,all the parameter describe the feature of circle
var circle = L.circle([51.508, -0.11], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
}).addTo(map);

// define a polygon variable base on coordinate
var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(map);

//bind the popup message with each feature
marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon.");

//create an individual popup feature
var popup = L.popup();
// define the popup function 
function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}
// call the popup function
map.on('click', onMapClick);