firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const statusText = document.getElementById("status");
const errorText = document.getElementById("error");

const busId = "bus1";
let watchId = null;

startBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    errorText.textContent = "Your phone does not support location tracking.";
    return;
  }

  errorText.textContent = "";
  statusText.textContent = "Status: Requesting location permission...";

  watchId = navigator.geolocation.watchPosition(
    (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const speed = position.coords.speed
        ? Math.round(position.coords.speed * 3.6)
        : 0;

      db.ref("buses/" + busId).set({
        active: true,
        latitude: latitude,
        longitude: longitude,
        speed: speed,
        lastUpdated: firebase.database.ServerValue.TIMESTAMP
      });

      statusText.textContent = "Status: Tracking active";
      startBtn.disabled = true;
      stopBtn.disabled = false;
    },
    (error) => {
      errorText.textContent = "Location error: " + error.message;
      statusText.textContent = "Status: Not tracking";
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 15000
    }
  );
});

stopBtn.addEventListener("click", () => {
  navigator.geolocation.clearWatch(watchId);

  db.ref("buses/" + busId).update({
    active: false
  });

  statusText.textContent = "Status: Tracking stopped";
  startBtn.disabled = false;
  stopBtn.disabled = true;
});