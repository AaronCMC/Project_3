// Create a map object centered on New York City.
let myMap = L.map("map", {
    center: [40.7128, -74.0060],
    zoom: 12
});

// Add a tile layer to the map using OpenStreetMap.
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Links to GeoJSON and CSV data sources.
let link = "https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/15-Mapping-Web/nyc.geojson";
let csvLink = "../Resources/avg.csv";

// Function to merge CSV data into GeoJSON features.
function mergeData(geoJsonData, csvData) {
    let csvLookup = {};

    // Create a lookup object from CSV data.
    csvData.forEach(row => {
        let borough = row.borough;
        let neighborhood = row.neighborhood; // Assumed column in CSV
        let price = row.price; // Assumed column in CSV
        let serviceFee = row['service fee']; // Assumed column in CSV
        let reviewRate = row['review rate number']; // Assumed column in CSV
        let listingCount = row['number of listings'];

        csvLookup[neighborhood] = { borough, price, serviceFee, reviewRate, listingCount };
    });

    // Merge data into GeoJSON features.
    geoJsonData.features.forEach(feature => {
        let neigh = feature.properties.neighborhood; // Assumed property in GeoJSON

        if (csvLookup[neigh]) {
            feature.properties.borough = csvLookup[neigh].borough;
            feature.properties.price = csvLookup[neigh].price; // Add price from CSV
            feature.properties.serviceFee = csvLookup[neigh].serviceFee; // Add service fee from CSV
            feature.properties.reviewRate = csvLookup[neigh].reviewRate; // Add review rate from CSV
            feature.properties.listingCount = csvLookup[neigh].listingCount;
        }
    });
}

// Function to choose color based on price.
function chooseColor(price) {
    if (price > 1000) {
        return "#FF0000"; // red
    } else if (price > 800) {
        return "#FF6600"; // dark orange
    } else if (price > 600) {
        return "#FFCC00"; // orange
    } else if (price > 400) {
        return "#FFFF00"; // yellow
    } else if (price > 200) {
        return "#CCFF00"; // yellowish green
    } else if (price < 200) {
        return "#00FF00"; // light green
    } else {
        return "black";
    }
}

// Create layers for subway, heatmap, neighborhoods, and markers.
let subwayLayer = L.layerGroup();
let heatLayer = L.layerGroup();
let neighborhoodLayer; // Declare but do not initialize yet
let markerLayer = L.layerGroup(); // Layer for markers

// Function to create layer control for the map.
function createLayerControl() {
    let overlayMaps = {
        "NYC Subway": subwayLayer,
        "Heatmap": heatLayer,
        "NYC Neighborhoods": neighborhoodLayer, // Add neighborhoods to the layer control
        "Airbnb Markers": markerLayer // Add markers to the layer control
    };

    // Create layer control and add it to the map.
    L.control.layers(null, overlayMaps).addTo(myMap);
}

// Fetch NYC Neighborhoods data.
d3.json(link).then(function(geoJsData) {
    console.log("nyc.geojson Data:", geoJsData);

    // Load CSV data.
    d3.csv(csvLink).then(function(csvData) {
        console.log("avg.csv Data:", csvData);

        // Merge the GeoJSON and CSV data.
        mergeData(geoJsData, csvData);

        // Create a GeoJSON layer with the merged data.
        neighborhoodLayer = L.geoJson(geoJsData, {
            style: function(feature) {
                return {
                    color: "white",
                    fillColor: chooseColor(feature.properties.price),
                    fillOpacity: 0.5,
                    weight: 1.5
                };
            },
            onEachFeature: function(feature, layer) {
                // Set mouse events to change the map styling.
                if (feature.properties.price || feature.properties.serviceFee || feature.properties.reviewRate || feature.properties.listingCount) {
                    layer.on({
                        mouseover: function(event) {
                            layer = event.target;
                            layer.setStyle({
                                fillOpacity: 0.9 // Highlight on mouseover
                            });
                        },
                        mouseout: function(event) {
                            layer = event.target;
                            layer.setStyle({
                                fillOpacity: 0.5 // Revert on mouseout
                            });
                        }
                    });
                }
                
                // Bind a tooltip or popup showing the CSV data.
                if (feature.properties.price || feature.properties.serviceFee || feature.properties.reviewRate || feature.properties.listingCount) {
                    layer.bindPopup(`
                        <h3>${feature.properties.borough}</h3>
                        <strong>Neighborhood:</strong> ${feature.properties.neighborhood}<br>
                        <strong>Price:</strong> ${feature.properties.price}<br>
                        <strong>Service Fee:</strong> ${feature.properties.serviceFee}<br>
                        <strong>Review Rate:</strong> ${feature.properties.reviewRate}<br>
                        <strong>Number of Listings:</strong> ${feature.properties.listingCount}
                    `);
                }
            }
        });

        // Create the layer control after all layers are initialized.
        createLayerControl();
    });
});

