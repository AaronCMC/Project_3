// Create a map object.
let myMap = L.map("map", {
  center: [40.7128, -74.0060],
  zoom: 12
});

// Add a tile layer.
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

/*
// Function to calculate average 
function calculateAverageNeighborhoodPrice(data, criteria) {
  // Filter the data based on the criteria
  const filteredData = data.filter(item => item.neighbourhoodGroup === criteria);
  // Calculate the sum of the filtered data
  const sum = filteredData.reduce((acc, item) => acc + item.price, 0);
  // Calculate the average
  const average = filteredData.length > 0 ? sum / filteredData.length : 0;
  return average;
}


// Fetch data.
d3.csv("../Resources/Airbnb_cleaned.csv").then(function(data) {
  console.log(data);

  // Convert CSV data to GeoJSON format
  const geoJSONFeatures = data.map(row => {
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

  const geoJSONData  ={
      type: "FeatureCollection",
      features: geoJSONFeatures
  };

  console.log(geoJSONData);
})
*/


// Use this link to get the GeoJSON data.
let link = "https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/15-Mapping-Web/nyc.geojson";
let csvLink = "../Resources/avg.csv";

// Function to merge CSV data into GeoJSON
function mergeData(geoJsonData, csvData) {
// Create a lookup table from the CSV data
const csvLookup = {};
csvData.forEach(row => {
    const borough = row.borough
    const neighborhood = row.neighborhood; // Assumed column in CSV
    const price = row.price; // Assumed column in CSV
    const serviceFee = row['service fee']; // Assumed column in CSV
    const reviewRate = row['review rate number']; // Assumed column in CSV
    csvLookup[neighborhood] = {borough, price, serviceFee, reviewRate }; // Store all three values
});

// Attach CSV data to GeoJSON features
geoJsonData.features.forEach(feature => {
    const neigh = feature.properties.neighborhood; // Assumed property in GeoJSON
    if (csvLookup[neigh]) {
        feature.properties.borough = csvLookup[neigh].borough
        feature.properties.price = csvLookup[neigh].price; // Add price from CSV
        feature.properties.serviceFee = csvLookup[neigh].serviceFee; // Add service fee from CSV
        feature.properties.reviewRate = csvLookup[neigh].reviewRate; // Add review rate from CSV
    }
});
}

/*function chooseColor(borough) {
    if (borough == "Brooklyn") return "yellow";
    else if (borough == "Bronx") return "red";
    else if (borough == "Manhattan") return "orange";
    else if (borough == "Queens") return "green";
    else if (borough == "Staten Island") return "purple";
    else return "black";
  }
*/

// The function that will determine the color of a neighborhood based on the borough that it belongs to
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
        return "black"     
    } 
}

// Getting our GeoJSON data
d3.json(link).then(function(geoJsData) {
console.log(geoJsData);

// Load CSV data
d3.csv(csvLink).then(function(csvData) {
    console.log(csvData);
    
    // Merge the GeoJSON and CSV data
    mergeData(geoJsData, csvData);
    
    // Creating a GeoJSON layer with the retrieved data
    L.geoJson(geoJsData, {
        style: function(feature) {
            return {
                color: "white",
                fillColor: chooseColor(feature.properties.price),
                fillOpacity: 0.5,
                weight: 1.5
            };
        },
        onEachFeature: function(feature, layer) {
            // Set the mouse events to change the map styling.
            layer.on({
                // When a user's mouse cursor touches a map feature, the mouseover event calls this function, which makes that feature's opacity change to 90% so that it stands out.
                mouseover: function(event) {
                layer = event.target;
                layer.setStyle({
                    fillOpacity: 0.9
                });
                },
                // When the cursor no longer hovers over a map feature (that is, when the mouseout event occurs), the feature's opacity reverts back to 50%.
                mouseout: function(event) {
                layer = event.target;
                layer.setStyle({
                    fillOpacity: 0.5
                });
                },
                // When a feature (neighborhood) is clicked, it enlarges to fit the screen.
                click: function(event) {
                myMap.fitBounds(event.target.getBounds());
                }
            });
            // Bind a tooltip or popup showing the CSV data
            if (feature.properties.borough || feature.properties.price || feature.properties.serviceFee || feature.properties.reviewRate) {
                layer.bindPopup(`
                    <h3>${feature.properties.borough}</h3>
                    <strong>Neighborhood:</strong> ${feature.properties.neighborhood}<br>
                    <strong>Price:</strong> ${feature.properties.price}<br>
                    <strong>Service Fee:</strong> ${feature.properties.serviceFee}<br>
                    <strong>Review Rate:</strong> ${feature.properties.reviewRate}
                `);
            }
        }
    }).addTo(myMap);
});
});



// NYC Subway Line
let subwayLink = "../Data/NYC Subway Lines.geojson";

d3.json(subwayLink).then(function(subwayGeoData) {
    console.log(subwayGeoData);
    
    L.geoJson(subwayGeoData).addTo(myMap);
})
