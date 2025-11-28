import type p5 from "p5";
import Matter from "matter-js";

export const useFallingShapes = () => {
	const config = reactive({
		gravityScale: 1,
		timeScale: 1,
	});

	// UI Definitions
	const controls = [
		{
			label: "Gravity Y",
			key: "gravityScale",
			type: "range",
			min: 0,
			max: 5,
			step: 0.1,
		},
		{
			label: "Time Scale",
			key: "timeScale",
			type: "range",
			min: 0.1,
			max: 3,
			step: 0.1,
		},
	];

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
			engine.gravity.scale = 0.001 * config.gravityScale;
			engine.timing.timeScale = config.timeScale;
			Engine.update(engine);

			if (p.mouseIsPressed && p.frameCount % 5 === 0) {
				const box = Bodies.rectangle(p.mouseX, p.mouseY, 30, 30);
				boxes.push(box);
				World.add(world, box);
			}

			p.fill(100);
			p.rectMode(p.CENTER);
			p.rect(ground.position.x, ground.position.y, p.width, 40);
			p.fill(0, 200, 255);
			for (const box of boxes) {
				p.push();
				p.translate(box.position.x, box.position.y);
				p.rotate(box.angle);
				p.rect(0, 0, 30, 30);
				p.pop();
			}
		};

		p.windowResized = () => p.resizeCanvas(p.windowWidth - 300, p.windowHeight);
	};

	return { sketch, config, controls };
};
