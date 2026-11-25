// ======================================================================
// 3D ASSETS TAB — two sub-sections, each with its own 3D window
// ----------------------------------------------------------------------
//  • Dresses:    made in Style3D, converted in Blender to .glb (models/3d-dresses/).
//                Each file has its textures and a slow 16 s spin made in Blender.
//  • Characters: the FUN LINGO app characters (models/3d-characters/), rigged and
//                animated. They play "idle", turn slowly, and have buttons for
//                their moves (wave, walk, namaste...).
// Both use the same lighting as the Little Dino app. Nothing loads until the
// "3D Assets" tab is opened, and each window only draws while you can see it.
// ======================================================================
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// file name (without .glb)  →  name shown on the page
const DRESSES = [
    ['sanju_dress',                'Blush Corset Gown'],
    ['G_pink_dress',               'Pink Dress'],
    ['First_dress_refit',          'First Dress'],
    ['G_pink',                     'Pink Tiered Gown'],
    ['G_soft_pink',                'Soft Pink Gown'],
    ['G_lavender',                 'Lavender Gown'],
    ['G_teal_colored',             'Teal Gown'],
    ['G_Olive_full',               'Olive Gown'],
    ['G_clothe_Olive',             'Olive Ruffle Gown'],
    ['G_clothe_beige',             'Beige Gown'],
    ['G_cloth3',                   'Black Ruffle Gown'],
    ['G_clothe_without_sleeve',    'Sleeveless Dress'],
    ['G_clothe_without_waistband', 'Without Waistband'],
    ['G_clothe6',                  'Black Jumpsuit'],
    ['G_clothe9_new',              'Striped Top & Skirt'],
    ['G_clothe10',                 'Ruffle Sleeve Set'],
    ['G_clothe11_black',           'Ruffle Sleeve Set – Black'],
    ['G_clothe11_pink',            'Ruffle Sleeve Set – Pink'],
    ['G_clothe12',                 'Red Slip Dress'],
];

// file name  →  [name, role]
const CHARACTERS = [
    ['teacher',   'Dai Leo',  'FUN LINGO teacher'],
    ['didi_asha', 'Didi Asha', 'FUN LINGO teacher'],
    ['beep',      'Beep',     'Robot · starter pet'],
    ['elephant',  'Gaju',     'Baby elephant pet'],
    ['dragon',    'Sparky',   'Baby dragon pet'],
    ['monkey',    'Bobo',     'Monkey pet'],
    ['yeti',      'Himu',     'Baby yeti pet'],
    ['kitten',    'Mimi',     'Kitten pet'],
    ['red_panda', 'Pandu',    'Red panda pet'],
    ['stardust',  'Stardust', 'Baby unicorn pet'],
    ['roary',     'Roary',    'Lion cub pet'],
];

// ---- Speaking: each tap of "Speak" says the greeting in the next language ----
// Voices + lip-sync timings come from the FUN LINGO app (ElevenLabs + Rhubarb),
// merged into one clip per character: greeting + name line.
const LANGS = [
    ['en', '🇬🇧', 'English'],
    ['ne', '🇳🇵', 'Nepali'],
    ['ja', '🇯🇵', 'Japanese'],
    ['ko', '🇰🇷', 'Korean'],
];
const VOICE_DIR = './models/3d-characters/voice/';
let voiceLines = null;     // what each character says, in every language (lines.json)
const getLines = () => voiceLines || (voiceLines = fetch(VOICE_DIR + 'lines.json').then((r) => r.json()));
// Rhubarb mouth shapes -> the characters' mouth shape keys (same table as FUN LINGO)
const VIS = {
    A: {}, X: {},
    B: { viseme_I: 0.35, viseme_E: 0.25 },
    C: { viseme_E: 0.75 },
    D: { viseme_aa: 1 },
    E: { viseme_O: 0.75 },
    F: { viseme_U: 0.85 },
    G: { viseme_I: 0.55 },
    H: { viseme_aa: 0.5, viseme_E: 0.3 },
};
const MOUTH_KEYS = ['viseme_aa', 'viseme_E', 'viseme_I', 'viseme_O', 'viseme_U', 'mouthClose'];

