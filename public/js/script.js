const socket = io();

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            socket.emit('send-location', { latitude, longitude });
        },
        (err) => {
            console.error(err);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
}

const map = L.map("map").setView([0, 0], 10);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

const markers = {}; 

async function getLocationName(latitude, longitude) {
    try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
        return response.data.display_name; // Get the address
    } catch (error) {
        console.error("Error retrieving location name:", error);
        return "Location not found"; // Fallback if error occurs
    }
}

socket.on("receive-location", async (data) => {
    const { id, latitude, longitude } = data;
    map.setView([latitude, longitude], 20); 

    const locationName = await getLocationName(latitude, longitude);

    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
        markers[id].setPopupContent(`User ID: ${id}<br>Location: ${locationName}<br>Lat: ${latitude}<br>Lng: ${longitude}`);
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map)
            .bindPopup(`User ID: ${id}<br>Location: ${locationName}<br>Lat: ${latitude}<br>Lng: ${longitude}`)
            .openPopup(); 
    }
});

socket.on("user-disconnect", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]); 
        delete markers[id];
    }
});
