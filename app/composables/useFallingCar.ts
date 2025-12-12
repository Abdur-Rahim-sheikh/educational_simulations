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
		let ground_post: Matter.Body;
		let ground: Matter.Body;
		let wall: Matter.Body;
		let car: Matter.Body;
		let startPos: Matter.Vector;
		let X_Base: number;
		let Y_Base: number;

		let initialPos: Matter.Vector;
		let ramp_ground_x_mark: number;
		let snap_volecity: number;

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

			// marking the snap volecity to zero
			snap_volecity = 0;

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

			// End of ground
			ground_post = Bodies.circle(p.width - 10, p.height - 50, 10, {
				isStatic: true,
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
			let ramp_final_pos = verts.map((v) => ({
				v,
				dot: v.x * p.cos(angleRad) + v.y * p.sin(angleRad),
			}));
			ramp_final_pos.sort((a, b) => a.dot - b.dot);
			const top = ramp_final_pos[0]?.v || { x: 0, y: 0 };
			// test purpose start
			const bottom = { x: X_Base + config.length * p.cos(angleRad), y: Y_Base };
			const dist = Matter.Vector.magnitude(Matter.Vector.sub(top, bottom));
			console.log(`dist logged ${dist}`);
			// test purpose end
			ramp_ground_x_mark = X_Base + config.length * p.cos(angleRad);

			// Start position is slightly up from the top corner, adjusted by the ramp angle
			const distanceDownRamp = 20;
			const perpendicularLift = 10;

			// 1. Position along the ramp line
			startPos = {
				x: top.x + distanceDownRamp * p.cos(angleRad),
				y: top.y - distanceDownRamp * p.sin(angleRad),
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
				angle: angleRad,
				density: 0.005,
			});
			initialPos = { ...top };

			World.add(engine.world, [ground, ground_post, ramp, car]);
		};

		p.draw = () => {
			p.background(20);

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

			// The 'distance' must be measured along the ramp
			const displacementVector = Vector.sub(car.position, initialPos);

			const angleRad = p.radians(config.angle);

			const distance = Matter.Vector.magnitude(displacementVector);

			const velocity = car.speed;

			// for real world
			const accel = engine.gravity.y * p.sin(p.radians(config.angle)) * 9.8;

			drawMathOverlay(p, distance, velocity, accel);

			// End of land
			p.push();
			p.fill(112);
			p.circle(
				ground_post.position.x,
				ground_post.position.y,
				ground_post.circleRadius || 0
			);
			p.pop();
		};

		const resetCar = () => {
			createScene();
		};

		const drawMathOverlay = (p: p5, s: number, v: number, a: number) => {
			p.textAlign(p.RIGHT);
			p.textFont("monospace");

			// --- MATH POSITION CHANGE: Upper Right Corner ---
			const rightMargin = 250;
			const topMargin = 50;
			const baseX = p.width - rightMargin;
			const baseY = topMargin;

			// Draw The Formula
			p.textAlign(p.LEFT);
			p.textSize(24);
			p.fill(150);
			p.text("V² = U² + 2AS", baseX, baseY);

			p.textSize(28);
			p.fill(255);

			// "u²"
			p.fill("#FF4C4C");
			let prev_volecity = v * v;
			p.text(`u²  = ${prev_volecity.toFixed(2)}`, baseX, baseY + 40);

			// 2as
			let dist = (2 * a * s).toFixed(2);
			p.text(`2as = ${dist}`, baseX, baseY + 70);

			// marking when car touches the ground
			if (car.position.x < ramp_ground_x_mark) {
				snap_volecity = Math.sqrt(prev_volecity + 2 * a * s);
				console.log(prev_volecity, a, s);
			} else {
				p.text(`V = ${snap_volecity.toFixed(2)}`, X_Base + 20, Y_Base - 10);
			}

			// Instructions
			p.fill(0, 255, 0);
			p.textSize(12);
			p.text("Click canvas to reset car", p.width - 200, p.height - 50);
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
			Y_Base = p.height - 40;
			createScene();
		};

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
