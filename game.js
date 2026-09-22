import * as THREE from
    "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

import {
    startMotion,
    getControls
} from "./motion.js";


/* ============================================================
   SCENE
============================================================ */

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x87bde8);

scene.fog = new THREE.Fog(
    0x87bde8,
    90,
    420
);


/* ============================================================
   CAMERA
============================================================ */

const camera = new THREE.PerspectiveCamera(
    68,
    window.innerWidth / window.innerHeight,
    0.1,
    600
);


/* ============================================================
   RENDERER
============================================================ */

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 1.5)
);

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

renderer.outputColorSpace =
    THREE.SRGBColorSpace;

document
    .getElementById("game")
    .appendChild(renderer.domElement);


/* ============================================================
   LIGHTING
============================================================ */

const sun = new THREE.DirectionalLight(
    0xffffff,
    2.4
);

sun.position.set(-60, 100, 40);
sun.castShadow = true;

sun.shadow.mapSize.set(1024, 1024);

scene.add(sun);


const ambient = new THREE.HemisphereLight(
    0xbde7ff,
    0x527050,
    1.5
);

scene.add(ambient);


/* ============================================================
   GRASS TEXTURE
============================================================ */

function createGrassTexture() {

    const canvas = document.createElement("canvas");

    canvas.width = 512;
    canvas.height = 512;

    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#639d58";

    ctx.fillRect(
        0,
        0,
        512,
        512
    );


    for (let i = 0; i < 180; i++) {

        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const size = 10 + Math.random() * 45;

        ctx.fillStyle =
            Math.random() > 0.5
                ? "rgba(45,120,55,0.16)"
                : "rgba(145,175,75,0.14)";

        ctx.beginPath();

        ctx.ellipse(
            x,
            y,
            size,
            size * 0.6,
            Math.random() * Math.PI,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }


    for (let i = 0; i < 900; i++) {

        const x = Math.random() * 512;
        const y = Math.random() * 512;

        ctx.fillStyle =
            Math.random() > 0.5
                ? "rgba(35,95,40,0.22)"
                : "rgba(190,165,90,0.12)";

        ctx.fillRect(
            x,
            y,
            1 + Math.random() * 2,
            1 + Math.random() * 2
        );
    }


    const texture =
        new THREE.CanvasTexture(canvas);

    texture.colorSpace =
        THREE.SRGBColorSpace;

    texture.wrapS =
        THREE.RepeatWrapping;

    texture.wrapT =
        THREE.RepeatWrapping;

    texture.repeat.set(2, 2);

    return texture;
}


const grassTexture =
    createGrassTexture();


const terrainMaterial =
    new THREE.MeshStandardMaterial({
        map: grassTexture,
        roughness: 1
    });


/* ============================================================
   LOOPING WORLD
============================================================ */

const WORLD_SIZE = 260;
const HALF_WORLD = WORLD_SIZE / 2;
const LOOP_TILES = 6;

let worldCenterX = 0;
let worldCenterZ = 0;


/* ============================================================
   TERRAIN TILES
============================================================ */

const terrainTiles = [];

const tileGeometry =
    new THREE.PlaneGeometry(
        WORLD_SIZE,
        WORLD_SIZE
    );


for (let x = -1; x <= 1; x++) {

    for (let z = -1; z <= 1; z++) {

        const terrain = new THREE.Mesh(
            tileGeometry,
            terrainMaterial
        );

        terrain.rotation.x =
            -Math.PI / 2;

        terrain.receiveShadow = true;

        scene.add(terrain);

        terrainTiles.push({
            mesh: terrain,
            ox: x,
            oz: z
        });
    }
}


/* ============================================================
   TREES
============================================================ */

const TREES_PER_TILE = 32;
const TILE_COUNT = 9;

const TREE_COUNT =
    TREES_PER_TILE * TILE_COUNT;


const trunkGeometry =
    new THREE.CylinderGeometry(
        0.25,
        0.38,
        2.8,
        7
    );


const leafGeometry =
    new THREE.ConeGeometry(
        1.8,
        4.2,
        7
    );


const trunkMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x70482d,
        roughness: 1
    });


const leafMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x367d3d,
        roughness: 1
    });


const treeTrunks =
    new THREE.InstancedMesh(
        trunkGeometry,
        trunkMaterial,
        TREE_COUNT
    );


const treeLeaves =
    new THREE.InstancedMesh(
        leafGeometry,
        leafMaterial,
        TREE_COUNT
    );


treeTrunks.castShadow = true;
treeLeaves.castShadow = true;

scene.add(treeTrunks);
scene.add(treeLeaves);


const dummy =
    new THREE.Object3D();


function seededRandom(seed) {

    let value = seed >>> 0;

    return function () {

        value += 0x6D2B79F5;

        let t = value;

        t = Math.imul(
            t ^ t >>> 15,
            t | 1
        );

        t ^= t +
            Math.imul(
                t ^ t >>> 7,
                t | 61
            );

        return (
            ((t ^ t >>> 14) >>> 0) /
            4294967296
        );
    };
}


function tileSeed(x, z) {

    const wrappedX =
        ((x % LOOP_TILES) +
            LOOP_TILES) %
        LOOP_TILES;

    const wrappedZ =
        ((z % LOOP_TILES) +
            LOOP_TILES) %
        LOOP_TILES;

    return (
        wrappedX * 928371 +
        wrappedZ * 472103 +
        17
    );
}


/* ============================================================
   MOUNTAINS
============================================================ */

const mountainGeometry =
    new THREE.ConeGeometry(
        1,
        2,
        7
    );


const mountainMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x667860,
        roughness: 1
    });


const mountains = [];


for (let i = 0; i < 27; i++) {

    const mountain =
        new THREE.Mesh(
            mountainGeometry,
            mountainMaterial
        );

    mountain.castShadow = true;

    scene.add(mountain);

    mountains.push(mountain);
}


/* ============================================================
   WORLD UPDATE
============================================================ */

function updateWorld(force = false) {

    const newCenterX =
        Math.floor(
            bird.position.x /
            WORLD_SIZE
        );

    const newCenterZ =
        Math.floor(
            bird.position.z /
            WORLD_SIZE
        );


    if (
        !force &&
        newCenterX === worldCenterX &&
        newCenterZ === worldCenterZ
    ) {
        return;
    }


    worldCenterX = newCenterX;
    worldCenterZ = newCenterZ;


    /* Terrain */

    terrainTiles.forEach(tile => {

        tile.mesh.position.set(

            (
                worldCenterX +
                tile.ox
            ) * WORLD_SIZE,

            0,

            (
                worldCenterZ +
                tile.oz
            ) * WORLD_SIZE

        );
    });


    /* Trees */

    let treeIndex = 0;


    for (let ox = -1; ox <= 1; ox++) {

        for (let oz = -1; oz <= 1; oz++) {

            const tileX =
                worldCenterX + ox;

            const tileZ =
                worldCenterZ + oz;


            const random =
                seededRandom(
                    tileSeed(
                        tileX,
                        tileZ
                    )
                );


            for (
                let t = 0;
                t < TREES_PER_TILE;
                t++
            ) {

                const localX =
                    -HALF_WORLD +
                    random() * WORLD_SIZE;

                const localZ =
                    -HALF_WORLD +
                    random() * WORLD_SIZE;

                const scale =
                    0.65 +
                    random() * 0.8;

                const rotation =
                    random() *
                    Math.PI *
                    2;

                const worldX =
                    tileX * WORLD_SIZE +
                    localX;

                const worldZ =
                    tileZ * WORLD_SIZE +
                    localZ;


                /* Trunk */

                dummy.position.set(
                    worldX,
                    1.4 * scale,
                    worldZ
                );

                dummy.rotation.set(
                    0,
                    rotation,
                    0
                );

                dummy.scale.set(
                    scale,
                    scale,
                    scale
                );

                dummy.updateMatrix();

                treeTrunks.setMatrixAt(
                    treeIndex,
                    dummy.matrix
                );


                /* Leaves */

                dummy.position.y =
                    3.8 * scale;

                dummy.updateMatrix();

                treeLeaves.setMatrixAt(
                    treeIndex,
                    dummy.matrix
                );


                treeIndex++;
            }
        }
    }


    treeTrunks.instanceMatrix.needsUpdate =
        true;

    treeLeaves.instanceMatrix.needsUpdate =
        true;


    /* Mountains */

    let mountainIndex = 0;


    for (let ox = -1; ox <= 1; ox++) {

        for (let oz = -1; oz <= 1; oz++) {

            const tileX =
                worldCenterX + ox;

            const tileZ =
                worldCenterZ + oz;


            const random =
                seededRandom(
                    tileSeed(
                        tileX + 91,
                        tileZ + 37
                    )
                );


            for (let m = 0; m < 3; m++) {

                const mountain =
                    mountains[mountainIndex++];


                const side =
                    m === 0
                        ? -1
                        : m === 1
                            ? 1
                            : 0;


                const localX =
                    side === 0
                        ? (
                            random() - 0.5
                        ) * 180
                        : side * (
                            85 +
                            random() * 35
                        );


                const localZ =
                    40 +
                    random() * 120;


                const scale =
                    12 +
                    random() * 22;


                mountain.position.set(

                    tileX * WORLD_SIZE +
                    localX,

                    scale,

                    tileZ * WORLD_SIZE +
                    localZ

                );


                mountain.scale.set(
                    scale,
                    scale,
                    scale
                );

                mountain.rotation.y =
                    random() *
                    Math.PI;
            }
        }
    }
}


