import type p5 from "p5";
import Matter from "matter-js";

export const useSpringSystem = () => {
	const sketch = (p: p5) => {
		const Engine = Matter.Engine;
		const World = Matter.World;
		const Bodies = Matter.Bodies;
		const Constraint = Matter.Constraint;
		const Mouse = Matter.Mouse;
		const MouseConstraint = Matter.MouseConstraint;

		let engine: Matter.Engine;
		let world: Matter.World;

		// Bodies
		let weight: Matter.Body;
		let anchor: Matter.Body;
		let spring: Matter.Constraint;
		let mConstraint: Matter.MouseConstraint;

		p.setup = () => {
			const canvas = p.createCanvas(p.windowWidth - 300, p.windowHeight);

			engine = Engine.create();
			world = engine.world;

			anchor = Bodies.circle(p.width / 2, 50, 20, { isStatic: true });

			weight = Bodies.circle(p.width / 2, 300, 40, {
				density: 0.004,
				restitution: 0.8,
			});

			spring = Constraint.create({
				bodyA: anchor,
				bodyB: weight,
				stiffness: 0.05,
				damping: 0.01,
				length: 200,
				render: {
					strokeStyle: "red",
					lineWidth: 5,
				},
			});

			const mouse = Mouse.create(canvas.elt);
			mouse.pixelRatio = p.pixelDensity();
			mConstraint = MouseConstraint.create(engine, {
				mouse: mouse,
				constraint: {
					stiffness: 0.2,
					render: {
						visible: false,
					},
				},
			});

			World.add(world, [anchor, weight, spring, mConstraint]);
		};

		p.draw = () => {
			p.background(30);
			Engine.update(engine);

			// anchor
			p.fill(100);
			p.noStroke();
			p.circle(anchor.position.x, anchor.position.y, 20);

			// spring line
			p.stroke(255);
			p.strokeWeight(4);
			p.line(
				anchor.position.x,
				anchor.position.y,
				weight.position.x,
				weight.position.y
			);

			// weight
			p.fill(255, 204, 0);
			p.noStroke();
			p.circle(weight.position.x, weight.position.y, 80);

			// Instruction
			p.fill(150);
			p.noStroke();
			p.textAlign(p.LEFT);
			p.textSize(30);
			p.text("বলটি টেনে ছেড়ে দাও", 20, 50);
		};

		p.windowResized = () => {
			p.resizeCanvas(p.windowWidth - 300, p.windowHeight);
		};
	};
	return { sketch };
};
