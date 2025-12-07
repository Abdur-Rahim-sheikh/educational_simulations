import type p5 from "p5";
import Matter from "matter-js";

export const useFallingCar = () => {
	const config = reactive({
		angle: 30,
		length: 500,
		friction: 0.001, // Surface friction (ice vs concrete)
	});

	// 2. UI Controls
	const controls = [
		{
			label: "Angle (°)",
			key: "angle",
			type: "range",
			min: 10,
			max: 60,
			step: 1,
		},
		{
			label: "Ramp Length",
			key: "length",
			type: "range",
			min: 300,
			max: 800,
			step: 50,
		},
		{
			label: "Friction",
			key: "friction",
			type: "range",
			min: 0,
			max: 0.1,
			step: 0.001,
		},
	];

	const sketch = (p: p5) => {
		const Engine = Matter.Engine;
		const World = Matter.World;
		const Bodies = Matter.Bodies;
		const Body = Matter.Body;
		const Vector = Matter.Vector;

		let engine: Matter.Engine;
		let ramp: Matter.Body;
		let ground: Matter.Body;
		let wall: Matter.Body;
		let car: Matter.Body;
		let startPos: Matter.Vector;
		let X_Base: number;
		let Y_Base: number;

		let initialPos: Matter.Vector;

		p.setup = () => {
			const canvas = p.createCanvas(p.windowWidth - 300, p.windowHeight);
			engine = Engine.create();
			engine.gravity.y = 1;

			X_Base = 150;
			Y_Base = p.height - 40;

			createScene();
		};

		const createScene = () => {
			World.clear(engine.world, false);
			Engine.clear(engine);

			// Create Wall
			wall = Bodies.rectangle(X_Base, p.height / 2, 20, p.height, {
				isStatic: true,
			});

			// Create Ground
			ground = Bodies.rectangle(p.width / 2, p.height - 20, p.width, 40, {
				isStatic: true,
				// Give it max friction so the ramp doesn't slip, though it's static
				friction: 1.0,
			});

			// --- 1. Calculate Ramp Center (Pivoting from Bottom Left) ---
			const angleRad = p.radians(config.angle);
			const halfLength = config.length / 2;

			const rampX = X_Base + halfLength * p.cos(angleRad);
			const rampY = Y_Base - halfLength * p.sin(angleRad);

			// Create Ramp
			ramp = Bodies.rectangle(rampX, rampY, config.length, 20, {
				isStatic: true,
				angle: angleRad,
				friction: config.friction,
			});

			// --- 2. Calculate Car Start Position (At the Top Corner) ---

			// X_Top and Y_Top are the coordinates of the ramp's top corner
			const verts = ramp.vertices;
			const projected = verts.map((v) => ({
				v,
				dot: v.x * p.cos(angleRad) + v.y * p.sin(angleRad),
			}));
			projected.sort((a, b) => a.dot - b.dot);
			const top = projected[projected.length - 1]?.v || { x: 0, y: 0 };

			// Start position is slightly up from the top corner, adjusted by the ramp angle
			const distanceDownRamp = 20;
			const perpendicularLift = 10;

			// 1. Position along the ramp line
			startPos = {
				x: top.x - distanceDownRamp * p.cos(angleRad),
				y: top.y + distanceDownRamp * p.sin(angleRad),
			};

			// 2. Adjust position perpendicular to the ramp line to center the car's mass
			startPos = {
				x: startPos.x + perpendicularLift * p.sin(angleRad),
				y: startPos.y - perpendicularLift * p.cos(angleRad),
			};

			car = Bodies.rectangle(startPos.x, startPos.y, 40, 20, {
				friction: config.friction,
				frictionAir: 0.005,
				restitution: 0,
				angle: angleRad, // Match ramp angle
				density: 0.005,
			});
			initialPos = { ...car.position };

			World.add(engine.world, [ground, ramp, car]);
		};

		p.draw = () => {
			p.background(20); // Dark "Blackboard" background

			Engine.update(engine);

			// --- 1. Draw Environment (The "Reality") ---

			p.noStroke();
			p.fill(80);
			p.rectMode(p.CENTER);
			// Draw wall
			p.rect(wall.position.x, wall.position.y, 20, p.height);
			// Draw Ground
			p.rect(ground.position.x, ground.position.y, p.width, 40);

			// Draw Ramp
			p.push();
			p.translate(ramp.position.x, ramp.position.y);
			p.rotate(ramp.angle);
			p.stroke(255);
			p.strokeWeight(2);
			p.noFill();
			p.rect(0, 0, config.length, 20);
			p.pop();

			// Draw Fixed Pivot point (Bottom Corner)
			p.fill(255);
			p.ellipse(X_Base, Y_Base + 10, 10); // +10 because the ramp is 20px thick and center is on the line.

			// Draw Car
			p.push();
			p.translate(car.position.x, car.position.y);
			p.rotate(car.angle);
			p.fill("#FF4C4C"); // Alan Becker Red
			p.noStroke();
			p.rect(0, 0, 40, 20);
			// Wheels
			p.fill(255);
			p.ellipse(-15, 10, 10, 10);
			p.ellipse(15, 10, 10, 10);
			p.pop();

			// --- 2. The "Math Layer" (Alan Becker Style) ---

			// The 'distance' must be measured along the ramp
			const displacementVector = Vector.sub(car.position, initialPos);
			// Projection of displacement onto the ramp axis (angle of ramp)
			const angleRad = p.radians(config.angle);
			// Unit vector pointing down the ramp (cos(theta), sin(theta))
			const rampUnitVector = Vector.create(p.cos(angleRad), p.sin(angleRad));
			const distance = Vector.dot(displacementVector, rampUnitVector);

			const velocity = car.speed;
			// Acceleration down the ramp: g * sin(theta)
			const accel = engine.world.gravity.y * p.sin(p.radians(config.angle));

			drawMathOverlay(p, distance, velocity, accel);

			// Reset logic
			if (car.position.y > p.height || car.position.x > p.width) {
				createScene(); // Use createScene to ensure perfect reset when parameters may have changed
			}
		};

		const resetCar = () => {
			// Re-creating the entire scene is the safest way to ensure the car starts exactly
			// on the recalculated ramp position, especially since ramp angle changes trigger this.
			createScene();
		};

		// Helper for dashed lines (Local function instead of attaching to p)
		const setLineDash = (list: number[]) => {
			// Cast drawingContext to CanvasRenderingContext2D to access setLineDash
			(p.drawingContext as CanvasRenderingContext2D).setLineDash(list);
		};

		const drawMathOverlay = (p: p5, s: number, v: number, a: number) => {
			p.textAlign(p.RIGHT); // Align text to the right for the top-right corner
			p.textFont("monospace");

			// --- MATH POSITION CHANGE: Upper Right Corner ---
			const rightMargin = 50;
			const topMargin = 50;
			const baseX = p.width - rightMargin;
			const baseY = topMargin;

			// Draw The Formula
			p.textSize(24);
			p.fill(150);
			p.text("Kinematic Equation:", baseX, baseY);

			p.textSize(32);
			p.fill(255);

			let xCursor = baseX;

			// Start drawing from the right and move left

			// "v²"
			p.fill("#FF4C4C");
			p.text("v²", xCursor, baseY + 40);

			// Backtrack cursor position to draw next element to its left
			xCursor -= p.textWidth("v² ");

			p.fill(255);
			p.text(" = ", xCursor, baseY + 40);
			xCursor -= p.textWidth(" = ");

			// "u²" (0)
			p.fill(100);
			p.text("0", xCursor, baseY + 40);
			xCursor -= p.textWidth("0 ");

			p.fill(255);
			p.text(" + 2(", xCursor, baseY + 40);
			xCursor -= p.textWidth(" + 2(");

			// "a"
			p.fill("#42b883");
			p.text(a.toFixed(2), xCursor, baseY + 40);
			xCursor -= p.textWidth(a.toFixed(2));

			p.fill(255);
			p.text(")(", xCursor, baseY + 40);
			xCursor -= p.textWidth(")(");

			// "s"
			p.fill("#4C9AFF");
			p.text(s.toFixed(1), xCursor, baseY + 40);

			// This is the position of 's' (approximately)
			const sTextAnchorX = xCursor - p.textWidth(s.toFixed(1)) / 2;

			xCursor -= p.textWidth(s.toFixed(1));

			p.fill(255);
			p.text(")", xCursor, baseY + 40);

			// --- Visual Connectors ---

			// Draw Line from "s" in equation to the initial position of car
			if (s > 10) {
				p.push();
				p.stroke("#4C9AFF");
				p.strokeWeight(1);

				setLineDash([5, 5]);

				// Draw line from the math box to the starting position
				p.line(sTextAnchorX, baseY + 20, initialPos.x, initialPos.y);
				p.pop();

				// Draw distance path on ramp
				p.push();
				p.stroke("#4C9AFF");
				p.strokeWeight(3);
				// Clear line dash for the solid distance line
				setLineDash([0, 0]);
				p.line(initialPos.x, initialPos.y, car.position.x, car.position.y);
				p.pop();
			}

			// Re-align to Left for result text
			p.textAlign(p.LEFT);

			// Live Result (position relative to the top right corner)
			const vSquared = (v * v).toFixed(2);
			const rhs = (2 * a * s).toFixed(2);

			p.textSize(20);
			p.fill(150);
			// We use baseX - 300 to push the text back from the right edge
			p.text(`Left Side (v²): ${vSquared}`, baseX - 300, baseY + 80);
			p.text(`Right Side (2as): ${rhs}`, baseX - 300, baseY + 110);

			// Instructions
			p.fill(80);
			p.textSize(12);
			p.text("Click canvas to reset car", p.width - 200, p.height - 20);
		};

		p.mousePressed = () => {
			// Check if click is on canvas
			if (
				p.mouseX > 0 &&
				p.mouseX < p.width &&
				p.mouseY > 0 &&
				p.mouseY < p.height
			) {
				resetCar();
			}
		};

		p.windowResized = () => {
			p.resizeCanvas(p.windowWidth - 300, p.windowHeight);
			Y_Base = p.height - 40; // Recalculate Y_Base based on new height
			createScene();
		};

		// Watch for config changes
		let lastAngle = config.angle;
		let lastLength = config.length;

		const originalDraw = p.draw;
		p.draw = () => {
			if (lastAngle !== config.angle || lastLength !== config.length) {
				createScene();
				lastAngle = config.angle;
				lastLength = config.length;
			}
			originalDraw();
		};
	};

	return { sketch, config, controls };
};
