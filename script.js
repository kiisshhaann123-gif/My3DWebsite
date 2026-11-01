
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Little Dino Companion
const dinoContainer = document.getElementById('dino-companion');
const dinoMessage = document.getElementById('dino-message');
const dinoMenu = document.getElementById('dino-menu');
// Dottie's destination menu
dinoMenu.innerHTML = `
    <h3 id="dino-menu-heading" style="text-align: center; color: #51406f;">
        Where shall we go? 🦕
    </h3>

    <button data-section="home">🏠 Home</button>
    <button data-section="about">💜 About Me</button>
    <button data-section="projects">🚀 Projects</button>
    <button data-section="gallery">🎨 Art Gallery</button>
    <button data-section="contact">💌 Contact</button>
`;
const dinoMenuHeading = document.getElementById('dino-menu-heading');

// Dottie's funny and encouraging messages
const dinoMessages = [
    "Smile! It looks good on you! 😁",
    "You're dino-mite! 🦕",
    "Oops! Did you just forget to smile? 😂",
    "Keep shining, superstar! ✨",
    "Life is short. Eat more snacks! 🍕",
    "Tiny arms, BIG dreams! 💪",
    "Don't worry, I've seen worse... I'm a dinosaur! 😂",
    "You rock! And I should know, I'm from the Stone Age! 🪨",
    "Sending you a big dino hug! 🤗",
    "Today looks better with you in it! 💜",
    "Roar means 'You're amazing!' in dinosaur language! 🦖",
    "If at first you don't succeed, take a nap! 😴",
    "Stay pawsitive! Wait... I don't have paws! 😂",
    "You're doing great. Now go get yourself a treat! 🍪"
];
// Sections Dottie will visit during her tour
const tourSections = [
    "home",
    "about",
    "projects",
    "gallery",
    "contact"
];
// Find the heading Dottie should approach
const tourHeadingSelectors = {
    home: "#home",
    about: "#about .about-text h1",
    projects: "#projects .projects-title",
    gallery: "#gallery .gallery-heading h1",
    contact: "#contact .contact-heading h1"
};
// What Dottie says at each website section
const tourMessages = {
    home: "Welcome to my little world! 🦕",
    about: "Here's a little introduction to my human! 💜",
    projects: "Look at all these cool creations! ✨",
    gallery: "Welcome to the art corner! So much creativity! 🎨",
    contact: "Want to say hello? My human would love that! 💌"
};
// Dottie's destination hover previews
const dinoPreviewMessages = {
    home: "Let's head home! 🏠",
    about: "Want to meet my human? 💜",
    projects: "Ooh, exciting creations ahead! 🚀",
    gallery: "Time for some colourful art! 🎨",
    contact: "Let's say hello! 💌"
};
function visitTourSection() {
    const sectionId = tourSections[currentTourIndex];
    const section = document.getElementById(sectionId);
    const heading = document.querySelector(
        tourHeadingSelectors[sectionId]
    );

    if (!section || !heading) return;

    // Scroll to the destination
    section.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    // Give the page time to scroll
    setTimeout(() => {

        // Reset Dottie to her original position before a new journey
        const previousTransition = dinoContainer.style.transition;

        dinoContainer.style.transition = "none";
        dinoContainer.style.transform = "translate(0px, 0px) scale(1)";

        const dinoRect = dinoContainer.getBoundingClientRect();

        // Restore her smooth movement transition
        void dinoContainer.offsetWidth;
        dinoContainer.style.transition = previousTransition;
        const headingRect = heading.getBoundingClientRect();
        let targetX =
    headingRect.left + headingRect.width / 2;

        let targetY = headingRect.bottom + 90;

        // Give Dottie a special spot at the Contact section
            if (sectionId === "contact") {

            const nameField = document.querySelector(
                '#contact input[placeholder="Your Name"]'
            );

            if (nameField) {
                const nameRect = nameField.getBoundingClientRect();

                targetX = nameRect.right - 80;
                targetY = nameRect.top - 110;
            }
        }

        // Keep Dottie within the visible screen
        const minX = dinoRect.width / 2 + 15;
        const maxX = window.innerWidth - dinoRect.width / 2 - 15;
        

        targetX = Math.max(minX, Math.min(targetX, maxX));
        // Keep Dottie within the visible screen vertically
        const minY = dinoRect.height / 2 + 15;
        const maxY = window.innerHeight - dinoRect.height / 2 - 15;

        targetY = Math.max(minY, Math.min(targetY, maxY));

        

        const moveX = targetX - (dinoRect.left + dinoRect.width / 2);
        const moveY = targetY - (dinoRect.top + dinoRect.height / 2);

        // Turn Dottie toward her destination
        if (moveX > 0) {
            dinoModel.rotation.y = 0;
        } else if (moveX < 0) {
            dinoModel.rotation.y = -Math.PI;
        }

        // Stop waving while walking
        if (dinoWaveAction) {
            dinoWaveAction.fadeOut(0.2);
        }

        // Start walking
        if (dinoWalkAction) {
            dinoWalkAction.reset();
            dinoWalkAction.timeScale = 0.25;
            dinoWalkAction.fadeIn(0.2);
            dinoWalkAction.play();
        }

        // Move Dottie toward the heading
        dinoContainer.style.transform =
            `translate(${moveX}px, ${moveY}px) scale(0.65)`;

        // Begin slowing down after 1.5 seconds
        setTimeout(() => {

            if (dinoWalkAction) {
                dinoWalkAction.timeScale = 0.08;
            }

            // Stop after slowing down
            setTimeout(() => {

                if (dinoWalkAction) {
                    dinoWalkAction.stop();
                    dinoWalkAction.timeScale = 0.25;
                }

                // Face the visitor again
                dinoModel.rotation.y = -Math.PI / 2;

                // Show Dottie's message
                dinoMessage.textContent = tourMessages[sectionId];
                dinoMessage.style.display = "block";

                // Position the bubble above Dottie's current location
                const bubbleDinoRect = dinoContainer.getBoundingClientRect();
                const bubbleWidth = dinoMessage.offsetWidth;
                const bubbleHeight = dinoMessage.offsetHeight;

                dinoMessage.style.left =
                    `${Math.max(10, Math.min(
                        bubbleDinoRect.left + bubbleDinoRect.width / 2 - bubbleWidth / 2,
                        window.innerWidth - bubbleWidth - 10
                    ))}px`;

                dinoMessage.style.top =
                    `${Math.max(10, bubbleDinoRect.top - bubbleHeight - 15)}px`;

                dinoMessage.style.right = "auto";
                dinoMessage.style.bottom = "auto";

                
                // Wait 5 seconds, then return home
            setTimeout(() => {
                returnDinoHome();
            }, 5000);
                // Wait 5 seconds before visiting the next section

            }, 700);

        }, 1500);

    }, 1500);
}
// Bring Dottie back to her home
// Bring Dottie back to her home
function returnDinoHome() {
    dinoMessage.style.display = "none";
    const heading = dinoMenu.querySelector("#dino-menu-heading");

        if (heading) {
            heading.textContent = "Back again! Where next? 💜";
            
        }

    // Start walking back
    if (dinoWalkAction) {
        dinoWalkAction.reset();
        dinoWalkAction.timeScale = 0.25;
        dinoWalkAction.fadeIn(0.2);
        dinoWalkAction.play();
    }

    // Face toward her original bottom-right position
    dinoModel.rotation.y = 0;

    // Walk back to her original position and size
    dinoContainer.style.transform =
        `translate(${dinoHome.x}px, ${dinoHome.y}px) scale(${dinoHome.scale})`;

    // Stop walking after the return animation
    setTimeout(() => {
        isTourActive = false;

        if (dinoWalkAction) {
            dinoWalkAction.stop();
            dinoWalkAction.timeScale = 0.25;
        }

        // Face the visitor again
        dinoModel.rotation.y = -Math.PI / 2;

        // Hide the tour message
        
        // Give Dottie a new menu greeting
        
        // Clear the active destination highlight
        dinoMenu.querySelectorAll("button[data-section]").forEach((button) => {
            button.classList.remove("active");
        });

    }, 2000);
}
// Handle Dottie's destination selections
dinoMenu.addEventListener("click", (event) => {
    // Show Dottie's preview when hovering over a destination
// Keep track of the preview hide timer
let dinoPreviewTimer;

// Show preview when hovering over a destination
dinoMenu.addEventListener("mouseover", (event) => {

    const button = event.target.closest("button[data-section]");

    if (!button) return;

    // Cancel any pending hide
    clearTimeout(dinoPreviewTimer);

    const destination = button.dataset.section;

    dinoMessage.textContent = dinoPreviewMessages[destination];
    dinoMessage.style.display = "block";

    // Find Dottie's current position
    const dinoRect = dinoContainer.getBoundingClientRect();

    const bubbleWidth = dinoMessage.offsetWidth;
    const bubbleHeight = dinoMessage.offsetHeight;

    const left = Math.max(
        10,
        Math.min(
            dinoRect.left + dinoRect.width / 2 - bubbleWidth / 2,
            window.innerWidth - bubbleWidth - 10
        )
    );

    dinoMessage.style.left = `${left}px`;
    dinoMessage.style.top =
        `${Math.max(10, dinoRect.top - bubbleHeight - 15)}px`;

    dinoMessage.style.right = "auto";
    dinoMessage.style.bottom = "auto";

});

// Hide preview shortly after leaving a destination
dinoMenu.addEventListener("mouseout", (event) => {

    const button = event.target.closest("button[data-section]");

    if (!button) return;

    if (event.relatedTarget && button.contains(event.relatedTarget)) return;

    dinoPreviewTimer = setTimeout(() => {
        dinoMessage.style.display = "none";
    }, 180);

});
    const button = event.target.closest("button[data-section]");

    if (!button) return;

    event.stopPropagation();

    const destination = button.dataset.section;

    currentTourIndex = tourSections.indexOf(destination);

    if (currentTourIndex === -1) return;
    // Highlight the selected destination
    dinoMenu.querySelectorAll("button[data-section]").forEach((menuButton) => {
        menuButton.classList.remove("active");
    });

button.classList.add("active");

    // Close the destination menu
    dinoMenu.style.display = "none";
    dinoMenu.classList.remove("show");

    // Start Dottie's journey
    isTourActive = true;
    visitTourSection();

});
// Close Dottie's menu when clicking outside
document.addEventListener("click", (event) => {

    if (
        !dinoMenu.contains(event.target) &&
        !dinoContainer.contains(event.target)
    ) {
        dinoMenu.style.display = "none";
    }

});

