// Create a map object.
let myMap = L.map("map", {
  center: [40.7128, -74.0060],
  zoom: 12
});

// Add a tile layer.
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);


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

  // Average Neighborhood Prices

})



// Use this link to get the GeoJSON data.
let link = "https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/15-Mapping-Web/nyc.geojson";

// The function that will determine the color of a neighborhood based on the borough that it belongs to
function chooseColor(borough) {
if (borough == "Brooklyn") return "yellow";
else if (borough == "Bronx") return "red";
else if (borough == "Manhattan") return "orange";
else if (borough == "Queens") return "green";
else if (borough == "Staten Island") return "purple";
else return "black";
}

// Getting our GeoJSON data
d3.json(link).then(function(data) {
  console.log(data);
// Creating a GeoJSON layer with the retrieved data
L.geoJson(data, {
  style: function(feature) {
    return {
      color: "white",
      fillColor: chooseColor(feature.properties.borough),
      fillOpacity: 0.5,
      weight: 1.5
    };
  }
}).addTo(myMap);
});