// NYC Subway Line data link.
let subwayLink = "../Data/NYC Subway Lines.geojson";

// Fetch subway line data and add it to the subway layer.
d3.json(subwayLink).then(function(subwayGeoData) {
    console.log("nyc subway data:", subwayGeoData);
    L.geoJson(subwayGeoData).addTo(subwayLayer);
});

// Fetch Airbnb data.
d3.csv("../Resources/Airbnb_cleaned.csv").then(function(data) {
    // Convert CSV data to GeoJSON format.
    let geoJSONFeatures = data.map(row => {
        return {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [parseFloat(row.long), parseFloat(row.lat)]
            },
            properties: {
                id: row["id"],
                name: row["NAME"],
                hostId: row["host id"],
                hostIdentityVerified: row["host_identity_verified"],
                neighbourhoodGroup: row["neighbourhood group"],
                neighbourhood: row["neighbourhood"],
                lat: row["lat"],
                long: row["long"],
                instantBookable: row["instant_bookable"],
                cancellationPolicy: row["cancellation_policy"],
                roomType: row["room type"],
                constructionYear: row["Construction year"],
                price: row["price"],
                serviceFee: row["service fee"],
                minimumNights: row["minimum nights"],
                numberOfReviews: row["number of reviews"],
                reviewsPerMonth: row["reviews per month"],
                reviewRateNumber: row["review rate number"],
                calculatedHostListingsCount: row["calculated host listings count"],
                availability365: row["availability 365"]
            }
        };
    });

    let geoJSONData = {
        type: "FeatureCollection",
        features: geoJSONFeatures
    };
    console.log("airbnb data:", geoJSONData);

    // Heat Map
    let features = geoJSONData.features;
    let heatArray = [];

    // Prepare data for heatmap.
    for (let i = 0; i < features.length; i++) {
        let location = features[i].geometry;
        if (location) {
            heatArray.push([location.coordinates[1], location.coordinates[0]]);
        }
    }

    // Create heat layer.
    let heat = L.heatLayer(heatArray, {
        radius: 20,
        blur: 35
    }).addTo(heatLayer);

    // Function to determine marker radius based on review rate.
    function markerRadius(reviewRateNumber) {
        return reviewRateNumber === 0 ? 1 : reviewRateNumber * 1.5; // Minimum radius for ratings of 0
    }
    
    // Function to determine marker color based on price.
    function markerColor(price) {
        if (price > 1000) {
            return "#FF0000"; // red
        } else if (price > 800) {
            return "#FF6600"; // dark orange
        } else if (price > 600) {
            return "#FFCC00"; // orange
        } else if (price > 400) {
            return "#FFFF00"; // yellow
        } else if (price > 200) {
            return "#CCFF00"; // yellowish green
        } else {
            return "#00FF00"; // light green
        }
    }

    // Function to style markers based on properties.
    function markerStyle(feature) {
        return {
            radius: markerRadius(feature.properties.reviewRateNumber),
            fillColor: markerColor(feature.properties.price),
            fillOpacity: 0.75,
            color: "black",
            opacity: 1,
            weight: 1
        };
    }

    // Create markers and add them to the marker layer.
    L.geoJSON(geoJSONData, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, markerStyle(feature));
        },
        style: markerStyle,
        onEachFeature: function(feature, layer) {
            layer.bindPopup(`
                <h3>${feature.properties.name}</h3>
                <strong>${feature.properties.neighbourhood}, ${feature.properties.neighbourhoodGroup}</strong><br>
                <strong>Room Type:</strong> ${feature.properties.roomType}<br>
                <strong>Price:</strong> ${feature.properties.price}<br>
                <strong>Service Fee:</strong> ${feature.properties.serviceFee}<br>
                <strong>Minimum Nights:</strong> ${feature.properties.minimumNights}<br>
                <strong>Cancellation Policy:</strong> ${feature.properties.cancellationPolicy}<br>
                <strong>Review Rating:</strong> ${feature.properties.reviewRateNumber}<br>
                <strong>Number of Reviews:</strong> ${feature.properties.numberOfReviews}
            `);
        } 
    }).addTo(markerLayer); // Add markers to markerLayer

    // Create the layer control after all layers are initialized.
    createLayerControl();
});
