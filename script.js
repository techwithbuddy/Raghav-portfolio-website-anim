const html = document.documentElement;
const canvas = document.getElementById("video-canvas");
const context = canvas.getContext("2d");

const useFrameSequence = true;
const frameCount = useFrameSequence ? 240 : 1;
const currentFrame = index => (
  useFrameSequence
    ? `Frame/frame_${(index + 1).toString().padStart(4, '0')}.jpg`
    : "hero_3d.jpg"
);

const imageCache = new Map();
const pendingLoads = new Map();
const maxCachedFrames = 40;
let currentFrameIndex = 0;
let currentZoom = 1;
let targetFrameFloat = 0;
let animatedFrameFloat = 0;
let targetZoom = 1;
let animationRunning = false;

const getViewport = () => ({
  width: window.innerWidth,
  height: window.innerHeight
});

const resizeCanvas = () => {
  const { width, height } = getViewport();
  const dpr = Math.max(1, window.devicePixelRatio || 1);

  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  context.setTransform(dpr, 0, 0, dpr, 0, 0);
};

const trimCache = centerIndex => {
  if (imageCache.size <= maxCachedFrames) return;

  const safeStart = Math.max(0, centerIndex - 16);
  const safeEnd = Math.min(frameCount - 1, centerIndex + 24);

  imageCache.forEach((_, key) => {
    if (key < safeStart || key > safeEnd) {
      imageCache.delete(key);
    }
  });
};

const loadFrame = index => {
  if (index < 0 || index >= frameCount) return Promise.resolve(null);
  if (imageCache.has(index)) return Promise.resolve(imageCache.get(index));
  if (pendingLoads.has(index)) return pendingLoads.get(index);

  const img = new Image();
  img.decoding = "async";

  const framePromise = new Promise(resolve => {
    img.onload = () => {
      imageCache.set(index, img);
      pendingLoads.delete(index);
      trimCache(currentFrameIndex);
      resolve(img);
    };

    img.onerror = () => {
      pendingLoads.delete(index);
      resolve(null);
    };
  });

  pendingLoads.set(index, framePromise);
  img.src = currentFrame(index);

  return framePromise;
};

const drawFrame = (index, zoom) => {
  const image = imageCache.get(index);
  if (!image) return;

  const { width, height } = getViewport();
  const imageWidth = image.naturalWidth || image.width;
  const imageHeight = image.naturalHeight || image.height;

  const coverScale = Math.max(width / imageWidth, height / imageHeight);
  const drawScale = coverScale * zoom;
  const drawWidth = imageWidth * drawScale;
  const drawHeight = imageHeight * drawScale;
  const offsetX = (width - drawWidth) / 2;
  const offsetY = (height - drawHeight) / 2;

  context.clearRect(0, 0, width, height);
  context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
};

const preloadAround = index => {
  if (!useFrameSequence) return;

  loadFrame(index + 1);
  loadFrame(index + 2);
  loadFrame(index + 3);
  loadFrame(index - 1);
};

const stepAnimation = () => {
  const frameDelta = targetFrameFloat - animatedFrameFloat;
  animatedFrameFloat += frameDelta * 0.18;
  currentZoom += (targetZoom - currentZoom) * 0.15;

  const candidateIndex = Math.round(animatedFrameFloat);
  const clampedIndex = Math.min(frameCount - 1, Math.max(0, candidateIndex));
  currentFrameIndex = clampedIndex;

  if (imageCache.has(clampedIndex)) {
    drawFrame(clampedIndex, currentZoom);
    preloadAround(clampedIndex);
  } else {
    loadFrame(clampedIndex).then(image => {
      if (image && clampedIndex === currentFrameIndex) {
        drawFrame(clampedIndex, currentZoom);
      }
    });
  }

  const stillMoving = Math.abs(frameDelta) > 0.01 || Math.abs(targetZoom - currentZoom) > 0.001;

  if (stillMoving) {
    requestAnimationFrame(stepAnimation);
  } else {
    animationRunning = false;
  }
};

const ensureAnimationLoop = () => {
  if (animationRunning) return;
  animationRunning = true;
  requestAnimationFrame(stepAnimation);
};

const updateBackgroundFromScroll = () => {
  const scrollTop = html.scrollTop || document.body.scrollTop;
  const maxScrollTop = Math.max(1, html.scrollHeight - window.innerHeight);
  const scrollFraction = Math.min(1, Math.max(0, scrollTop / maxScrollTop));
  targetFrameFloat = scrollFraction * (frameCount - 1);
  targetZoom = 1 + scrollFraction * 0.25;
  ensureAnimationLoop();
};

const onScroll = () => {
  updateBackgroundFromScroll();
};

resizeCanvas();
loadFrame(0).then(image => {
  if (image) {
    animatedFrameFloat = 0;
    targetFrameFloat = 0;
    currentZoom = 1;
    targetZoom = 1;
    updateBackgroundFromScroll();
  } else {
    console.warn("Frame 1 could not be loaded. Check the Frame folder path and image names.");
  }
});
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', () => {
  resizeCanvas();
  drawFrame(currentFrameIndex, currentZoom);
});

