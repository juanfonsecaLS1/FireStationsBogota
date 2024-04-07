let map;
let cur_layer;
let legend;
let info;
let stn_array = Array();
let cur_stn;
let cur_year;
let cur_iso;

// setting view and bounds for Bogota
let bogota_centre = [4.658414286776931, -74.10942901142488];
let corner1 = L.latLng(4.364447658651188, -74.32826274586071);
let corner2 = L.latLng(4.949550869583254, -73.87962471709464);

// Initialise the map
function init() {
  // create map and set center and zoom level
  map = L.map('mapid');


  map.setView(bogota_centre, 11.5);
  map.setMaxBounds(L.latLngBounds(corner1, corner2));

  //Load tiles from open street map
  L.tileLayer.grayscale('http://tile.openstreetmap.org/{z}/{x}/{y}.png',
    { attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', minZoom: 10 }).addTo(map)

  cur_layer = L.layerGroup().addTo(map);
  // layer_jds = L.layerGroup().addTo(map);
  layer_jds = L.layerGroup();
  cur_stn = "0";

  // Adding a panel to show the isochrone value
  info = L.control({ position: 'topright' });

  info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
  };

  // method that we will use to update the control based on feature properties passed
  info.update = function (props) {
    this._div.innerHTML = '<h5>Estimated time from station</h5>' + (props ?
      props.time / 60 + ' minutes*'
      : 'Hover over isochrones');
  };

  info.addTo(map);


  // Adding a legend for the map
  legend = L.control({ position: 'topright' });

  legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
      grades = [0, 3, 6, 9, 12, 15, 18],
      labels = [];

    // loop through our density intervals and generate a label with a coloured square for each interval
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
        '<i style="background:' + getColor((grades[i] * 60) + 1) + '"></i> ' +
        grades[i] + (grades[i + 1] ? ' &ndash; ' + grades[i + 1] + ' min <br>' : '+ <br> <br> ');
    }
// Adding an item in the legend for the stations
    div.innerHTML +=
        "<img src='https://upload.wikimedia.org/wikipedia/commons/3/39/Map_marker_icon_%E2%80%93_Nicolas_Mollet_%E2%80%93_Fire_station_%E2%80%93_Offices_%E2%80%93_White.png' height='16'> Station<br/>";
        // An item for the incidents
        div.innerHTML +='<i class="circle" style="background:#F00"></i> Incident';

    return div;
  };

  legend.addTo(map);
}

// Function to reset the select menus
function reset_select() {
  $(".form-select").val(0);
}

// Function to clear the map
function clear_map() {
  cur_layer.remove();
  cur_layer = L.layerGroup().addTo(map);
  map.setView(bogota_centre, 11.5);
}

// A function to clear the current layers if any of the accordion options is selected
$(function () {
  $(".accordion-collapse").on('show.bs.collapse', function () {
    clear_map();
    cur_stn = undefined;
    reset_select();
    if ($("#jrsSwitch").prop('checked')) {
      $("#jrsSwitch").prop('checked', false)};
      jrs_off();
  });
});

// Functions for the sliders in incidents section
$(function () {
  $("#isoRange").change(function (e) {
    $("#isoLabel").html("<small>" + $("#isoRange").val() + " min<small/>");
    // console.log($("#isoRange").val() +" minutes")
  });

  $("#yearRange").change(function (e) {
    $("#yearLabel").html("<small>" + $("#yearRange").val() + "<small/>");
    // console.log($("#isoRange").val() +" minutes")
  });
});

function jrs_off (){
  $("#jrsLabel").html("<small>Hidden<small/>");
  clear_jds();
}

// Function for the switch of visibility of jurisdictions
$(function () {
  $("#jrsSwitch").change(function (e) {
    // console.log($("#jrsSwitch").prop('checked'))
    if ($("#jrsSwitch").prop('checked')) {
      $("#jrsLabel").html("<small>Visible<small/>");
      add_adm_border();
    } else {
      jrs_off();
    }
  });
});