// Close Dottie's menu with the Escape key
document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {
        dinoMenu.style.display = "none";
    }

});
// Dottie's tour progress
let currentTourIndex = 0;
let isTourActive = false;
// Dottie's tour introduction
const tourWelcomeMessage =
    "Hey there! Welcome to The Creative Den! Want a little tour? 🦕";
function showDinoMessage() {

    const randomIndex = Math.floor(
        Math.random() * dinoMessages.length
    );

    dinoMessage.textContent = dinoMessages[randomIndex];
    dinoMessage.style.display = "block";

    // Get Dottie's current position
    const dinoRect = dinoContainer.getBoundingClientRect();

    const bubbleWidth = dinoMessage.offsetWidth;
    const bubbleHeight = dinoMessage.offsetHeight;

    // Position the bubble above Dottie
    const left = Math.max(
        10,
        Math.min(
            dinoRect.left + dinoRect.width / 2 - bubbleWidth / 2,
            window.innerWidth - bubbleWidth - 10
        )
    );

    dinoMessage.style.left = `${left}px`;
    dinoMessage.style.top =
        `${Math.max(10, dinoRect.top - bubbleHeight - 15)}px`;

    dinoMessage.style.right = "auto";
    dinoMessage.style.bottom = "auto";

    // Hide the message after 5 seconds
    setTimeout(() => {
        dinoMessage.style.display = "none";
    }, 5000);
}

