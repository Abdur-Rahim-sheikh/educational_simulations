import type p5 from "p5";

import Matter from "matter-js";

export const useFallingShapes = () => {
	const sketch = (p: p5) => {
		const Engine = Matter.Engine;
		const World = Matter.World;
		const Bodies = Matter.Bodies;

		let engine: Matter.Engine;
		let world: Matter.World;
		let boxes: Matter.Body[] = [];
		let ground: Matter.Body;

		p.setup = () => {
			p.createCanvas(p.windowWidth - 300, p.windowHeight);
			engine = Engine.create();
			world = engine.world;

			ground = Bodies.rectangle(p.width / 2, p.height - 20, p.width, 40, {
				isStatic: true,
			});
			World.add(world, ground);
		};

		p.draw = () => {
			p.background(30);
			Engine.update(engine);

			if (p.mouseIsPressed && p.frameCount % 5 === 0) {
				const size = p.random(20, 50);
				const box = Bodies.rectangle(p.mouseX, p.mouseY, size, size);
				boxes.push(box);
				World.add(world, box);
			}
			p.fill(100);

			p.rectMode(p.CENTER);
			p.rect(ground.position.x, ground.position.y, 810, 30);
			p.fill(0, 200, 255);

			for (let box of boxes) {
				p.push();
				p.translate(box.position.x, box.position.y);
				p.rotate(box.angle);
				p.rect(
					0,
					0,
					box.bounds.max.x - box.bounds.min.x,
					box.bounds.max.y - box.bounds.min.y
				);
				p.pop();
			}
			p.fill(150);
			p.textAlign(p.CENTER);
			p.textSize(30);
			p.text("আয়ত বানাতে ক্লিক এন্ড ড্রাগ করুন", p.width / 2, 50);
		};

		p.windowResized = () => {
			p.resizeCanvas(p.windowWidth - 300, p.windowHeight);
		};
	};
	return { sketch };
};
