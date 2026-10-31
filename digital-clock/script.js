
function updateClock() {

    // Get the current time
    const now = new Date();

    // Extract hours, minutes and seconds
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();

    // Determine AM or PM
    const ampm = hours >= 12 ? "PM" : "AM";

    // Convert to 12-hour format
    hours = hours % 12 || 12;

    // Add zero before single-digit numbers
    hours = String(hours).padStart(2, "0");
    minutes = String(minutes).padStart(2, "0");
    seconds = String(seconds).padStart(2, "0");

    // Display the time
    document.getElementById("clock").textContent =
        `${hours}:${minutes}:${seconds} ${ampm}`;
}

// Update the clock every second
updateClock();
setInterval(updateClock, 1000);