const dinoScene = new THREE.Scene();

const dinoCamera = new THREE.PerspectiveCamera(
    35,
    1,
    0.1,
    100
);

dinoCamera.position.set(0, 0, 5);

const dinoRenderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
});

dinoRenderer.setSize(230, 230);
dinoRenderer.setPixelRatio(window.devicePixelRatio);

dinoContainer.appendChild(dinoRenderer.domElement);
// Dottie's lighting
const dinoLight = new THREE.DirectionalLight(0xffffff, 3);
dinoLight.position.set(2, 3, 5);
dinoScene.add(dinoLight);

const dinoAmbientLight = new THREE.AmbientLight(0xffffff, 2);
dinoScene.add(dinoAmbientLight);

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
// Load Dottie's 3D model

loader.load(
    './models/little-dino.glb',

    function (gltf) {

        const dino = gltf.scene;
        console.log(
            "Dottie animations:",
            gltf.animations.map(clip => ({
                name: clip.name,
                duration: clip.duration
            }))
        );
        dino.traverse((child) => {
        if (child.isMesh) {
            console.log("Dottie part:", child.name);
        }
        if (child.isSkinnedMesh) {
            console.log("Dottie has a rigged mesh!");
        }

        if (child.isBone) {
            console.log("Dottie bone:", child.name);
        }
});
        dinoModel = dino;
        // Dottie's floating animation
        dino.userData.floatOffset = 0;
        // Make Dottie face the visitors
        dino.rotation.y = -Math.PI / 2;

        // Center and resize Dottie
        const box = new THREE.Box3().setFromObject(dino);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const maxDimension = Math.max(size.x, size.y, size.z);
        const scale = 2.3 / maxDimension;

        dino.scale.setScalar(scale);
        dino.position.copy(center).multiplyScalar(-scale);

        dinoBaseY = dino.position.y;

        dinoScene.add(dino);
        // Play Dottie's Blender animation
        dinoMixer = new THREE.AnimationMixer(dino);

        // Find the Wave animation
        const waveClip = THREE.AnimationClip.findByName(
            gltf.animations,
            "Wave"
        );
        // Find the Walk animation
        const walkClip = THREE.AnimationClip.findByName(
            gltf.animations,
            "Walk"
        );

        // Prepare Dottie's walking animation
        dinoWalkAction = dinoMixer.clipAction(walkClip);
        dinoWalkAction.setLoop(THREE.LoopRepeat, Infinity);
        console.log("Dottie's walking animation:", walkClip);

        // Find the Blink animation
        const blinkClip = THREE.AnimationClip.findByName(
            gltf.animations,
            "Blink"
        );

        // Play the waving animation once
        dinoWaveAction = dinoMixer.clipAction(waveClip);
        dinoWaveAction.setLoop(THREE.LoopOnce, 1);
        dinoWaveAction.clampWhenFinished = true;
        dinoWaveAction.play();

        nextWaveTime = clock.elapsedTime + 25;

        // Keep the blinking animation repeating
        const blinkAction = dinoMixer.clipAction(blinkClip);
        blinkAction.setLoop(THREE.LoopRepeat, Infinity);
        blinkAction.play();

        console.log("Dottie has arrived!");
        // Show a random message every 30 seconds
        setInterval(() => {

            // Only show random messages when Dottie is free
            if (
                !isTourActive &&
                dinoMenu.style.display !== "block"
            ) {
                showDinoMessage();
            }

        }, 14000);
        // Dottie's warm welcome
        setTimeout(() => {
            dinoMessage.textContent = tourWelcomeMessage;
            dinoMessage.style.display = "block";

            // Hide the message after 5 seconds
            setTimeout(() => {
                dinoMessage.style.display = "none";
            }, 5000);

        }, 1500);

    },

    undefined,

    function (error) {
        console.error("Error loading Dottie:", error);
    }
);