/* ============================================================
   BIRD
============================================================ */

const bird =
    new THREE.Group();

scene.add(bird);

bird.position.set(
    0,
    18,
    0
);


/* Body */

const body =
    new THREE.Mesh(

        new THREE.SphereGeometry(
            1.3,
            16,
            10
        ),

        new THREE.MeshStandardMaterial({
            color: 0xd95b35,
            roughness: 0.8
        })

    );

body.scale.set(
    1,
    0.65,
    1.5
);

body.castShadow = true;

bird.add(body);


/* Head */

const head =
    new THREE.Mesh(

        new THREE.SphereGeometry(
            0.75,
            16,
            10
        ),

        new THREE.MeshStandardMaterial({
            color: 0xe87540
        })

    );

head.position.set(
    0,
    0.35,
    1.25
);

head.castShadow = true;

bird.add(head);


/* Beak */

const beak =
    new THREE.Mesh(

        new THREE.ConeGeometry(
            0.28,
            0.8,
            8
        ),

        new THREE.MeshStandardMaterial({
            color: 0xffd43b
        })

    );

beak.rotation.x =
    Math.PI / 2;

beak.position.set(
    0,
    0.3,
    2
);

bird.add(beak);


/* Eyes */

const eyeMaterial =
    new THREE.MeshBasicMaterial({
        color: 0x111111
    });


function createEye(x) {

    const eye =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.11,
                8,
                8
            ),
            eyeMaterial
        );

    eye.position.set(
        x,
        0.62,
        1.72
    );

    bird.add(eye);
}


createEye(-0.25);
createEye(0.25);


/* ============================================================
   WINGS
============================================================ */

const wingMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xffd83d,
        roughness: 0.7
    });


const leftWing =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            2.8,
            0.18,
            0.75
        ),
        wingMaterial
    );


const rightWing =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            2.8,
            0.18,
            0.75
        ),
        wingMaterial
    );


leftWing.position.x = -1.25;
rightWing.position.x = 1.25;

leftWing.castShadow = true;
rightWing.castShadow = true;

bird.add(leftWing);
bird.add(rightWing);


/* ============================================================
   TAIL
============================================================ */

const tail =
    new THREE.Mesh(

        new THREE.ConeGeometry(
            0.65,
            1.5,
            4
        ),

        new THREE.MeshStandardMaterial({
            color: 0xf28a45
        })

    );

tail.rotation.x =
    -Math.PI / 2;

tail.position.z =
    -1.5;

bird.add(tail);


/* ============================================================
   FLIGHT
============================================================ */

