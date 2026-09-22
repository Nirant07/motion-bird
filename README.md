# Motion Bird

A browser-based 3D motion-controlled flying bird game built with **Three.js** and **MediaPipe Tasks Vision**.

Motion Bird lets you control a flying bird using your body movements through a webcam. Move both arms together to flap and accelerate, and use asymmetric arm positions to turn.

## Live Demo

**https://nirant07.github.io/motion-bird/**

> Camera access is required for motion controls.

---

## Features

- 3D third-person flying gameplay
- Real-time webcam-based body tracking
- Arm-based flap detection
- Arm-based turning
- Dynamic flight speed
- Animated wings
- Looping tile-based world
- Procedurally placed trees
- Low-poly mountains
- Procedurally textured grass terrain
- Third-person follow camera
- Real-time flight HUD
- Browser-based gameplay with no game engine installation required

---

## How It Works

The game uses **MediaPipe Pose Landmarker** to detect body landmarks from the webcam.

The current motion controller uses:

| Landmark | Body Part |
|---|---|
| 11 | Left Shoulder |
| 12 | Right Shoulder |
| 15 | Left Wrist |
| 16 | Right Wrist |

The system calculates the angle of each arm and compares the movement of both arms.

### Flapping

When both arms move in a synchronized motion, the game interprets it as a flap.

A flap:

1. Triggers the wing animation.
2. Increases the bird's flight speed.
3. Gradually returns the bird toward its normal cruising speed.

### Turning

When the arms are positioned differently, the difference between the left and right arm angles is used as the turning input.

The bird changes its heading and visually banks while turning.

### Flight

The bird continuously flies forward.

The player primarily controls:

- Flapping
- Acceleration
- Turning

The torso and hips are not used as primary flight controls.

---

## Controls

| Body Movement | Game Action |
|---|---|
| Move both arms together | Flap |
| Complete a synchronized arm movement | Accelerate |
| Position arms differently | Turn |
| Continue moving | Forward flight |

No keyboard is required for normal gameplay.

---

## Technology Stack

- **JavaScript** — Game and motion-control logic
- **Three.js** — 3D rendering
- **WebGL** — Hardware-accelerated graphics
- **MediaPipe Tasks Vision** — Pose detection
- **HTML5** — Application structure
- **CSS3** — Interface and HUD
- **GitHub Pages** — Hosting

---

## Project Structure

```text
motion-bird/
├── index.html
├── style.css
├── game.js
├── motion.js
└── models/
    └── pose_landmarker_full.task
```

### `index.html`

Contains the main page structure, game container, webcam element, HUD, and control indicators.

### `style.css`

Contains the styling for:

- Full-screen game layout
- HUD
- Webcam preview
- Control bars
- Status indicators
- Typography

### `game.js`

Contains the main Three.js game.

It handles:

- Scene creation
- Camera
- Renderer
- Lighting
- Terrain
- Trees
- Mountains
- Bird model
- Wings
- Flight movement
- Turning
- Camera following
- HUD
- Animation loop

### `motion.js`

Contains the motion-control system.

It handles:

- Webcam access
- MediaPipe initialization
- Pose detection
- Arm-angle calculation
- Flap detection
- Turn detection
- Motion-control state

### `models/pose_landmarker_full.task`

MediaPipe Pose Landmarker model used for real-time body tracking.

---

## World Design

The game uses a **looping tile-based environment** instead of one enormous terrain mesh.

Multiple terrain tiles surround the bird. When the bird moves into another world region, existing tiles are repositioned around it.

This gives the player the impression of a continuously expanding world while keeping the active scene relatively small.

### Environment Elements

The current environment contains:

- Grass terrain
- Procedurally placed trees
- Low-poly mountains
- Atmospheric fog
- Directional sunlight
- Ambient lighting
- Shadows

Tree placement uses seeded random generation so world regions can be reproduced consistently.

---

## Performance

The project is designed to remain lightweight enough for browser-based gameplay.

Current optimizations include:

- Instanced rendering for trees
- Reused Three.js geometries
- Tile-based terrain recycling
- Limited device pixel ratio
- Low-poly environment geometry
- Procedural generation
- Distance fog
- Reusable materials

The world does not continuously create unlimited terrain objects as the player flies forward.

---

## Running Locally

Because the project uses ES modules and webcam access, run it through a local HTTP server rather than opening `index.html` directly.

### Using VS Code Live Server

1. Open the project folder in Visual Studio Code.
2. Install the **Live Server** extension.
3. Right-click `index.html`.
4. Select **Open with Live Server**.
5. Open the displayed local URL.

### Using Python

If Python is installed:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

---

## Camera Requirements

The game requires webcam access.

For better motion tracking:

- Keep your shoulders visible.
- Keep both wrists visible.
- Stand far enough from the camera for your arms to fit inside the frame.
- Use reasonable lighting.
- Avoid having your arms blend into the background.

When the camera is detected successfully, the HUD should indicate that the body is being detected.

---

## GitHub Pages

The project is deployed as a static website using GitHub Pages.

The repository can be configured through:

```text
Repository
    ↓
Settings
    ↓
Pages
    ↓
Deploy from a branch
    ↓
main
    ↓
/ (root)
```

The live website is:

**https://nirant07.github.io/motion-bird/**

---

## Privacy

Motion Bird requires webcam access to perform motion tracking.

The application uses MediaPipe Pose Landmarker to process body landmarks for the game controls.

The project does not require users to upload recorded videos.

Users should only grant camera access to websites they trust.

---

## Future Improvements

Planned or possible improvements include:

- More detailed bird model
- Better wing animation
- More natural flight physics
- Improved banking
- Obstacles
- Collectibles
- Score and distance system
- High-score tracking
- Start menu
- Pause screen
- Game-over screen
- Sound effects
- Background music
- Multiple environments
- Weather effects
- Day/night cycle
- More detailed terrain
- Improved vegetation
- Motion calibration
- Difficulty levels
- Mobile support

---

## Development

Motion Bird started as an experiment to combine real-time computer vision with interactive 3D gameplay.

The project uses a browser-based architecture so that the final game can be shared through a normal web URL without requiring users to install a game engine or Python environment.

The combination of Three.js and MediaPipe makes it possible to connect physical body movement directly to browser-based gameplay.

---

## Author

**Nirant Dekate**

GitHub:  
https://github.com/Nirant07

Project Repository:  
https://github.com/Nirant07/motion-bird

---

## License

License information has not yet been added.

If the project is released for open-source reuse, an appropriate open-source license can be added to the repository.