let mixer;
let dinoModel;
let dinoBaseY = 0;
let dinoMixer;
// Dottie's home position
const dinoHome = {
    x: 0,
    y: 0,
    scale: 1
};
let dinoWaveAction;
let dinoWalkAction;
let nextWaveTime = 0;

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
    // Make Dottie gently float
    const time = clock.elapsedTime;

    if (dinoModel) {

    // Gentle floating movement
    dinoModel.position.y =
        dinoBaseY + Math.sin(time * 2) * 0.08;

    // Gentle side-to-side rocking
    dinoModel.rotation.z =
        Math.sin(time * 1.5) * 0.04;
    }

    if (mixer) {
        mixer.update(delta);
    }
    if (dinoMixer) {
    dinoMixer.update(delta);
    }
    // Make Dottie wave every 25 seconds
    if (dinoWaveAction && clock.elapsedTime >= nextWaveTime) {
        dinoWaveAction.reset();
        dinoWaveAction.play();

        nextWaveTime = clock.elapsedTime + 25;
    }
    // Let visitors click Dottie to make her wave
   

    renderer.render(scene, camera);
    dinoRenderer.render(dinoScene, dinoCamera);
}

animate();

// Let visitors click Dottie
dinoContainer.style.cursor = "pointer";

// Detect single and double clicks on Dottie
let dinoClickTimer;