let speed = 0.45;
let heading = 0;
let flapPower = 0;
let targetBank = 0;


function updateBird(
    controls,
    delta
) {

    /* Flap */

    if (controls.flap) {

        const strength =
            Math.max(
                controls.flapStrength,
                0.7
            );

        speed +=
            0.75 *
            strength;

        flapPower =
            Math.max(
                flapPower,
                strength
            );
    }


    speed =
        THREE.MathUtils.lerp(
            speed,
            0.48,
            delta * 0.32
        );


    speed =
        THREE.MathUtils.clamp(
            speed,
            0.30,
            2.2
        );


    /* Turn */

    const correctedTurn =
        -controls.turn;


    heading +=
        correctedTurn *
        delta *
        1.75;


    /* Banking */

    targetBank =
        -correctedTurn *
        0.65;


    bird.rotation.z =
        THREE.MathUtils.lerp(
            bird.rotation.z,
            targetBank,
            delta * 7
        );


    /* Forward movement */

    const forward =
        new THREE.Vector3(
            Math.sin(heading),
            0,
            Math.cos(heading)
        );


    bird.position.addScaledVector(
        forward,
        speed
    );


    /* Natural flight height */

    bird.position.y =
        18 +
        Math.sin(
            performance.now() *
            0.0015
        ) * 1.2;


    bird.rotation.y =
        heading;


    /* Wing animation */

    flapPower =
        THREE.MathUtils.lerp(
            flapPower,
            0,
            delta * 7
        );


    const wingAngle =
        flapPower * 1.05;


    leftWing.rotation.z =
        THREE.MathUtils.lerp(
            leftWing.rotation.z,
            wingAngle,
            delta * 14
        );


    rightWing.rotation.z =
        THREE.MathUtils.lerp(
            rightWing.rotation.z,
            -wingAngle,
            delta * 14
        );


    /* Camera */

    const cameraOffset =
        new THREE.Vector3(
            0,
            3.2,
            -10
        );


    cameraOffset.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        heading
    );


    const desiredCamera =
        bird.position
            .clone()
            .add(cameraOffset);


    camera.position.lerp(
        desiredCamera,
        delta * 5
    );


    const lookTarget =
        bird.position
            .clone()
            .add(
                new THREE.Vector3(
                    0,
                    0.5,
                    8
                ).applyAxisAngle(
                    new THREE.Vector3(0, 1, 0),
                    heading
                )
            );


    camera.lookAt(lookTarget);

    updateWorld();
}


/* ============================================================
   HUD
============================================================ */

function updateHUD(controls) {

    const flapBar =
        document.getElementById("flapBar");

    const turnBar =
        document.getElementById("turnBar");

    const speedBar =
        document.getElementById("speedBar");


    flapBar.style.width =
        (
            controls.flapStrength *
            100
        ) + "%";


    turnBar.style.width =
        (
            Math.abs(controls.turn) *
            100
        ) + "%";


    speedBar.style.width =
        (
            (speed - 0.3) /
            (2.2 - 0.3) *
            100
        ) + "%";


    document.getElementById(
        "status"
    ).textContent =
        controls.detected
            ? "BODY DETECTED"
            : "SHOW YOUR FULL BODY";
}


/* ============================================================
   INITIAL WORLD
============================================================ */

updateWorld(true);


/* ============================================================
   GAME LOOP
============================================================ */

const clock =
    new THREE.Clock();


function animate() {

    requestAnimationFrame(
        animate
    );


    const delta =
        Math.min(
            clock.getDelta(),
            0.05
        );


    const controls =
        getControls();


    updateBird(
        controls,
        delta
    );


    updateHUD(
        controls
    );


    renderer.render(
        scene,
        camera
    );
}


animate();


/* ============================================================
   RESIZE
============================================================ */

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );
    }
);


/* ============================================================
   START MOTION
============================================================ */

startMotion()
    .then(() => {

        document.getElementById(
            "status"
        ).textContent =
            "CAMERA READY";

    })
    .catch(error => {

        console.error(error);

        document.getElementById(
            "status"
        ).textContent =
            "CAMERA ERROR";

    });