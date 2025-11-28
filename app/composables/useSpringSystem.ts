import type p5 from "p5";
import Matter from "matter-js";

export const useSpringSystem = () => {
	// 1. Reactive Configuration
	const config = reactive({
		stiffness: 0.05,
		damping: 0.01,
		length: 200,
		mass: 5,
	});

	// 2. UI Definitions (The "Widget" Schema)
	// app.vue doesn't need to know physics, it just renders these
	const controls = [
		{
			label: "Stiffness",
			key: "stiffness",
			type: "range",
			min: 0.001,
			max: 0.2,
			step: 0.001,
		},
		{
			label: "Damping",
			key: "damping",
			type: "range",
			min: 0,
			max: 0.5,
			step: 0.01,
		},
		{
			label: "Rest Length",
			key: "length",
			type: "range",
			min: 50,
			max: 400,
			step: 10,
		},
		{ label: "Mass", key: "mass", type: "range", min: 1, max: 50, step: 1 },
	];

	const sketch = (p: p5) => {
		const Engine = Matter.Engine;
		const World = Matter.World;
		const Bodies = Matter.Bodies;
		const Constraint = Matter.Constraint;
		const Mouse = Matter.Mouse;
		const MouseConstraint = Matter.MouseConstraint;

		let engine: Matter.Engine;
		let world: Matter.World;

		let weight: Matter.Body;
		let anchor: Matter.Body;
		let spring: Matter.Constraint;
		let mConstraint: Matter.MouseConstraint;

		p.setup = () => {
			const canvas = p.createCanvas(p.windowWidth - 300, p.windowHeight);
			engine = Engine.create();
			world = engine.world;

			anchor = Bodies.circle(p.width / 2, 50, 20, { isStatic: true });

			weight = Bodies.circle(p.width / 2, 300, 40, { restitution: 0.8 });
			Matter.Body.setMass(weight, config.mass);

			spring = Constraint.create({
				bodyA: anchor,
				bodyB: weight,
				stiffness: config.stiffness,
				damping: config.damping,
				length: config.length,
				render: { strokeStyle: "#fff", lineWidth: 5 },
			});

			const mouse = Mouse.create(canvas.elt);
			mouse.pixelRatio = p.pixelDensity();
			mConstraint = MouseConstraint.create(engine, {
				mouse: mouse,
				constraint: { stiffness: 0.2, render: { visible: false } },
			});

			World.add(world, [anchor, weight, spring, mConstraint]);
		};

		p.draw = () => {
			p.background(30);

			// Apply Config
			if (spring && weight) {
				spring.stiffness = config.stiffness;
				spring.damping = config.damping;
				spring.length = config.length;
				if (Math.abs(weight.mass - config.mass) > 0.1)
					Matter.Body.setMass(weight, config.mass);
			}

			Engine.update(engine);

			// Rendering
			p.fill(100);
			p.noStroke();
			p.circle(anchor.position.x, anchor.position.y, 20);
			p.stroke(255);
			p.strokeWeight(4);
			p.line(
				anchor.position.x,
				anchor.position.y,
				weight.position.x,
				weight.position.y
			);
			p.fill(255, 204, 0);
			p.noStroke();
			p.circle(weight.position.x, weight.position.y, 80);
		};

		p.windowResized = () => p.resizeCanvas(p.windowWidth - 300, p.windowHeight);
	};

	// Return sketch, config, AND controls
	return { sketch, config, controls };
};