dinoContainer.addEventListener("click", (event) => {

    // Wait briefly to see whether another click follows
    clearTimeout(dinoClickTimer);

    dinoClickTimer = setTimeout(() => {

        // Make Dottie wave
        if (dinoWaveAction) {
            dinoWaveAction.reset();
            dinoWaveAction.play();
        }

        // Toggle the destination menu
        if (dinoMenu.style.display === "block") {

            dinoMenu.style.display = "none";
            dinoMenu.classList.remove("show");

        } else {

            dinoMessage.style.display = "none";

            // Show the menu
            dinoMenu.style.display = "block";
            dinoMenu.classList.add("show");

            // Find Dottie's current position
            const dinoRect = dinoContainer.getBoundingClientRect();

            // Position the menu above her
            dinoMenu.style.left =
                `${dinoRect.left + dinoRect.width / 2 - 105}px`;

            dinoMenu.style.top =
                `${Math.max(10, dinoRect.top - dinoMenu.offsetHeight - 15)}px`;

            dinoMenu.style.bottom = "auto";
            dinoMenu.style.right = "auto";
        }

    }, 250);

});

// Detect double-clicks
dinoContainer.addEventListener("dblclick", () => {

    clearTimeout(dinoClickTimer);

    // Hide the destination menu
    dinoMenu.style.display = "none";
    dinoMenu.classList.remove("show");

    // Get Dottie's current position
    const dinoRect = dinoContainer.getBoundingClientRect();

    // Make Dottie angry and show her message
    dinoMessage.textContent = "DON'T POKE ME!! 😡🔥";
    dinoMessage.style.display = "block";

    dinoMessage.style.left = `${Math.max(10, dinoRect.left - 30)}px`;
    dinoMessage.style.top = `${Math.max(10, dinoRect.top - 100)}px`;
    dinoMessage.style.right = "auto";
    dinoMessage.style.bottom = "auto";

    // Turn Dottie sideways toward the left
    dinoModel.rotation.y = Math.PI;

    // Find the fire element
    let fire = document.getElementById("dino-fire");

    if (!fire) {
        fire = document.createElement("div");
        fire.id = "dino-fire";
        document.body.appendChild(fire);
    }

    // Create the flames
    fire.innerHTML = `
        <div class="flame"></div>
        <div class="flame"></div>
        <div class="flame"></div>
    `;

    // Position the fire near Dottie's mouth
    fire.style.left = `${dinoRect.left - 75}px`;
    fire.style.top = `${dinoRect.top + 80}px`;
    fire.style.display = "block";

    // Stop the fire after 3 seconds
    setTimeout(() => {

        fire.style.display = "none";
        dinoMessage.style.display = "none";

        // Turn Dottie back toward the visitor
        dinoModel.rotation.y = -Math.PI / 2;

    }, 3000);

});
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
