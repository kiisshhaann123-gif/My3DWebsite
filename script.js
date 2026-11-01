
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Create scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x252b3b);

// Find the hero container
const container = document.getElementById('hero-3d');

// Create camera
const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
);

camera.position.set(0, 0, 7.8);

// Create renderer
const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(
    container.clientWidth,
    container.clientHeight
);

container.appendChild(renderer.domElement);

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 3);
light.position.set(2, 3, 5);
scene.add(light);

scene.add(new THREE.AmbientLight(0xffffff, 1));

// Load GLB model
const loader = new GLTFLoader();

let mixer;

loader.load(
    './models/Header_animation.glb',

    function (gltf) {

        const model = gltf.scene;

        model.scale.set(1.7, 1.7, 1.7);
        model.position.set(0, 0, 0);

        scene.add(model);

        // Play animation
        if (gltf.animations.length > 0) {

            mixer = new THREE.AnimationMixer(model);

            const action = mixer.clipAction(
                gltf.animations[0]
            );

            action.play();
        }

        console.log("3D animation loaded!");

    },

    undefined,

    function (error) {
        console.error("Error loading model:", error);
    }
);

// Handle browser resizing
window.addEventListener('resize', () => {

    camera.aspect =
        container.clientWidth / container.clientHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        container.clientWidth,
        container.clientHeight
    );

});

// Animation loop
const clock = new THREE.Clock();

function animate() {

    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    if (mixer) {
        mixer.update(delta);
    }

    renderer.render(scene, camera);
}

animate();
// SCROLL ANIMATIONS

const sections = document.querySelectorAll(".content-section, .hidden");

const observer = new IntersectionObserver((entries) => {

    entries.forEach((entry) => {

        if (entry.isIntersecting) {
            entry.target.classList.add("show");

            console.log("Animation triggered:", entry.target);
        }

    });

}, {
    threshold: 0.15
});

sections.forEach((section) => {
    observer.observe(section);
});


// ART GALLERY CATEGORY SWITCHING

const galleryTabs = document.querySelectorAll(".gallery-tab");
const galleryContents = document.querySelectorAll(".gallery-content");

galleryTabs.forEach((tab) => {

    tab.addEventListener("click", () => {

        // Remove active status from all tabs
        galleryTabs.forEach((item) => {
            item.classList.remove("active");
        });

        // Hide all gallery contents
        galleryContents.forEach((content) => {
            content.classList.remove("active");
        });

        // Activate clicked tab
        tab.classList.add("active");

        // Show selected category
        const category = tab.dataset.category;

        document.getElementById(category).classList.add("active");

    });

});
// ARTWORK LIGHTBOX
// ARTWORK LIGHTBOX WITH PREVIOUS AND NEXT

const artImages = document.querySelectorAll(
    ".gallery-grid .art-card img"
);

const lightbox = document.getElementById("art-lightbox");
const lightboxImage = document.getElementById("lightbox-image");
// DETECT TOUCH START
lightbox.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0].screenX;
});

// DETECT TOUCH END
lightbox.addEventListener("touchend", (event) => {
    touchEndX = event.changedTouches[0].screenX;

    handleSwipe();
});
const closeLightbox = document.querySelector(".lightbox-close");

const prevButton = document.getElementById("prev-art");
const nextButton = document.getElementById("next-art");
const artCaption = document.getElementById("art-caption");
const playButton = document.getElementById("play-art");
const pauseButton = document.getElementById("pause-art");
// PLAY BUTTON
playButton.addEventListener("click", startSlideshow);

// PAUSE BUTTON
pauseButton.addEventListener("click", pauseSlideshow);

let slideshowInterval = null;

let currentImages = [];
let currentIndex = 0;
// MOBILE SWIPE NAVIGATION

let touchStartX = 0;
let touchEndX = 0;

// OPEN ARTWORK
artImages.forEach((image) => {

    image.addEventListener("click", () => {

        const gallery = image.closest(".gallery-content");

        currentImages = Array.from(
            gallery.querySelectorAll(".art-card img")
        );

        currentIndex = currentImages.indexOf(image);

        showArtwork();

        lightbox.classList.add("active");

    });

});

