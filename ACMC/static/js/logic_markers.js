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
*/

// Marker radius function based on availability365
function markerRadius(reviewRateNumber) {
    // Set a minimum radius for ratings of 0
    if (reviewRateNumber === 0) {
        return 1; // Minimum radius for rating 0
    } else {
        return reviewRateNumber * 1.5;
    }
}

// Marker color function based on price
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

// Marker style function with radius based on magnitude and color based on depth
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
    
    L.geoJSON(geoJSONData, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, markerStyle(feature));
        },
        style: markerStyle,
        onEachFeature: function (feature, layer) {
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
    }).addTo(myMap)
})  




