import type p5 from "p5";

import Matter from "matter-js";

export const useFallingshapes = () => {
	const sketch = (p: p5) => {
		const Engine = Matter.Engine;
		const World = Matter.World;
		const Bodies = Matter.Bodies;

		let engine: Matter.Engine;
		let world: Matter.World;
		let boxes: Matter.Body[] = [];
		let ground: Matter.Body;

		p.setup = () => {
			p.createCanvas(800, 600);
			engine = Engine.create();
			world = engine.world;

			ground = Bodies.rectangle(400, 590, 810, 30, { isStatic: true });
			World.add(world, ground);
		};

		p.draw = () => {
			p.background(30);
			Engine.update(engine);

			if (p.mouseIsPressed && p.frameCount % 5 === 0) {
				const box = Bodies.rectangle(p.mouseX, p.mouseY, 40, 40);
				boxes.push(box);
				World.add(world, box);
			}
			p.fill(127);
			p.noStroke();
			p.rectMode(p.CENTER);
			p.rect(ground.position.x, ground.position.y, 810, 30);
			p.fill(255, 0, 100);

			for (let box of boxes) {
				p.push();
				p.translate(box.position.x, box.position.y);
				p.rotate(box.angle);
				p.rect(0, 0, 40, 40);
				p.pop();
			}
		};
	};
	return { sketch };
};