const SPIN_SECONDS = 16;
const IS_TOUCH = window.matchMedia('(pointer: coarse)').matches;   // phones & tablets
// Can this browser show 3D at all? (three.js needs WebGL 2)
const HAS_3D = (() => { try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; } })();   // one full turn, same speed as the dresses' Blender spin
const loader = new GLTFLoader();
let hdrPromise = null;      // the HDRI photo is downloaded once and shared

// ---------------------------------------------------------------- lighting
function loadHDRI() {
    if (hdrPromise) return hdrPromise;
    const url = 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/lythwood_room_1k.hdr';
    hdrPromise = (async () => {
        let Loader;
        try { ({ HDRLoader: Loader } = await import('three/addons/loaders/HDRLoader.js')); }
        catch { ({ RGBELoader: Loader } = await import('three/addons/loaders/RGBELoader.js')); }
        const hdr = await new Loader().loadAsync(url);
        hdr.mapping = THREE.EquirectangularReflectionMapping;
        return hdr;
    })().catch((e) => { console.warn('HDRI not available, using studio light', e); return null; });
    return hdrPromise;
}

// Downloads a model with progress. GitHub Pages sends .glb files compressed (gzip): the size it
// reports is the compressed size, so "loaded / total" went past 100%. We only show a percentage
// when the size is the real one, otherwise how many MB have arrived.
// Calls onStall() if no data arrives for 15 seconds.
async function downloadModel(url, signal, onProgress, onStall) {
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const compressed = !!res.headers.get('content-encoding');
    const total = compressed ? 0 : parseInt(res.headers.get('content-length') || '0', 10);
    const reader = res.body.getReader();
    const parts = []; let got = 0, stallTimer;
    const armStall = () => { clearTimeout(stallTimer); stallTimer = setTimeout(onStall, 15000); };
    armStall();
    try {
        for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            parts.push(value); got += value.length; armStall();
            onProgress(total ? `Loading… ${Math.min(99, Math.round(got / total * 100))}%`
                             : `Loading… ${(got / 1e6).toFixed(1)} MB`);
        }
    } finally { clearTimeout(stallTimer); }
    const buf = new Uint8Array(got); let o = 0;
    for (const p of parts) { buf.set(p, o); o += p.length; }
    return buf.buffer;
}

