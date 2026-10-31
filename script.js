
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

const sections = document.querySelectorAll(".content-section");

const observer = new IntersectionObserver((entries) => {

    entries.forEach((entry) => {

        if (entry.isIntersecting) {
            entry.target.classList.add("show");
        }

    });

}, {
    threshold: 0.15
});

sections.forEach((section) => {
    observer.observe(section);
});
