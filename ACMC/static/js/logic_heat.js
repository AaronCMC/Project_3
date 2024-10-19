// Create a map object.
let myMap = L.map("map", {
    center: [40.7128, -74.0060],
    zoom: 12
  });
  
// Add a tile layer.
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);


// Fetch data.
d3.csv("../Resources/Airbnb_cleaned.csv").then(function(data) {
    //console.log(data);
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

    // Heat Map
    features = geoJSONData.features;

    let heatArray = [];

    for (let i = 0; i < features.length; i++) {
        let location = features[i].geometry;
        if (location) {
          //console.log(location);
          heatArray.push([location.coordinates[1], location.coordinates[0]]);
          //console.log(heatArray);
        }
    
      }
    
      let heat = L.heatLayer(heatArray, {
        radius: 20,
        blur: 35
      }).addTo(myMap);
})  