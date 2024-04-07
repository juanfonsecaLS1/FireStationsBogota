// Using jQuery to read the json file with ids of fire stations
$(function () {
  $.ajax({
    url: 'data/fire_stn.json',
    dataType: 'json',
    success: function (data) {
      $.each(data, function (e) {
        stn_array.push({
          id: data[e].OBJECTID,
          ename: data[e].EBONOMBRE,
          lat: Number(data[e].Y),
          lon: Number(data[e].X)
        });

        // $("#stn_list").append('<option value="' + data[e].OBJECTID + '">' + data[e].EBONOMBRE + '</option>');
        // To populate the options of the select drop-down objects
        $(".form-select").append('<option value="' + data[e].OBJECTID + '">' + data[e].EBONOMBRE + '</option>');
        cur_stn = data[0].OBJECTID; // Assigning the value of the firs element of the list
        // printIDS();
      });
    }
  });
});

// function printIDS(){
//   for (var i = 0; i< stn_array.length; i++)	{ 
//     console.log("test:" + stn_array[i].ename+stn_array[i].lat.toString()); 			
//   }
// }

// function to retrieve the select list option
$(function () {
  $("#stn_list").change(function () {
    updateCurStn($("#stn_list").val());    
    // cur_stn = $("#stn_list").val();
    // console.log("Station selected - " + cur_stn);
  });
});


// function to retrieve the select list option
$(function () {
  $("#stn_list_inc").change(function () {
    updateCurStn($("#stn_list_inc").val());
  });
});

function updateCurStn(t) {
  cur_stn = t;
  console.log("Station selected - " + cur_stn);
}

// based on https://leafletjs.com/examples/choropleth/
function getColor(t) {
  return t > 1080 ? '#FDE725' :
    t > 1020 ? '#D8E219' :
      t > 960 ? '#B0DD2F' :
        t > 900 ? '#89D548' :
          t > 840 ? '#65CB5E' :
            t > 780 ? '#46C06F' :
              t > 720 ? '#2EB37C' :
                t > 660 ? '#21A585' :
                  t > 600 ? '#1F978B' :
                    t > 540 ? '#23898E' :
                      t > 480 ? '#297B8E' :
                        t > 420 ? '#2E6D8E' :
                          t > 360 ? '#355E8D' :
                            t > 300 ? '#3D4E8A' :
                              t > 240 ? '#433D84' :
                                t > 180 ? '#472A7A' :
                                  t > 120 ? '#481769' :
                                    '#440154';
}
// functions to filter to plot only the selected features 
function stnFilter(feature, layer) {
  if (cur_stn == '0') { return 'true' };
  if (feature.properties.OBJECTID == cur_stn) { return 'true' };
}

function isoFilter(feature, layer) {
  if (feature.properties.OBJECTID == cur_stn && feature.properties.time<=cur_iso) { return 'true' };
}

function isoFilter_border(feature, layer) {
  if (feature.properties.OBJECTID == cur_stn && feature.properties.time == cur_iso) { return 'true' };
}

function incFilter(feature, layer) {
  if (feature.properties.OBJECTID == cur_stn && feature.properties.FECHA_year == cur_year) { return 'true' };
}


// Function to add markers for the fire stations
function add_stn() {
  var myIcon = new L.icon({
    iconUrl: "https://upload.wikimedia.org/wikipedia/commons/3/39/Map_marker_icon_%E2%80%93_Nicolas_Mollet_%E2%80%93_Fire_station_%E2%80%93_Offices_%E2%80%93_White.png",
    iconSize: [32, 37],
    iconAnchor:   [16, 37],
});
  
  try {
    L.geoPackageFeatureLayer([], {
      geoPackageUrl: 'data/isochrones_Fire.gpkg',
      layerName: 'fire_stn',
      // Filter for extracting only the selected station
      filter: stnFilter,
      pointToLayer: function(feature,latlng){
        return L.marker(latlng,{icon: myIcon});
      }
      // style: function (feature) {
      //   return {
      //     icon: myIcon,
      //     // color: '#F00',
      //     // weight: 2,
      //     // opacity: 1,
      //   };
      // }
    }).addTo(cur_layer);
  } catch (e) {
    console.error(e);
  }
};

// Function to show data when the mouse hovers over the isochrones
function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature
  });
}

function highlightFeature(e) {
  let layer = e.target;
  info.update(layer.feature.properties);
}

function resetHighlight(e) {
  info.update();
}

function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}

// Function to show the isochrones
function add_iso() {
  try {
    L.geoPackageFeatureLayer([], {
      geoPackageUrl: 'data/isochrones_Fire.gpkg',
      layerName: 'isochrones',
      // Filter for extracting only the selected station
      filter: isoFilter,
      style: function (feature) {
        return {
          color: getColor(feature.properties.time),
          weight: 0.05,
          opacity: 0,
          fillOpacity: 0.1
        };
      },
      onEachFeature: onEachFeature
    }).addTo(cur_layer);
  } catch (e) {
    console.error(e);
  }
};

// Function to show the border of the isochrones
function add_iso_border() {
  try {
    L.geoPackageFeatureLayer([], {
      geoPackageUrl: 'data/isochrones_Fire.gpkg',
      layerName: 'isochrones',
      // Filter for extracting only the selected station
      filter: isoFilter_border,
      style: function (feature) {
        return {
          color: getColor(feature.properties.time),
          weight: 2,
          opacity: 1,
          fillOpacity: 0
        };
      },
      onEachFeature: onEachFeature
    }).addTo(cur_layer);
  } catch (e) {
    console.error(e);
  }
};

// Functions to add markers with the incidents attended by each station
function add_inc() {
  try {
    L.geoPackageFeatureLayer([], {
      geoPackageUrl: 'data/isochrones_Fire.gpkg',
      layerName: 'fire_incidents',
      // Filter for extracting only the selected station
      filter: incFilter,
      style: function (feature) {
        return {
          color: '#F00',
          weight: 1.1,
          opacity: 0.7,
        };
      }
    }).addTo(cur_layer);
  } catch (e) {
    console.error(e);
  }
};

$(function () {
  // Callback for click event using jQuery Show isochrones and station
  $('#showAllButton').click(function () {
    cur_iso = 30*60;
    cur_stn = "0";
    add_iso();
    add_stn();
  });

  // Callback for click event using jQuery Show isochrones and station
  $('#showButton').click(function () {
    cur_iso = 30*60;
    add_iso();
    add_stn();
  });

    // Callback for click event using jQuery Show isochrones and station
    $('#showButton_inc').click(function () {
      clear_map();
      cur_iso = $("#isoRange").val()*60;
      cur_year = $("#yearRange").val();
      add_inc();
      add_iso_border();
      add_stn();
    });

  // Callback for click event using jQuery Show isochrones and station
  $('#clearButton').click(function () {
    clear_map();
  });
});





