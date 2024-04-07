let layer_jds;


function adm_style(feature) {
    return {
        color: "black",
        weight: 1,
        opacity: 0.4,
        fillOpacity: 0.05
    };
}

// Function to show the isochrones
function add_adm_border() {
    try {
        L.geoPackageFeatureLayer([], {
            geoPackageUrl: 'data/isochrones_Fire.gpkg',
            layerName: 'fire_areas',
            style: adm_style,
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<div class="popup-jrs"><a><b>Assigned Station:</b><br/></a>'+
                feature.properties.NOMBRE_EST+'</a></div>');
              }            
        }).addTo(layer_jds);
    } catch (e) {
        console.error(e);
    }
    layer_jds.addTo(map);
    layer_jds.eachLayer(function (layer) {
        layer.bringToBack();
    });
};

// Function to clear the map
function clear_jds() {  
    layer_jds.clearLayers();
  }

