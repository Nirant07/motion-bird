import {
    PoseLandmarker,
    FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/+esm";


const video = document.getElementById("webcam");
const statusElement = document.getElementById("status");

let poseLandmarker = null;
let lastVideoTime = -1;

let previousLeftAngle = null;
let previousRightAngle = null;

let downPhase = false;
let lastFlapTime = 0;

const FLAP_DOWN_THRESHOLD = 1.2;
const FLAP_UP_THRESHOLD = 1.5;
const FLAP_COOLDOWN = 320;


let controls = {
    flap: false,
    flapStrength: 0,
    turn: 0,
    leftAngle: 0,
    rightAngle: 0,
    detected: false
};


function setStatus(message) {

    if (statusElement) {
        statusElement.textContent = message;
    }

    console.log("[Motion Bird]", message);
}


function armAngle(shoulder, wrist) {

    const dx = wrist.x - shoulder.x;
    const dy = shoulder.y - wrist.y;

    return Math.atan2(
        dy,
        Math.abs(dx)
    ) * 180 / Math.PI;

}


async function createPoseDetector() {

    setStatus("Loading motion tracking...");

    try {

        const vision =
            await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm"
            );


        poseLandmarker =
            await PoseLandmarker.createFromOptions(
                vision,
                {
                    baseOptions: {
                        modelAssetPath:
                            "./models/pose_landmarker_full.task",

                        delegate: "GPU"
                    },

                    runningMode: "VIDEO",

                    numPoses: 1,

                    minPoseDetectionConfidence: 0.5,
                    minPosePresenceConfidence: 0.5,
                    minTrackingConfidence: 0.5
                }
            );


        console.log("Pose Landmarker initialized.");

        return true;

    } catch (error) {

        console.error(
            "Pose Landmarker initialization failed:",
            error
        );

        setStatus(
            "Motion tracker failed - check Console"
        );

        return false;
    }
}


async function startCamera() {

    setStatus("Requesting camera...");

    try {

        const stream =
            await navigator.mediaDevices.getUserMedia({
                video: {
                    width: {
                        ideal: 640
                    },

                    height: {
                        ideal: 480
                    },

                    facingMode: "user"
                },

                audio: false
            });


        video.srcObject = stream;

        await new Promise(resolve => {
            video.onloadedmetadata = resolve;
        });

        await video.play();

        console.log(
            "Camera started:",
            video.videoWidth,
            "x",
            video.videoHeight
        );

        return true;

    } catch (error) {

        console.error(
            "Camera initialization failed:",
            error
        );

        setStatus(
            "Camera failed - check permission"
        );

        return false;
    }
}


function processPose() {

    if (!poseLandmarker) {

        requestAnimationFrame(
            processPose
        );

        return;
    }


    if (
        video.readyState >= 2 &&
        video.currentTime !== lastVideoTime
    ) {

        lastVideoTime =
            video.currentTime;


        try {

            const result =
                poseLandmarker.detectForVideo(
                    video,
                    performance.now()
                );


            if (
                result.landmarks &&
                result.landmarks.length > 0
            ) {

                processLandmarks(
                    result.landmarks[0]
                );

            } else {

                controls.detected = false;

                controls.turn *= 0.9;
            }


        } catch (error) {

            console.error(
                "Pose processing error:",
                error
            );
        }
    }


    requestAnimationFrame(
        processPose
    );
}


function processLandmarks(
    landmarks
) {

    const leftShoulder =
        landmarks[11];

    const rightShoulder =
        landmarks[12];

    const leftWrist =
        landmarks[15];

    const rightWrist =
        landmarks[16];


    if (
        !leftShoulder ||
        !rightShoulder ||
        !leftWrist ||
        !rightWrist
    ) {

        controls.detected = false;

        return;
    }


    const leftAngle =
        armAngle(
            leftShoulder,
            leftWrist
        );


    const rightAngle =
        armAngle(
            rightShoulder,
            rightWrist
        );


    controls.detected = true;

    controls.leftAngle = leftAngle;
    controls.rightAngle = rightAngle;


    if (
        previousLeftAngle === null ||
        previousRightAngle === null
    ) {

        previousLeftAngle = leftAngle;
        previousRightAngle = rightAngle;

        return;
    }


    const leftDelta =
        leftAngle -
        previousLeftAngle;


    const rightDelta =
        rightAngle -
        previousRightAngle;


    const synchronized =
        leftDelta * rightDelta > 0 &&

        Math.abs(leftDelta) >
            FLAP_DOWN_THRESHOLD &&

        Math.abs(rightDelta) >
            FLAP_DOWN_THRESHOLD;


    const commonDelta =
        (
            leftDelta +
            rightDelta
        ) / 2;


    /* ========================================================
       FLAP DETECTION
    ======================================================== */

    if (
        synchronized &&
        commonDelta < -FLAP_DOWN_THRESHOLD
    ) {

        downPhase = true;
    }


    const now =
        performance.now();


    if (
        synchronized &&
        commonDelta > FLAP_UP_THRESHOLD &&
        downPhase &&
        now - lastFlapTime > FLAP_COOLDOWN
    ) {

        /*
         * Much more generous strength calculation.
         *
         * Even a moderate flap gets useful power.
         */

        const rawStrength =
            Math.abs(commonDelta) / 10;


        controls.flapStrength =
            Math.max(
                0.70,
                Math.min(
                    rawStrength,
                    1.0
                )
            );


        controls.flap = true;

        downPhase = false;

        lastFlapTime = now;
    }


    /* ========================================================
       TURN
    ======================================================== */

    if (!synchronized) {

        const difference =
            leftAngle -
            rightAngle;


        if (
            Math.abs(difference) > 7
        ) {

            controls.turn =
                Math.max(
                    -1,
                    Math.min(
                        1,
                        difference / 42
                    )
                );

        } else {

            controls.turn *= 0.80;
        }

    } else {

        /*
         * Both arms moving together means FLAP,
         * not TURN.
         */

        controls.turn *= 0.75;
    }


    previousLeftAngle =
        leftAngle;

    previousRightAngle =
        rightAngle;
}


export async function startMotion() {

    setStatus(
        "Starting camera..."
    );


    const cameraStarted =
        await startCamera();


    if (!cameraStarted) {
        return;
    }


    const trackerStarted =
        await createPoseDetector();


    if (!trackerStarted) {
        return;
    }


    setStatus(
        "CAMERA READY"
    );


    processPose();
}


export function getControls() {

    const current = {
        ...controls
    };


    controls.flap = false;

    controls.flapStrength *= 0.8;


    return current;
}