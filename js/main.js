//https://github.com/uwcartlab/webmapping

var map;
var minValue;
var attributes = [];
var dataStats = {};  
//function to instantiate the Leaflet map
function createMap(){
    // Calculating width and change zoom levels based on screen width
    var width = window.innerWidth;
    //create the map
    map = L.map('myMap', {
        center: [50, 9],
        zoom: 4
    });

    //add OSM base tilelayer
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC'
    }).addTo(map);

    //call getData function
    getData(map);

    // calling HTML elements
    document.getElementById('title').innerHTML =  'Travel Cost in the Europe (1995 - 2021)'; 
    document.getElementById('mapcontent').innerHTML = "<p><font size = '+2'>W</font>elcome to my interactive map showcasing the total cost of traveling abroad from various European countries! The map allows you to explore the total travel costs for each country in Europe from 1995 to 2021, providing you with valuable insights into the trends and changes in travel costs over the years.<br><br>So go ahead, explore the map, and discover the total travel costs for your favorite European destinations!</p>";

};

//Step 1: Create new sequence controls
function createSequenceControls(){

    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        onAdd: function () {
            // create the control container div with a particular class name
            var container = L.DomUtil.create('div', 'sequence-control-container');

            //create range input element (slider)
            container.insertAdjacentHTML('beforeend', '<input class="range-slider" type="range">')

            
            //add skip buttons
            container.insertAdjacentHTML('beforeend', '<button class="step" id="reverse" title="Reverse"><img src="img/1.png"></button>'); 
            container.insertAdjacentHTML('beforeend', '<button class="step" id="forward" title="Forward"><img src="img/2.png"></button>');

             //disable any mouse event listeners for the container
             L.DomEvent.disableClickPropagation(container);

            return container;
        }
    });
    map.addControl(new SequenceControl());    // add listeners after adding control}

    //create range input element (slider)
    //var slider = "<input class='range-slider' type='range'></input>";
    //document.querySelector("#panel").insertAdjacentHTML('beforeend',slider);

    //set slider attributes
    document.querySelector(".range-slider").max = 26;
    document.querySelector(".range-slider").min = 0;
    document.querySelector(".range-slider").value = 0;
    document.querySelector(".range-slider").step = 1;
    //document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="reverse">Reverse</button>');
    //document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="forward">Forward</button>');

    // //replace button content with images
    // document.querySelector('#reverse').insertAdjacentHTML('beforeend',"<img src='img/reverse.png'>")
    // document.querySelector('#forward').insertAdjacentHTML('beforeend',"<img src='img/forward.png'>")

    //Step 5: click listener for buttons
    document.querySelectorAll('.step').forEach(function(step){
        step.addEventListener("click", function(){
            var index = document.querySelector('.range-slider').value;

            //Step 6: increment or decrement depending on button clicked
            if (step.id == 'forward'){
                index++;
                //Step 7: if past the last attribute, wrap around to first attribute
                index = index > 26 ? 0 : index;
            } else if (step.id == 'reverse'){
                index--;
                //Step 7: if past the first attribute, wrap around to last attribute
                index = index < 0 ? 26 : index;
            };

            //Step 8: update slider
            document.querySelector('.range-slider').value = index;
            updatePropSymbols(attributes[index]);
        })
    })

    //Step 5: input listener for slider
    document.querySelector('.range-slider').addEventListener('input', function(){            
        //Step 6: get the new index value
        var index = this.value;
        updatePropSymbols(attributes[index]);
    });
    
};

function createLegend(attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function () {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

            //PUT YOUR SCRIPT TO CREATE THE TEMPORAL LEGEND HERE
             container.innerHTML = '<p class="temporalLegend">Travel Cost in <span class="year">1995</span></p>';

             //Step 1: start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="200px" height="130px">';

            //array of circle names to base loop on
            var circles = ["max", "mean", "min"];

            //Step 2: loop to add each circle and text to svg string
            for (var i=0; i<circles.length; i++){
                //Step 3: assign the r and cy attributes 
                
                var radius = calcPropRadius(dataStats[circles[i]]);  
                
                var cy = 70 - radius; 
                //circle string
                //circle string
                svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#ff7800" fill-opacity="0.8" stroke="#000000" cx="53"/>';

                //evenly space out labels            
                var textY = i * 23 + 23;            

                //text string            
                svg += '<text id="' + circles[i] + '-text" x="105" y="' + textY + '">' + Math.round(dataStats[circles[i]]*100/100) + " million" + '</text>';
            };

            //close svg string
            svg += "</svg>";

            //add attribute legend svg to container
            container.insertAdjacentHTML('beforeend',svg);

            return container;
        }
    });

    map.addControl(new LegendControl());
};

function processData(data){
    //empty array to hold attributes
    

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("199") > -1 ||
        attribute.indexOf('20')>-1){
            attributes.push(attribute);
        };
    };
    //check result
    //console.log(attributes);
    return attributes;
};

function calcStats(data){
    //create empty array to store all data values
    var allValues = [];
    //loop through each city
    for(var Country of data.features){
        //loop through each year
        for(var year = 1995; year <= 2021; year+=1){
              //get population for current year
              var value = Country.properties[String(year)];
              //add value to array
              allValues.push(value);
        }
    }
    console.log(allValues)
    //get min, max, mean stats for our array
    dataStats.min = Math.min(...allValues);
    dataStats.max = Math.max(...allValues);
    //calculate meanValue
    var sum = allValues.reduce(function(a, b){return a+b;});
    dataStats.mean = sum/ allValues.length;

}    

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    
    //constant factor adjusts symbol sizes evenly
    var minRadius = 0.45;
    //Flannery Apperance Compensation formula
    var radius = 1.0083 * Math.pow(attValue/dataStats.min,0.5715) * minRadius

    return radius;
};

//function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
     //Step 4: Assign the current attribute based on the first index of the attributes array
     var attribute = attributes[0];
     //console.log(attribute)
    //Determine which attribute to visualize with proportional symbols
    var attribute = "1995";

    //create marker options
    var options = {
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);
    
    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

     //create new popup content
     var popupContent = new PopupContent(feature.properties, attribute);
    

    layer.bindPopup(popupContent.formatted, {
        offset: new L.Point(0,-options.radius) 
    });

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

//Add circle markers for point features to the map
function createPropSymbols(data, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);}
    }).addTo(map);
};


//Step 2: Import GeoJSON data
function getData(){
    //load the data
    fetch("data/Eur_Travel_Cost.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
             //create an attributes array
             var attributes = processData(json);
            //calculate minimum data value
            calcStats(json);
            //call function to create proportional symbols
            createPropSymbols(json,attributes);
            createSequenceControls(attributes);
            createLegend(attributes);
        })
};

//Step 10: Resize proportional symbols according to new attribute values
function updatePropSymbols(attribute){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            //Example 3.18 line 4
        if (layer.feature && layer.feature.properties[attribute]){
            document.querySelector(".year").innerHTML = attribute;
            //access feature properties
            var props = layer.feature.properties;
            
            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);
            
            var popupContent = new PopupContent(props, attribute);

            //update popup content            
            popup = layer.getPopup();            
            popup.setContent(popupContent.formatted).update();
        };
        };
    });
};

function PopupContent(properties, attribute){
    this.properties = properties;
    this.attribute = attribute;
    this.year = attribute;
    this.population = this.properties[attribute];
    this.formatted = "<p><b>Country:</b> " + this.properties.Country + "</p><p><b>Travel Cost in " + this.year + ":</b> $" + this.population + " million</p>";
};




document.addEventListener('DOMContentLoaded',createMap)