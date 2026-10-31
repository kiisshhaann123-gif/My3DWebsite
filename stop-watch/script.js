
const display = document.getElementById("display");

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const resetBtn = document.getElementById("resetBtn");

let startTime = 0;
let elapsedTime = 0;
let timer = null;

// Start the stopwatch
function start() {

    if (timer !== null) {
        return;
    }

    startTime = Date.now() - elapsedTime;

    timer = setInterval(update, 10);
}

// Stop the stopwatch
function stop() {

    clearInterval(timer);
    timer = null;
}

// Reset the stopwatch
function reset() {

    clearInterval(timer);
    timer = null;

    startTime = 0;
    elapsedTime = 0;

    display.textContent = "00:00:00.00";
}

// Update the displayed time
function update() {

    elapsedTime = Date.now() - startTime;

    let hours = Math.floor(elapsedTime / (1000 * 60 * 60));
    let minutes = Math.floor(elapsedTime / (1000 * 60) % 60);
    let seconds = Math.floor(elapsedTime / 1000 % 60);
    let milliseconds = Math.floor(elapsedTime % 1000 / 10);

    hours = String(hours).padStart(2, "0");
    minutes = String(minutes).padStart(2, "0");
    seconds = String(seconds).padStart(2, "0");
    milliseconds = String(milliseconds).padStart(2, "0");

    display.textContent =
        `${hours}:${minutes}:${seconds}.${milliseconds}`;
}

// Connect buttons to functions
startBtn.addEventListener("click", start);
stopBtn.addEventListener("click", stop);
resetBtn.addEventListener("click", reset);
