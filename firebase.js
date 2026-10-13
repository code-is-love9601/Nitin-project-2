firebase.initializeApp(firebaseConfig);

const db = firebase.database();
const busId = "bus1";

let map;
let busMarker;

const collegeStop = {
  name: "College Gate",
  lat: 26.7606,
  lng: 83.3732
};

map = L.map("map").setView([collegeStop.lat, collegeStop.lng], 14);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

L.marker([collegeStop.lat, collegeStop.lng])
  .addTo(map)
  .bindPopup("College Gate");

busMarker = L.marker([collegeStop.lat, collegeStop.lng], {
  title: "College Bus"
}).addTo(map);

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(a));
}

db.ref("buses/" + busId).on("value", (snapshot) => {
  const bus = snapshot.val();
  const info = document.getElementById("busInfo");

  if (!bus || !bus.latitude || !bus.longitude) {
    info.innerHTML = `
      <h2>Bus Status</h2>
      <p><strong>Status:</strong> Offline</p>
      <p>Bus location is not available.</p>
    `;
    return;
  }

  const busPosition = [bus.latitude, bus.longitude];

  busMarker.setLatLng(busPosition);
  map.setView(busPosition, map.getZoom());

  const distance = getDistanceKm(
    bus.latitude,
    bus.longitude,
    collegeStop.lat,
    collegeStop.lng
  );

  const speed = bus.speed > 5 ? bus.speed : 25;
  const eta = Math.round((distance / speed) * 60);

  info.innerHTML = `
    <h2>Bus Status</h2>
    <p><strong>Status:</strong> ${bus.active ? "🟢 Running" : "🔴 Offline"}</p>
    <p><strong>Speed:</strong> ${bus.speed || 0} km/h</p>
    <p><strong>Distance to College Gate:</strong> ${distance.toFixed(1)} km</p>
    <p><strong>ETA:</strong> ${eta} minutes</p>
  `;
});