// DISPLAY SELECTED ARTWORK
function showArtwork() {

    lightboxImage.src = currentImages[currentIndex].src;

    artCaption.textContent =
        `${currentImages[currentIndex].alt} — ${currentIndex + 1} of ${currentImages.length}`;

}
// HANDLE MOBILE SWIPES
function handleSwipe() {

    const swipeDistance = touchEndX - touchStartX;

    // Ignore small finger movements
    if (Math.abs(swipeDistance) < 50) {
        return;
    }

    // Swipe left = Next artwork
    if (swipeDistance < 0) {
        nextButton.click();
    }

    // Swipe right = Previous artwork
    if (swipeDistance > 0) {
        prevButton.click();
    }

}
// START SLIDESHOW
function startSlideshow() {

    if (slideshowInterval !== null) {
        return;
    }

    slideshowInterval = setInterval(() => {
        currentIndex++;

        if (currentIndex >= currentImages.length) {
            currentIndex = 0;
        }

        showArtwork();

    }, 3000);
}


// PAUSE SLIDESHOW
function pauseSlideshow() {

    clearInterval(slideshowInterval);
    slideshowInterval = null;

}


// NEXT ARTWORK
nextButton.addEventListener("click", () => {

    currentIndex++;

    if (currentIndex >= currentImages.length) {
        currentIndex = 0;
    }

    showArtwork();

});

// PREVIOUS ARTWORK
prevButton.addEventListener("click", () => {

    currentIndex--;

    if (currentIndex < 0) {
        currentIndex = currentImages.length - 1;
    }

    showArtwork();

});

// CLOSE LIGHTBOX
function closeArtwork() {
    pauseSlideshow();
    lightbox.classList.remove("active");
}


closeLightbox.addEventListener("click", closeArtwork);

lightbox.addEventListener("click", (event) => {

    if (event.target === lightbox) {
        closeArtwork();
    }

});

// KEYBOARD NAVIGATION
document.addEventListener("keydown", (event) => {

    if (!lightbox.classList.contains("active")) {
        return;
    }

    if (event.key === "ArrowRight") {
        nextButton.click();
    }

    if (event.key === "ArrowLeft") {
        prevButton.click();
    }

    if (event.key === "Escape") {
        closeArtwork();
    }

});


// VIDEO LIGHTBOX

const videos = document.querySelectorAll(".video-card video");

const videoLightbox = document.getElementById("video-lightbox");
const lightboxVideo = document.getElementById("lightbox-video");
const closeVideoLightbox = document.querySelector(".video-lightbox-close");

videos.forEach((video) => {
    video.addEventListener("click", (event) => {

        event.preventDefault();

        const videoSource = video.querySelector("source").src;

        lightboxVideo.src = videoSource;
        videoLightbox.classList.add("active");

        lightboxVideo.play();

    });
});

function closeVideo() {
    lightboxVideo.pause();
    lightboxVideo.removeAttribute("src");
    lightboxVideo.load();

    videoLightbox.classList.remove("active");
}

closeVideoLightbox.addEventListener("click", closeVideo);

videoLightbox.addEventListener("click", (event) => {
    if (event.target === videoLightbox) {
        closeVideo();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeVideo();
    }
});

// CONTACT FORM SUBMISSION

const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");

contactForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const formData = new FormData(contactForm);

    try {
        const response = await fetch(contactForm.action, {
            method: "POST",
            body: formData,
            headers: {
                "Accept": "application/json"
            }
        });

        if (response.ok) {
            formStatus.textContent =
                "Thank you! Your message has been sent successfully. I'll get back to you soon.";

            formStatus.style.color = "#00c853";

            contactForm.reset();
        } else {
            formStatus.textContent =
                "Oops! Something went wrong. Please try again.";

            formStatus.style.color = "red";
        }

    } catch (error) {
        formStatus.textContent =
            "Unable to send your message. Please check your internet connection.";

        formStatus.style.color = "red";
    }

});
// BACK TO TOP BUTTON

const backToTopButton = document.getElementById("back-to-top");

// Show button when scrolling down
window.addEventListener("scroll", function() {

    if (window.scrollY > 300) {
        backToTopButton.classList.add("show");
    } else {
        backToTopButton.classList.remove("show");
    }

});

// Scroll smoothly to the top when clicked
backToTopButton.addEventListener("click", function() {

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});
// SCROLL PROGRESS BAR

const scrollProgress = document.getElementById("scroll-progress");

window.addEventListener("scroll", function() {

    const scrollTop = window.scrollY;

    const documentHeight =
        document.documentElement.scrollHeight - window.innerHeight;

    const scrollPercentage =
        (scrollTop / documentHeight) * 100;

    scrollProgress.style.width = scrollPercentage + "%";

});