// Matter.js Physics Animation for Skills Section
const initSkillsPhysics = () => {
  const container = document.getElementById('physics-canvas-container');
  if (!container) return;

  // module aliases
  const Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    World = Matter.World,
    Bodies = Matter.Bodies;

  // create an engine
  const engine = Engine.create();

  // adjust gravity for a more floating effect
  engine.world.gravity.y = 0;
  engine.world.gravity.x = 0;

  // create a renderer
  const render = Render.create({
    element: container,
    engine: engine,
    options: {
      width: container.clientWidth,
      height: container.clientHeight,
      background: 'transparent',
      wireframes: false,
      pixelRatio: window.devicePixelRatio
    }
  });

  // Tech Stack Categories
  const categories = [
    {
      color: "#9d4edd", skills: [
        { label: "C", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/c/c-original.svg" },
        { label: "C++", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cplusplus/cplusplus-original.svg" },
        { label: "Python", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg" },
        { label: "JavaScript", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg" }
      ]
    },
    {
      color: "#f472b6", skills: [
        { label: "HTML", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg" },
        { label: "CSS", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg" },
        { label: "React", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" }
      ]
    },
    {
      color: "#38bdf8", skills: [
        { label: "DSA" },
        { label: "OOP" },
        { label: "MySQL", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg" },
        { label: "Networks" }
      ]
    },
    {
      color: "#a3e635", skills: [
        { label: "Git", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg" },
        { label: "AI/ML" },
        { label: "Cybersec" }
      ]
    }
  ];

  // Preload images
  categories.forEach(category => {
    category.skills.forEach(skill => {
      if (skill.logo) {
        const img = new Image();
        img.src = skill.logo;
        skill.imageObj = img;
      }
    });
  });

  const bodies = [];
  const width = container.clientWidth;
  const height = container.clientHeight;

  // Add boundaries (walls)
  const wallOptions = {
    isStatic: true,
    render: { visible: false },
    friction: 0,
    restitution: 1
  };

  const ground = Bodies.rectangle(width / 2, height + 50, width * 2, 100, wallOptions);
  const ceiling = Bodies.rectangle(width / 2, -50, width * 2, 100, wallOptions);
  const leftWall = Bodies.rectangle(-50, height / 2, 100, height * 2, wallOptions);
  const rightWall = Bodies.rectangle(width + 50, height / 2, 100, height * 2, wallOptions);

  World.add(engine.world, [ground, ceiling, leftWall, rightWall]);

  // Create skill bubbles
  categories.forEach(category => {
    category.skills.forEach(skill => {
      const radius = 45; // Fixed size for nice logos
      const x = Math.random() * (width - radius * 2) + radius;
      const y = Math.random() * (height - radius * 2) + radius;

      const body = Bodies.circle(x, y, radius, {
        restitution: 1, // perfect bounce
        friction: 0,
        frictionAir: 0, // no air resistance
        render: {
          fillStyle: 'rgba(255, 255, 255, 0.02)',
          strokeStyle: category.color,
          lineWidth: 2
        },
        skillData: {
          label: skill.label,
          skillColor: category.color,
          imageObj: skill.imageObj
        }
      });

      // Initial push
      Matter.Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 4,
        y: (Math.random() - 0.5) * 4
      });

      bodies.push(body);
    });
  });

  World.add(engine.world, bodies);

  // Keep bodies moving
  Matter.Events.on(engine, 'beforeUpdate', function () {
    bodies.forEach(body => {
      // If speed drops too low, give it a tiny nudge
      if (body.speed < 2) {
        Matter.Body.applyForce(body, body.position, {
          x: (Math.random() - 0.5) * 0.002,
          y: (Math.random() - 0.5) * 0.002
        });
      }
    });
  });

  // add mouse control
  const mouse = Mouse.create(render.canvas);
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.2,
      render: { visible: false }
    }
  });

  World.add(engine.world, mouseConstraint);

  // keep the mouse in sync with rendering
  render.mouse = mouse;

  // Custom rendering for logos and text inside bodies
  Matter.Events.on(render, 'afterRender', function () {
    const context = render.context;
    context.font = "bold 15px 'Outfit', sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";

    bodies.forEach(body => {
      const { label, skillColor, imageObj } = body.skillData;

      if (imageObj && imageObj.complete && imageObj.naturalWidth !== 0) {
        const size = body.circleRadius * 1.3;
        context.drawImage(imageObj, body.position.x - size / 2, body.position.y - size / 2, size, size);
      } else {
        context.fillStyle = skillColor;
        context.fillText(label, body.position.x, body.position.y);
      }
    });
  });

  // run the renderer
  Render.run(render);

  // create runner
  const runner = Runner.create();

  // run the engine
  Runner.run(runner, engine);

  // Handle Resize
  window.addEventListener('resize', () => {
    render.canvas.width = container.clientWidth;
    render.canvas.height = container.clientHeight;
    render.options.width = container.clientWidth;
    render.options.height = container.clientHeight;

    Matter.Body.setPosition(ground, { x: container.clientWidth / 2, y: container.clientHeight + 50 });
    Matter.Body.setPosition(ceiling, { x: container.clientWidth / 2, y: -50 });
    Matter.Body.setPosition(rightWall, { x: container.clientWidth + 50, y: container.clientHeight / 2 });
  });
};

// Initialize after a small delay to ensure container dimensions are set
setTimeout(initSkillsPhysics, 500);
