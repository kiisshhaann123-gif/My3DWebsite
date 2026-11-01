const fireCanvas = document.getElementById("fire-canvas");
const fireContext = fireCanvas.getContext("2d");

let fireParticles = [];
let fireAnimationId = null;
let fireActive = false;

function resizeFireCanvas() {
    const rect = fireCanvas.getBoundingClientRect();

    fireCanvas.width = rect.width * window.devicePixelRatio;
    fireCanvas.height = rect.height * window.devicePixelRatio;

    fireContext.setTransform(
        window.devicePixelRatio,
        0,
        0,
        window.devicePixelRatio,
        0,
        0
    );
}

function createFireParticle() {
    const width = fireCanvas.clientWidth;
    const height = fireCanvas.clientHeight;

    return {
        x: Math.random() * width,
        y: height + Math.random() * 20,
        size: Math.random() * 22 + 10,
        speed: Math.random() * 2.5 + 1.5,
        drift: (Math.random() - 0.5) * 1.5,
        life: 1,
        decay: Math.random() * 0.012 + 0.008,
        hue: Math.random() * 25 + 15
    };
}

function drawFireParticle(particle) {
    const gradient = fireContext.createRadialGradient(
        particle.x,
        particle.y,
        0,
        particle.x,
        particle.y,
        particle.size
    );

    gradient.addColorStop(0, `rgba(255, 255, 190, ${particle.life * 0.45})`);
    gradient.addColorStop(0.25, `hsla(45, 100%, 55%, ${particle.life * 0.3})`);
    gradient.addColorStop(0.6, `hsla(${particle.hue}, 100%, 50%, ${particle.life * 0.2})`);
    gradient.addColorStop(1, "rgba(180, 15, 0, 0)");

    fireContext.fillStyle = gradient;
    fireContext.beginPath();
    fireContext.arc(
        particle.x,
        particle.y,
        particle.size,
        0,
        Math.PI * 2
    );
    fireContext.fill();
}

function animateFire() {
    const width = fireCanvas.clientWidth;
    const height = fireCanvas.clientHeight;

    fireContext.clearRect(0, 0, width, height);

    for (let i = 0; i < 12; i++) {
        fireParticles.push(createFireParticle());
    }

    fireParticles.forEach((particle) => {
        particle.y -= particle.speed;
        particle.x += particle.drift + Math.sin(particle.y * 0.04) * 0.5;
        particle.life -= particle.decay;
        particle.size *= 0.995;

        drawFireParticle(particle);
    });

    fireParticles = fireParticles.filter(
        particle => particle.life > 0 && particle.y > -50
    );

    if (fireActive) {
        fireAnimationId = requestAnimationFrame(animateFire);
    }
}

export function startRealisticFire() {
    resizeFireCanvas();

    fireParticles = [];
    fireActive = true;

    if (fireAnimationId) {
        cancelAnimationFrame(fireAnimationId);
    }

    animateFire();
}

export function stopRealisticFire() {
    fireActive = false;

    if (fireAnimationId) {
        cancelAnimationFrame(fireAnimationId);
    }

    fireContext.clearRect(
        0,
        0,
        fireCanvas.clientWidth,
        fireCanvas.clientHeight
    );

    fireParticles = [];
}