function prettyMove(name) {
    return name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// ---------------------------------------------------------------- one 3D window
class AssetViewer {
    constructor(panel, items, kind) {
        this.panel = panel;
        this.items = items;
        this.kind = kind;                       // 'dress' or 'character'
        this.viewerEl  = panel.querySelector('.asset-viewer');
        this.thumbsEl  = panel.querySelector('.asset-thumbs');
        this.titleEl   = panel.querySelector('.asset-title');
        this.subEl     = panel.querySelector('.asset-subtitle');
        this.movesEl   = panel.querySelector('.asset-moves');
        this.loadingEl = panel.querySelector('.asset-loading');
        this.loadingTx = panel.querySelector('.asset-loading-text');
        this.started = false; this.onScreen = true; this.dragging = false; this.token = 0;
        this.dir = kind === 'dress' ? './models/3d-dresses/' : './models/3d-characters/';
        this.makeThumbs();
        this.makeArrows();
        const hint = panel.querySelector('.asset-hint');
        if (hint) hint.innerHTML = IS_TOUCH
            ? '<i class="fa-solid fa-hand-pointer"></i> Swipe to change · two fingers to turn &amp; zoom'
            : '<i class="fa-solid fa-hand-pointer"></i> Drag to turn · scroll to zoom';
        if (kind === 'character') {
            this.hintEl = document.createElement('p');
            this.hintEl.className = 'asset-speak-hint';
            this.movesEl.after(this.hintEl);
        }
    }

    makeThumbs() {
        this.items.forEach((it, i) => {
            const [file, name] = it;
            const b = document.createElement('button');
            b.className = 'asset-thumb';
            b.title = name;
            b.innerHTML = `<img src="${this.dir}thumbs/${file}.png" alt="${name}" loading="lazy">`;
            b.addEventListener('click', () => this.show(i));
            this.thumbsEl.appendChild(b);
        });
    }

    // small ‹ › buttons on the sides of the 3D window
    makeArrows() {
        [['prev', '‹', -1, 'Previous'], ['next', '›', 1, 'Next']].forEach(([cls, ch, step, label]) => {
            const b = document.createElement('button');
            b.className = `asset-nav asset-nav-${cls}`;
            b.setAttribute('aria-label', label);
            b.textContent = ch;
            b.addEventListener('click', (e) => { e.stopPropagation(); this.step(step); });
            this.viewerEl.appendChild(b);
        });
    }

    step(dir) {
        const n = this.items.length;
        this.show(((this.index ?? 0) + dir + n) % n);   // loops round at the ends
        const t = this.thumbsEl.children[this.index];
        if (t) t.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    }

    // Phones: one finger swiping sideways = next/previous; two fingers = turn & zoom.
    // Up/down swipes still scroll the page.
    setupSwipe(el) {
        let start = null, fingers = 0;
        el.addEventListener('touchstart', (e) => {
            fingers = e.touches.length;
            start = fingers === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY, t: performance.now() } : null;
        }, { passive: true });
        el.addEventListener('touchend', (e) => {
            if (!start || fingers !== 1 || e.changedTouches.length !== 1) { start = null; return; }
            const dx = e.changedTouches[0].clientX - start.x, dy = e.changedTouches[0].clientY - start.y;
            const quick = performance.now() - start.t < 800;
            if (quick && Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) this.step(dx < 0 ? 1 : -1);
            start = null;
        }, { passive: true });
    }

    // called whenever this window becomes visible
    open() {
        if (this.kind === 'character' && HAS_3D) getLines();      // fetch the greeting texts early
        if (!this.started) { this.started = true; this.init(); this.show(0); }
        requestAnimationFrame(() => this.resize());
    }

    init() {
        if (!HAS_3D) { this.initNo3D(); return; }
        const r = this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        r.outputColorSpace = THREE.SRGBColorSpace;
        r.toneMapping = THREE.ACESFilmicToneMapping;   // same as Little Dino
        r.toneMappingExposure = 0.8;
        this.viewerEl.prepend(r.domElement);

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(35, 1, 0.01, 100);
        this.clock = new THREE.Clock();

        loadHDRI().then(async (hdr) => {
            if (hdr) { this.scene.environment = hdr; return; }
            const { RoomEnvironment } = await import('three/addons/environments/RoomEnvironment.js');
            this.scene.environment = new THREE.PMREMGenerator(r).fromScene(new RoomEnvironment(), 0.04).texture;
        });
        this.scene.add(new THREE.HemisphereLight('#fff4e6', '#d9b896', 0.3));
        const key = new THREE.DirectionalLight('#ffffff', 0.7);
        key.position.set(1.5, 3, 2.5);
        this.scene.add(key);

        // soft round floor shadow (a blurred dark circle)
        const c = document.createElement('canvas'); c.width = c.height = 128;
        const g = c.getContext('2d');
        const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
        grad.addColorStop(0, 'rgba(0,0,0,0.35)'); grad.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = grad; g.fillRect(0, 0, 128, 128);
        this.shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1),
            new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
        this.shadow.rotation.x = -Math.PI / 2;
        this.scene.add(this.shadow);

        // characters turn on this "turntable" (dresses already spin by themselves)
        this.turntable = new THREE.Group();
        this.scene.add(this.turntable);

        this.controls = new OrbitControls(this.camera, r.domElement);
        this.controls.enableDamping = true;
        this.controls.enablePan = false;
        if (IS_TOUCH) {
            this.controls.touches = { ONE: null, TWO: THREE.TOUCH.DOLLY_ROTATE };
            r.domElement.style.touchAction = 'pan-y';     // one finger up/down scrolls the page
            this.setupSwipe(r.domElement);
        }
        this.controls.addEventListener('start', () => { this.dragging = true; });
        this.controls.addEventListener('end',   () => { this.dragging = false; });

        new IntersectionObserver(([e]) => { this.onScreen = e.isIntersecting; }).observe(this.viewerEl);
        // phones can reset the 3D when memory runs low: wait for it to come back, then reload
        r.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            this.loadingEl.classList.add('show'); this.loadingTx.textContent = 'Reloading 3D…';
        });
        r.domElement.addEventListener('webglcontextrestored', () => this.show(this.index ?? 0));
        window.addEventListener('resize', () => this.resize());
        this.resize();
        r.setAnimationLoop(() => this.tick());
    }

    // No 3D in this browser: show the picture of each item instead, with a short note
    initNo3D() {
        this.no3d = true;
        this.viewerEl.classList.add('no-3d');
        this.fallbackImg = document.createElement('img');
        this.fallbackImg.className = 'asset-fallback-img';
        this.viewerEl.prepend(this.fallbackImg);
        const note = document.createElement('p');
        note.className = 'asset-fallback-note';
        note.textContent = "3D isn't supported in this browser – try opening the page in Chrome or Safari to turn the models around.";
        this.viewerEl.appendChild(note);
        const hint = this.viewerEl.querySelector('.asset-hint');
        if (hint) hint.style.display = 'none';
    }

    show(i) {
        const [file, name, role] = this.items[i];
        this.index = i;
        if (this.no3d) {
            [...this.thumbsEl.children].forEach((b, j) => b.classList.toggle('active', j === i));
            this.titleEl.textContent = name;
            if (this.subEl) this.subEl.textContent = role || '';
            this.fallbackImg.src = `${this.dir}thumbs/${file}.png`;
            this.fallbackImg.alt = name;
            return;
        }
        [...this.thumbsEl.children].forEach((b, j) => b.classList.toggle('active', j === i));
        this.titleEl.textContent = name;
        if (this.subEl) this.subEl.textContent = role || '';
        if (this.movesEl) this.movesEl.innerHTML = '';
        this.stopSpeaking();
        this.moving = false;
        this.langIdx = 0;
        this.file = file;
        if (this.hintEl) this.hintEl.innerHTML = '';
        this.loadingEl.classList.add('show');
        this.loadingTx.textContent = 'Loading…';
        const token = ++this.token;   // ignore older loads if you click quickly

        this.load(file, token, 0);
    }

    // Fetch + build one model. Only the newest pick is downloaded: picking another item
    // cancels the old download, so they don't share the phone's bandwidth.
    load(file, token, attempt) {
        if (this.abort) this.abort.abort();
        const ac = this.abort = new AbortController();
        const url = this.dir + file + '.glb';
        const fail = (why) => {
            if (token !== this.token) return;                 // an old pick: ignore
            if (attempt === 0) { this.load(file, token, 1); return; }   // try once more by itself
            console.error('Could not load', file, why);
            this.loadingTx.innerHTML = 'Couldn\'t load this model<br><button class="asset-retry">Tap to try again</button>';
            this.loadingEl.querySelector('.asset-retry').onclick = () => {
                this.loadingTx.textContent = 'Loading…'; this.load(file, token, 1);
            };
        };
        downloadModel(url, ac.signal,
            (msg) => { if (token === this.token) this.loadingTx.textContent = msg; },
            () => ac.abort())                    // stalled: cancel, and the retry below takes over
        .then((buf) => new Promise((ok, bad) => loader.parse(buf, this.dir, ok, bad)))
        .then((gltf) => {
            if (token !== this.token) { this.dispose(gltf.scene); return; }
            if (this.current) { this.turntable.remove(this.current); this.dispose(this.current); }
            if (this.mixer) this.mixer.stopAllAction();
            this.current = gltf.scene;
            if (this.kind === 'dress') this.prepareDress(this.current);
            if (this.kind === 'character') {
                this.faces = [];
                this.current.traverse((o) => { if (o.isMesh && o.morphTargetDictionary) this.faces.push(o); });
                this.isPet = !['teacher', 'didi_asha'].includes(file);
                // Dai Leo smiles with his mouth a little open (as in FUN LINGO)
                this.restMouth = file === 'teacher' ? { viseme_E: 0.45, viseme_aa: 0.22 } : {};
            }
            this.turntable.rotation.y = 0;
            this.turntable.add(this.current);

            this.mixer = new THREE.AnimationMixer(this.current);
            if (this.kind === 'dress') {
                gltf.animations.forEach((clip) => this.mixer.clipAction(clip).play());   // Blender spin
            } else {
                this.setupMoves(gltf.animations);
            }
            this.mixer.update(0);
            this.frame(this.current);
            this.loadingEl.classList.remove('show');
        })
        .catch((err) => fail(err));             // old picks are ignored inside fail()
    }

    // Dresses with sheer parts are drawn in two passes: solid cloth first (writes depth,
    // so nothing shows through), then the sheer parts blended softly on top.
    prepareDress(root) {
        const copies = [];
        root.traverse((o) => {
            if (!o.isMesh) return;
            const m = o.material;
            m.side = THREE.DoubleSide;
            if (m.map) m.map.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
            if (!m.transparent) return;
            m.transparent = false; m.depthWrite = true; m.alphaTest = 0.95;
            const sm = m.clone();
            sm.transparent = true; sm.depthWrite = false; sm.alphaTest = 0.01;
            const copy = new THREE.Mesh(o.geometry, sm);
            copy.renderOrder = 1;
            copies.push([o, copy]);
        });
        copies.forEach(([o, copy]) => o.add(copy));
    }

    // Characters: loop "idle", and make a button for every other animation.
    setupMoves(clips) {
        const idleClip = clips.find((c) => c.name.toLowerCase() === 'idle') || clips[0];
        if (!idleClip) return;
        this.idle = this.mixer.clipAction(idleClip).play();

        // the Speak button comes first; the pets' "speak" body animation plays along with it
        this.speakClip = clips.find((c) => c.name.toLowerCase() === 'speak') || null;
        const sb = document.createElement('button');
        sb.className = 'asset-move asset-speak';
        sb.innerHTML = '<i class="fa-solid fa-volume-high"></i> Speak';
        sb.addEventListener('click', () => this.speak(sb));
        this.movesEl.appendChild(sb);
        this.showHint(null);

        clips.filter((c) => c !== idleClip && c !== this.speakClip).forEach((clip) => {
            const b = document.createElement('button');
            b.className = 'asset-move';
            b.textContent = prettyMove(clip.name);
            b.addEventListener('click', () => this.playMove(clip, b));
            this.movesEl.appendChild(b);
        });
        this.mixer.addEventListener('finished', (e) => {
            if (e.action === this.idle) return;
            e.action.fadeOut(0.3);
            this.idle.reset().fadeIn(0.3).play();
            this.moving = false;                 // move finished: start turning again
            this.movesEl.querySelectorAll('.asset-move:not(.asset-speak)').forEach((x) => x.classList.remove('active'));
        });
    }

    // The sound must start inside the tap itself, or iPhones block it,
    // so the audio plays first and the lip-sync timings join a moment later.
    speak(btn) {
        this.stopSpeaking();
        this.moving = false;                     // speaking replaces any move that was playing
        this.movesEl.querySelectorAll('.asset-move:not(.asset-speak)').forEach((x) => x.classList.remove('active'));
        const [lang, flag, langName] = LANGS[this.langIdx];
        const file = this.file;
        const base = `${VOICE_DIR}${lang}/${file}`;
        const audio = new Audio(base + '.mp3');
        audio.setAttribute('playsinline', '');
        const sp = this.speech = { audio, cues: null };
        btn.classList.add('active');

        // pets move their body while talking; teachers stay in idle
        if (this.speakClip) {
            this.mixer.stopAllAction();
            this.speakAction = this.mixer.clipAction(this.speakClip).reset();
            this.speakAction.setLoop(THREE.LoopRepeat, Infinity).play();
        }
        const done = () => {
            if (this.speech !== sp) return;
            this.speech = null;
            btn.classList.remove('active');
            if (this.speakAction) { this.speakAction.fadeOut(0.3); this.speakAction = null; this.idle.reset().fadeIn(0.3).play(); }
        };
        audio.addEventListener('ended', done, { once: true });
        audio.addEventListener('error', done, { once: true });
        audio.play().catch(done);

        fetch(base + '.json').then((r) => r.json()).then((j) => { sp.cues = j.mouthCues; }).catch(() => {});
        this.langIdx = (this.langIdx + 1) % LANGS.length;   // next tap = next language
        const next = LANGS[this.langIdx];
        getLines().then((lines) => {
            if (this.file === file) this.showHint({ flag, langName, text: lines[file][lang] }, next);
        });
    }

    stopSpeaking() {
        if (this.speech) { this.speech.audio.pause(); this.speech.audio.dispatchEvent(new Event('ended')); }
        this.speech = null;
    }

    showHint(said, next) {
        if (!this.hintEl) return;
        if (!said) {
            this.hintEl.innerHTML = 'Tap <b>Speak</b> to hear a hello in 🇬🇧 English, 🇳🇵 Nepali, 🇯🇵 Japanese and 🇰🇷 Korean';
            return;
        }
        this.hintEl.innerHTML =
            `<span class="asset-said">${said.flag} <b>${said.langName}:</b> “${said.text}”</span>` +
            `<span class="asset-next">Tap Speak again to hear it in ${next[1]} ${next[2]}</span>`;
    }

    // Moves the mouth shape keys from the lip-sync timings (same method as FUN LINGO)
    updateMouth(dt) {
        if (!this.faces || !this.faces.length) return;
        const target = { ...this.restMouth };
        const sp = this.speech;
        if (sp) {
            let shape = 'X';
            if (sp.cues) {
                const t = sp.audio.currentTime;
                const cue = sp.cues.find((c) => t >= c.start && t < c.end);
                if (cue) shape = cue.value;
            }
            if (shape !== 'X') { for (const k of MOUTH_KEYS) delete target[k]; Object.assign(target, VIS[shape] || {}); }
            if (this.isPet && (shape === 'A' || shape === 'X')) target.mouthClose = 1;   // pets rest with the mouth open
        }
        const k = Math.min(1, dt * 18);
        for (const m of this.faces) {
            const d = m.morphTargetDictionary;
            for (const key of MOUTH_KEYS) {
                if (d[key] === undefined) continue;
                const cur = m.morphTargetInfluences[d[key]];
                m.morphTargetInfluences[d[key]] = cur + ((target[key] || 0) - cur) * k;
            }
        }
    }

    playMove(clip, btn) {
        this.stopSpeaking();
        this.moving = true;                      // stop turning while the move plays
        this.movesEl.querySelectorAll('.asset-move').forEach((x) => x.classList.remove('active'));
        btn.classList.add('active');
        this.mixer.stopAllAction();
        const a = this.mixer.clipAction(clip);
        a.reset();
        const n = clip.name.toLowerCase();
        // walking, talking and blinking are short loops - play them a few times
        const repeats = /walk|speak|blink/.test(n) ? 3 : 1;
        a.setLoop(repeats > 1 ? THREE.LoopRepeat : THREE.LoopOnce, repeats);
        a.clampWhenFinished = true;
        a.play();
        this.idle.stop();
    }

    // Point the camera so the whole model fits, whichever way it is turned
    frame(obj) {
        const box = new THREE.Box3().setFromObject(obj, true);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const fov = THREE.MathUtils.degToRad(this.camera.fov);
        let dist;
        if (this.kind === 'character') {
            // characters: fit their height (and their widest side), filling most of the window
            const across = Math.max(size.x, size.z);
            const fitH = (size.y / 2) / Math.tan(fov / 2);
            const fitW = (across / 2) / Math.tan(fov / 2) / this.camera.aspect;
            dist = Math.max(fitH, fitW) * 1.06 + size.z / 2;
        } else {
            const across = Math.hypot(size.x, size.z);
            const fitH = (size.y / 2) / Math.tan(fov / 2);
            const fitW = (across / 2) / Math.tan(fov / 2) / this.camera.aspect;
            dist = Math.max(fitH, fitW) * 1.15;
        }
        this.controls.target.copy(center);
        this.camera.position.set(center.x, center.y + size.y * (this.kind === 'character' ? 0.02 : 0.05), center.z + dist);
        this.camera.near = dist / 100; this.camera.far = dist * 10; this.camera.updateProjectionMatrix();
        this.controls.minDistance = dist * 0.35;
        this.controls.maxDistance = dist * 2;
        this.controls.update();
        this.shadow.position.set(center.x, box.min.y + 0.001, center.z);
        this.shadow.scale.setScalar(Math.max(size.x, size.z) * 0.9);
    }

    dispose(root) {
        root.traverse((o) => {
            if (!o.isMesh) return;
            o.geometry.dispose();
            for (const k in o.material) { const v = o.material[k]; if (v && v.isTexture) v.dispose(); }
            o.material.dispose();
        });
    }

    resize() {
        if (!this.renderer) return;
        const w = this.viewerEl.clientWidth, h = this.viewerEl.clientHeight;
        if (!w || !h) return;
        this.renderer.setSize(w, h);
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
    }

    tick() {
        const dt = this.clock.getDelta();
        if (!this.onScreen || this.viewerEl.offsetParent === null) return;   // hidden: don't draw
        if (this.mixer && !this.dragging) this.mixer.update(dt);
        if (this.kind === 'character') this.updateMouth(dt);
        if (this.kind === 'character' && !this.dragging) {
            if (this.speech || this.moving) {
                // while talking or doing a move: stop turning and gently turn to face the viewer
                const c = this.camera.position, t = this.controls.target;
                const face = Math.atan2(c.x - t.x, c.z - t.z);
                let diff = face - this.turntable.rotation.y;
                diff = Math.atan2(Math.sin(diff), Math.cos(diff));      // shortest way round
                this.turntable.rotation.y += diff * Math.min(1, dt * 6);
            } else {
                this.turntable.rotation.y += dt * (Math.PI * 2 / SPIN_SECONDS);
            }
        }
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// ---------------------------------------------------------------- wiring
const viewers = {
    'panel-dresses':    new AssetViewer(document.getElementById('panel-dresses'), DRESSES, 'dress'),
    'panel-characters': new AssetViewer(document.getElementById('panel-characters'),
        CHARACTERS.map(([f, n, r]) => [f, n, r]), 'character'),
};
let activePanel = 'panel-dresses';

// Phones: shrink the dino companion and hide her speech bubble while a 3D window is on screen,
// so they don't cover the buttons.
new IntersectionObserver(([e]) => {
    document.body.classList.toggle('assets3d-onscreen', e.isIntersecting && e.target.offsetParent !== null);
}, { threshold: 0.15 }).observe(document.getElementById('assets3d'));

// opening the 3D Assets tab starts the sub-section that is showing
document.querySelector('.gallery-tab[data-category="assets3d"]')
    .addEventListener('click', () => viewers[activePanel].open());

// Dresses / Characters switch
document.querySelectorAll('.asset-subtab').forEach((btn) => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.asset-subtab').forEach((b) => b.classList.toggle('active', b === btn));
        document.querySelectorAll('.asset-panel').forEach((p) => p.classList.toggle('active', p.id === btn.dataset.panel));
        activePanel = btn.dataset.panel;
        viewers[activePanel].open();
    });
});

// ---------------------------------------------------------------- WOI project card
// The A World of Imagination card plays its title-page clip only while it is on screen.
const woiClip = document.querySelector('.woi-preview');
if (woiClip) {
    new IntersectionObserver(([e]) => {
        if (e.isIntersecting) { woiClip.preload = 'auto'; woiClip.play().catch(() => {}); }
        else woiClip.pause();
    }, { threshold: 0.3 }).observe(woiClip);
}
