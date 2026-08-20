const html = document.documentElement;
const canvas = document.getElementById("video-canvas");
const context = canvas.getContext("2d");
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');
const typingText = document.querySelector('.typing-text');

if (typingText) {
  const roles = ['Developer', 'Full Stack Engineer', 'Problem Solver', 'Creator'];
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  const typeLoop = () => {
    const currentWord = roles[roleIndex];

    if (!isDeleting) {
      charIndex++;
      typingText.textContent = currentWord.slice(0, charIndex);
      if (charIndex === currentWord.length) {
        isDeleting = true;
        setTimeout(typeLoop, 1200);
        return;
      }
    } else {
      charIndex--;
      typingText.textContent = currentWord.slice(0, charIndex);
      if (charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
      }
    }

    const speed = isDeleting ? 60 : 110;
    setTimeout(typeLoop, speed);
  };

  typeLoop();
}

const heroImage = document.querySelector('.image-wrapper');

if (heroImage) {
  const heroMotion = {
    targetX: 0,
    targetY: 0,
    currentX: 0,
    currentY: 0,
    scrollY: 0
  };

  const updateHeroMotion = () => {
    heroMotion.currentX += (heroMotion.targetX - heroMotion.currentX) * 0.08;
    heroMotion.currentY += (heroMotion.targetY - heroMotion.currentY) * 0.08;
    heroMotion.scrollY += ((window.scrollY * 0.035) - heroMotion.scrollY) * 0.08;

    heroImage.style.setProperty('--hero-tilt-x', `${heroMotion.currentY.toFixed(2)}deg`);
    heroImage.style.setProperty('--hero-tilt-y', `${heroMotion.currentX.toFixed(2)}deg`);
    heroImage.style.setProperty('--hero-shift-y', `${heroMotion.scrollY.toFixed(2)}px`);
    requestAnimationFrame(updateHeroMotion);
  };

  heroImage.addEventListener('pointermove', (event) => {
    const bounds = heroImage.getBoundingClientRect();
    const relativeX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const relativeY = (event.clientY - bounds.top) / bounds.height - 0.5;
    heroMotion.targetX = relativeX * 5;
    heroMotion.targetY = relativeY * -5;
  });

  heroImage.addEventListener('pointerleave', () => {
    heroMotion.targetX = 0;
    heroMotion.targetY = 0;
  });

  updateHeroMotion();
}

const cursor = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
  ringX: window.innerWidth / 2,
  ringY: window.innerHeight / 2
};

window.addEventListener('pointermove', (event) => {
  cursor.x = event.clientX;
  cursor.y = event.clientY;
  cursorDot.style.left = `${event.clientX}px`;
  cursorDot.style.top = `${event.clientY}px`;
});

const animateCursor = () => {
  cursor.ringX += (cursor.x - cursor.ringX) * 0.12;
  cursor.ringY += (cursor.y - cursor.ringY) * 0.12;

  cursorRing.style.left = `${cursor.ringX}px`;
  cursorRing.style.top = `${cursor.ringY}px`;

  requestAnimationFrame(animateCursor);
};
animateCursor();

const interactiveSelectors = 'a, button, input, textarea, .project-card, .achievement-card, .social-icon, .resume-btn, .contact-social-item, .btn-send, .nav-links a, .nav-logo a';

document.querySelectorAll(interactiveSelectors).forEach((element) => {
  element.addEventListener('mouseenter', () => cursorRing.classList.add('active'));
  element.addEventListener('mouseleave', () => cursorRing.classList.remove('active'));
});

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const backgroundState = { width: 0, height: 0, particles: [], animationId: null, paused: false };

const resizeCanvas = () => {
  const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
  backgroundState.width = window.innerWidth;
  backgroundState.height = window.innerHeight;
  canvas.width = Math.floor(backgroundState.width * dpr);
  canvas.height = Math.floor(backgroundState.height * dpr);
  canvas.style.width = `${backgroundState.width}px`;
  canvas.style.height = `${backgroundState.height}px`;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
};

const createParticles = () => {
  const count = prefersReducedMotion.matches ? 18 : Math.min(46, Math.max(24, Math.floor(window.innerWidth / 28)));
  backgroundState.particles = Array.from({ length: count }, (_, index) => ({
    x: Math.random(),
    y: Math.random(),
    radius: 0.5 + Math.random() * 1.5,
    speed: 0.00008 + Math.random() * 0.00014,
    phase: index * 0.7,
    color: index % 3 === 0 ? '56, 189, 248' : index % 3 === 1 ? '129, 140, 248' : '167, 139, 250'
  }));
};

const drawAmbientBackground = time => {
  if (backgroundState.paused) return;
  const { width, height, particles } = backgroundState;
  context.clearRect(0, 0, width, height);
  context.fillStyle = 'rgba(5, 8, 18, 0.32)';
  context.fillRect(0, 0, width, height);

  particles.forEach(particle => {
    const drift = prefersReducedMotion.matches ? 0 : Math.sin(time * particle.speed + particle.phase) * 0.018;
    const x = (particle.x + drift) * width;
    const y = (particle.y + Math.cos(time * particle.speed + particle.phase) * 0.012) * height;
    context.beginPath();
    context.fillStyle = `rgba(${particle.color}, 0.42)`;
    context.arc(x, y, particle.radius, 0, Math.PI * 2);
    context.fill();
  });

  if (!prefersReducedMotion.matches) backgroundState.animationId = requestAnimationFrame(drawAmbientBackground);
};

const startBackground = () => {
  resizeCanvas();
  createParticles();
  if (!prefersReducedMotion.matches) backgroundState.animationId = requestAnimationFrame(drawAmbientBackground);
  else drawAmbientBackground(0);
};

startBackground();
window.addEventListener('resize', () => {
  resizeCanvas();
  createParticles();
  if (prefersReducedMotion.matches) drawAmbientBackground(0);
});
document.addEventListener('visibilitychange', () => {
  backgroundState.paused = document.hidden;
  if (!document.hidden && !prefersReducedMotion.matches) {
    window.cancelAnimationFrame(backgroundState.animationId);
    backgroundState.animationId = requestAnimationFrame(drawAmbientBackground);
  }
});

const bootScreen = document.getElementById('boot-screen');
const bootEnter = document.getElementById('boot-enter');
const bootProgressBar = document.getElementById('boot-progress-bar');
const bootProgressLabel = document.getElementById('boot-progress-label');
const bootStatus = document.getElementById('boot-status');
const bootLog = document.getElementById('boot-log');
const osEnvironment = document.getElementById('os-environment');
const systemTime = document.getElementById('system-time');
const desktopPrompt = document.getElementById('desktop-prompt');
const archiveToggle = document.getElementById('archive-toggle');
const legacyPortfolio = document.querySelector('.legacy-portfolio');
const windowLayer = document.getElementById('os-window-layer');
const taskbar = document.getElementById('os-taskbar');
const appDefinitions = {
  projects: { title: 'PROJECTS', icon: '📁', source: '#projects', width: 720 },
  about: { title: 'ABOUT', icon: '👤', source: '#about', width: 680, label: 'IDENTITY MODULE', intro: 'The person, principles, and direction behind the system.' },
  skills: { title: 'SKILLS', icon: '🧩', source: '#skills', width: 760, label: 'CAPABILITY MODULE', intro: 'A live map of the tools and disciplines in the workspace.' },
  experience: { title: 'EXPERIENCE', icon: '◈', source: '#experience', width: 800, label: 'FIELD LOG MODULE', intro: 'A timeline of real-world involvement, leadership, and contribution.' },
  achievements: { title: 'ACHIEVEMENTS', icon: '🏆', source: '#achievements', width: 800, label: 'MILESTONE MODULE', intro: 'Selected milestones, certifications, and recognition.' },
  resume: { title: 'RESUME', icon: '📄', source: '#resume', width: 800, label: 'PROFILE MODULE', intro: 'A complete professional snapshot, ready for inspection.' },
  contact: { title: 'CONTACT', icon: '📡', source: '#contact', width: 760, label: 'OPEN CHANNEL MODULE', intro: 'A direct channel for projects, opportunities, and conversation.' }
};

const readProjectData = source => [...source.querySelectorAll('.project-card')].map(card => {
  const name = card.querySelector('h3')?.textContent.trim() || 'Project';
  const description = card.querySelector('.project-desc')?.textContent.trim() || '';
  const technologies = [...card.querySelectorAll('.tech-stack-tags span')].map(tag => tag.textContent.trim());
  const unavailable = 'This detail is not documented in the current portfolio.';
  return {
    name,
    description,
    technologies,
    github: card.querySelector('.github-link')?.href || '',
    demo: card.querySelector('.demo-link')?.getAttribute('href') || '',
    problem: description,
    idea: `A project focused on ${description.charAt(0).toLowerCase()}${description.slice(1)}`,
    build: `The portfolio lists ${technologies.join(', ')} as the technology focus. Detailed architecture notes are not currently documented.`,
    challenge: unavailable,
    solution: description,
    result: 'The portfolio describes the intended product capability above; measured outcomes are not currently documented.'
  };
});

const createProjectUniverse = (source, windowElement) => {
  const projects = readProjectData(source);
  const content = document.createElement('div');
  content.className = 'project-universe';
  content.innerHTML = `
    <div class="universe-stage">
      <canvas class="universe-canvas" aria-label="Interactive project universe"></canvas>
      <div class="universe-hud">
        <div><span class="universe-kicker">PROJECT NETWORK / RAGHAV OS</span><h2>RAGHAV CORE</h2><p>Select a planet to inspect a project.</p></div>
        <button class="universe-reset" type="button">RESET UNIVERSE</button>
      </div>
      <div class="universe-hover-label" aria-hidden="true"></div>
      <div class="universe-loading" role="status">CALIBRATING PROJECT ORBITS...</div>
    </div>
    <div class="universe-access-list" aria-label="Project universe keyboard navigation"></div>
    <section class="universe-case-study" hidden aria-live="polite" aria-labelledby="case-study-title">
      <div class="case-study-top"><span class="universe-kicker">PROJECT DOCUMENTARY / NODE <span class="case-study-index"></span></span><button class="case-study-close" type="button" aria-label="Back to project universe">×</button></div>
      <div class="case-study-heading"><p class="case-study-kicker">RAGHAV OS PROJECT FILE</p><h3 class="case-study-name" id="case-study-title"></h3><p class="case-study-description"></p></div>
      <div class="case-study-sections"></div>
      <div class="case-study-footer"><div><span class="universe-kicker">TECH STACK</span><div class="case-study-tech"></div></div><div><span class="universe-kicker">LINKS</span><div class="case-study-links"></div></div></div>
      <button class="back-to-universe" type="button">← BACK TO UNIVERSE</button>
    </section>`;
  const stage = content.querySelector('.universe-stage');
  const canvas = content.querySelector('.universe-canvas');
  const panel = content.querySelector('.universe-case-study');
  const accessList = content.querySelector('.universe-access-list');
  const loading = content.querySelector('.universe-loading');
  const hoverLabel = content.querySelector('.universe-hover-label');
  const state = { paused: false, animationId: null, selected: null, focusIndex: null, scene: null, renderer: null, camera: null, resizeObserver: null, caseStudyObserver: null, caseStudyScrollHandler: null };
  const planetColors = [0x62d6ff, 0xb29aff, 0x7ee7c4, 0xffb86b];

  const showProject = index => {
    const project = projects[index];
    if (!project) return;
    state.selected = index;
    state.focusIndex = index;
    state.targetZoom = 1.12;
    panel.hidden = false;
    content.classList.add('is-case-study-open');
    panel.querySelector('.case-study-index').textContent = String(index + 1).padStart(2, '0');
    panel.querySelector('.case-study-name').textContent = project.name;
    panel.querySelector('.case-study-description').textContent = project.description;
    const facts = [
      ['01', 'THE PROBLEM', project.problem],
      ['02', 'THE IDEA', project.idea],
      ['03', 'THE BUILD', project.build],
      ['04', 'THE CHALLENGE', project.challenge],
      ['05', 'THE SOLUTION', project.solution],
      ['06', 'THE RESULT', project.result]
    ];
    panel.querySelector('.case-study-sections').innerHTML = facts.map(([number, title, text]) => `<article class="case-study-section"><span>${number}</span><div><h4>${title}</h4><p>${text}</p></div></article>`).join('');
    panel.querySelectorAll('.case-study-section').forEach((section, sectionIndex) => {
      if (sectionIndex < 2) section.classList.add('is-revealed');
    });
    const scrollRoot = windowElement.querySelector('.os-window-body');
    state.caseStudyObserver?.disconnect();
    if (state.caseStudyScrollHandler) scrollRoot.removeEventListener('scroll', state.caseStudyScrollHandler);
    const revealSections = () => {
      const rootRect = scrollRoot.getBoundingClientRect();
      panel.querySelectorAll('.case-study-section').forEach(section => {
        const sectionRect = section.getBoundingClientRect();
        if (sectionRect.top < rootRect.bottom - 24 && sectionRect.bottom > rootRect.top + 24) section.classList.add('is-revealed');
      });
    };
    state.caseStudyScrollHandler = revealSections;
    scrollRoot.addEventListener('scroll', revealSections, { passive: true });
    window.requestAnimationFrame(revealSections);
    window.setTimeout(revealSections, 120);
    panel.querySelector('.case-study-tech').innerHTML = project.technologies.map(tech => `<span>${tech}</span>`).join('');
    panel.querySelector('.case-study-links').innerHTML = [
      project.github ? `<a href="${project.github}" target="_blank" rel="noopener noreferrer">GITHUB ↗</a>` : '',
      project.demo && project.demo !== '#' ? `<a href="${project.demo}" target="_blank" rel="noopener noreferrer">LIVE DEMO ↗</a>` : ''
    ].filter(Boolean).join('');
    accessList.querySelectorAll('button').forEach((button, buttonIndex) => button.classList.toggle('is-selected', buttonIndex === index));
    if (state.planets?.[index]?.material) state.planets[index].material.emissiveIntensity = 0.75;
    panel.querySelector('.case-study-name').focus?.();
    window.setTimeout(() => panel.querySelector('.back-to-universe')?.focus(), prefersReducedMotion.matches ? 0 : 300);
  };

  const closeProject = () => {
    panel.hidden = true;
    content.classList.remove('is-case-study-open');
    state.selected = null;
    state.focusIndex = null;
    state.targetZoom = 1;
    accessList.querySelectorAll('button').forEach(button => button.classList.remove('is-selected'));
  };

  projects.forEach((project, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.innerHTML = `<span class="access-orb" aria-hidden="true"></span><span>${project.name}</span>`;
    button.addEventListener('click', () => showProject(index));
    accessList.append(button);
  });
  content.querySelector('.universe-reset').addEventListener('click', closeProject);
  content.querySelector('.case-study-close').addEventListener('click', closeProject);
  content.querySelector('.back-to-universe').addEventListener('click', closeProject);

  const fallback = () => {
    stage.classList.add('is-fallback');
    loading.textContent = '2D PROJECT MAP READY';
    const context = canvas.getContext('2d');
    state.mapZoom = 1;
    state.targetZoom = 1;
    const points = Array.from({ length: 52 }, () => ({ x: Math.random(), y: Math.random(), radius: Math.random() * 1.4 + 0.4 }));
    state.planets = projects.map((project, index) => ({ index, angle: (index / projects.length) * Math.PI * 2, radius: 0.29 + (index % 2) * 0.09, speed: 0.00008 + index * 0.00001, x: 0, y: 0 }));
    const resize = () => { const rect = stage.getBoundingClientRect(); const width = Math.max(1, Math.floor(rect.width)); const height = Math.max(1, Math.floor(rect.height)); const dpr = Math.min(2, window.devicePixelRatio || 1); canvas.style.width = `${width}px`; canvas.style.height = `${height}px`; canvas.width = Math.max(1, Math.floor(width * dpr)); canvas.height = Math.max(1, Math.floor(height * dpr)); context.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const hitTest = event => { const rect = canvas.getBoundingClientRect(); const x = event.clientX - rect.left; const y = event.clientY - rect.top; const hit = state.planets.find(planet => Math.hypot(planet.x - x, planet.y - y) < 28); canvas.style.cursor = hit ? 'pointer' : 'default'; hoverLabel.textContent = hit ? projects[hit.index].name : ''; hoverLabel.classList.toggle('is-visible', Boolean(hit)); return hit; };
    canvas.addEventListener('pointermove', hitTest);
    canvas.addEventListener('click', event => { const hit = hitTest(event); if (hit) showProject(hit.index); });
    state.resizeObserver = new ResizeObserver(resize);
    state.resizeObserver.observe(stage);
    resize();
    window.setTimeout(resize, 100);
    window.setTimeout(resize, 500);
    const render = time => {
      if (state.paused) return;
      const rect = stage.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const centerX = width / 2;
      const centerY = height / 2 + 24;
      state.mapZoom += (state.targetZoom - state.mapZoom) * 0.08;
      context.clearRect(0, 0, width, height);
      context.save();
      context.translate(centerX, centerY);
      context.scale(state.mapZoom, state.mapZoom);
      context.translate(-centerX, -centerY);
      points.forEach(point => { context.beginPath(); context.fillStyle = 'rgba(139, 201, 255, 0.42)'; context.arc(point.x * width, point.y * height, point.radius, 0, Math.PI * 2); context.fill(); });
      context.strokeStyle = 'rgba(125, 164, 214, 0.16)';
      [0.25, 0.36, 0.47].forEach(radius => { context.beginPath(); context.ellipse(centerX, centerY, width * radius, height * radius * 0.42, -0.12, 0, Math.PI * 2); context.stroke(); });
      const corePulse = 32 + Math.sin(time * 0.002) * 3;
      const coreGlow = context.createRadialGradient(centerX, centerY, 4, centerX, centerY, corePulse * 2.4);
      coreGlow.addColorStop(0, 'rgba(98, 214, 255, 0.58)'); coreGlow.addColorStop(1, 'rgba(98, 214, 255, 0)'); context.fillStyle = coreGlow; context.beginPath(); context.arc(centerX, centerY, corePulse * 2.4, 0, Math.PI * 2); context.fill();
      context.fillStyle = '#9caeff'; context.beginPath(); context.arc(centerX, centerY, corePulse, 0, Math.PI * 2); context.fill();
      context.fillStyle = '#081020'; context.font = '600 10px Outfit, sans-serif'; context.textAlign = 'center'; context.fillText('CORE', centerX, centerY + 3);
      state.planets.forEach(planet => { const angle = planet.angle + time * planet.speed; planet.x = centerX + Math.cos(angle) * width * planet.radius; planet.y = centerY + Math.sin(angle) * height * planet.radius * 0.42; const selected = state.selected === planet.index; const size = selected ? 25 : 19; context.fillStyle = ['#62d6ff', '#b29aff', '#7ee7c4', '#ffb86b'][planet.index]; context.shadowColor = context.fillStyle; context.shadowBlur = selected ? 20 : 10; context.beginPath(); context.arc(planet.x, planet.y, size, 0, Math.PI * 2); context.fill(); context.shadowBlur = 0; });
      context.restore();
      state.animationId = prefersReducedMotion.matches ? null : requestAnimationFrame(render);
    };
    state.resume = () => { if (state.paused || state.animationId) return; if (prefersReducedMotion.matches) { render(0); return; } state.animationId = requestAnimationFrame(render); };
    state.pause = () => { state.paused = true; window.cancelAnimationFrame(state.animationId); state.animationId = null; };
    state.paused = document.hidden;
    state.resume();
  };

  if (!window.THREE || prefersReducedMotion.matches || window.matchMedia('(max-width: 700px)').matches) fallback();
  else {
    const THREE = window.THREE;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 1.5, 11);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio || 1));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    state.scene = scene;
    state.camera = camera;
    state.renderer = renderer;
    state.planets = [];
    const universe = new THREE.Group();
    scene.add(universe);
    scene.add(new THREE.AmbientLight(0x8ba9d6, 1.4));
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.05, 2), new THREE.MeshStandardMaterial({ color: 0x8da5ff, emissive: 0x274b91, emissiveIntensity: 0.9, roughness: 0.25, metalness: 0.45 }));
    universe.add(core);
    const coreGlow = new THREE.Mesh(new THREE.SphereGeometry(1.35, 24, 24), new THREE.MeshBasicMaterial({ color: 0x62d6ff, transparent: true, opacity: 0.08 }));
    universe.add(coreGlow);
    const orbitRings = [2.5, 3.5, 4.45].map(radius => {
      const ring = new THREE.Mesh(new THREE.RingGeometry(radius - 0.006, radius, 96), new THREE.MeshBasicMaterial({ color: 0x6d9ad0, transparent: true, opacity: 0.12, side: THREE.DoubleSide }));
      ring.rotation.x = Math.PI / 2.4;
      universe.add(ring);
      return ring;
    });
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(180 * 3);
    for (let index = 0; index < particlePositions.length; index += 3) {
      particlePositions[index] = (Math.random() - 0.5) * 16;
      particlePositions[index + 1] = (Math.random() - 0.5) * 10;
      particlePositions[index + 2] = (Math.random() - 0.5) * 10;
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    scene.add(new THREE.Points(particleGeometry, new THREE.PointsMaterial({ color: 0x8bc9ff, size: 0.025, transparent: true, opacity: 0.65 })));
    projects.forEach((project, index) => {
      const angle = (index / projects.length) * Math.PI * 2;
      const radius = 2.8 + (index % 2) * 0.75;
      const planet = new THREE.Mesh(new THREE.SphereGeometry(0.42 + (index % 2) * 0.08, 20, 20), new THREE.MeshStandardMaterial({ color: planetColors[index], emissive: planetColors[index], emissiveIntensity: 0.2, roughness: 0.38, metalness: 0.2 }));
      planet.userData = { index, angle, radius, speed: 0.12 + index * 0.015, baseScale: planet.scale.x };
      planet.position.set(Math.cos(angle) * radius, Math.sin(angle * 1.7) * 0.55, Math.sin(angle) * radius * 0.62);
      universe.add(planet);
      state.planets.push(planet);
    });
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const selectAt = event => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(state.planets)[0];
      if (hit) showProject(hit.object.userData.index);
    };
    canvas.addEventListener('pointermove', event => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(state.planets)[0];
      canvas.style.cursor = hit ? 'pointer' : 'default';
      hoverLabel.textContent = hit ? projects[hit.object.userData.index].name : '';
      hoverLabel.classList.toggle('is-visible', Boolean(hit));
      state.planets.forEach(planet => { planet.scale.setScalar(planet === hit?.object ? planet.userData.baseScale * 1.22 : planet.userData.baseScale); });
    });
    canvas.addEventListener('click', selectAt);
    const resize = () => { const rect = stage.getBoundingClientRect(); renderer.setSize(rect.width, rect.height, false); camera.aspect = rect.width / Math.max(1, rect.height); camera.updateProjectionMatrix(); };
    state.resizeObserver = new ResizeObserver(resize);
    state.resizeObserver.observe(stage);
    resize();
    loading.textContent = 'PROJECT NETWORK ONLINE';
    const render = time => {
      if (state.paused) return;
      const seconds = time * 0.001;
      state.planets.forEach(planet => { const data = planet.userData; const angle = data.angle + seconds * data.speed; planet.position.x = Math.cos(angle) * data.radius; planet.position.z = Math.sin(angle) * data.radius * 0.62; planet.position.y = Math.sin(angle * 1.7) * 0.55; });
      core.rotation.y = seconds * 0.18;
      core.rotation.x = Math.sin(seconds * 0.2) * 0.12;
      orbitRings.forEach((ring, index) => { ring.rotation.z = seconds * (index + 1) * 0.025; });
      const targetPlanet = state.focusIndex === null ? null : state.planets[state.focusIndex];
      const lookTarget = targetPlanet ? targetPlanet.position : new THREE.Vector3(0, 0, 0);
      const desiredCamera = targetPlanet ? new THREE.Vector3(targetPlanet.position.x * 0.72, targetPlanet.position.y * 0.72 + 0.35, targetPlanet.position.z + 3.4) : new THREE.Vector3(Math.sin(seconds * 0.16) * 0.35, 1.5, 11);
      camera.position.lerp(desiredCamera, targetPlanet ? 0.035 : 0.012);
      camera.lookAt(lookTarget);
      renderer.render(scene, camera);
      state.animationId = requestAnimationFrame(render);
    };
    state.resume = () => { if (!state.paused && !state.animationId) state.animationId = requestAnimationFrame(render); };
    state.pause = () => { state.paused = true; window.cancelAnimationFrame(state.animationId); state.animationId = null; };
    state.paused = document.hidden;
    state.resume();
  }

  state.resume ||= () => { state.paused = false; };
  state.pause ||= () => { state.paused = true; };
  state.visibilityHandler = () => { state.paused = document.hidden; if (!state.paused) state.resume(); };
  document.addEventListener('visibilitychange', state.visibilityHandler);
  state.dispose = () => { state.pause(); state.resizeObserver?.disconnect(); state.caseStudyObserver?.disconnect(); if (state.caseStudyScrollHandler) windowElement.querySelector('.os-window-body')?.removeEventListener('scroll', state.caseStudyScrollHandler); state.renderer?.dispose(); document.removeEventListener('visibilitychange', state.visibilityHandler); };
  windowElement.projectUniverse = state;
  return content;
};

const windowManager = {
  instances: new Map(),
  activeId: null,
  zIndex: 20,
  nextId: 0,
  isMobile: () => window.matchMedia('(max-width: 700px)').matches,
  focus(id) {
    const instance = this.instances.get(id);
    if (!instance) return;
    this.zIndex += 1;
    instance.element.style.zIndex = this.zIndex;
    instance.element.classList.add('is-active');
    instance.element.focus({ preventScroll: true });
    this.instances.forEach(other => {
      if (other.id !== id) other.element.classList.remove('is-active');
    });
    instance.element.projectUniverse?.resume();
    this.activeId = id;
  },
  create(appId) {
    const definition = appDefinitions[appId];
    const source = definition && document.querySelector(definition.source);
    if (!definition || !source || !windowLayer || !taskbar) return;

    const id = `os-window-${++this.nextId}`;
    const element = document.createElement('article');
    element.className = 'os-window is-opening';
    element.id = id;
    element.tabIndex = -1;
    element.setAttribute('role', 'dialog');
    element.setAttribute('aria-labelledby', `${id}-title`);
    element.style.setProperty('--window-width', `${definition.width}px`);
    element.innerHTML = `
      <header class="os-window-header">
        <div class="os-window-title" id="${id}-title"><span class="window-brand">RAGHAV OS</span><span class="window-divider">/</span><strong>${definition.icon} ${definition.title}</strong></div>
        <div class="os-window-controls">
          <button type="button" class="window-control window-minimize" aria-label="Minimize ${definition.title}">−</button>
          <button type="button" class="window-control window-maximize" aria-label="Maximize ${definition.title}">□</button>
          <button type="button" class="window-control window-close" aria-label="Close ${definition.title}">×</button>
        </div>
      </header>
      <div class="os-window-body"></div>`;

    const body = element.querySelector('.os-window-body');
    const content = source.cloneNode(true);
    content.removeAttribute('id');
    content.classList.add('os-window-source');
    content.hidden = false;
    const physicsCanvas = content.querySelector('#physics-canvas-container');
    if (physicsCanvas) physicsCanvas.id = `${id}-physics-canvas`;
    if (definition.label) {
      const moduleIntro = document.createElement('div');
      moduleIntro.className = 'os-module-intro';
      moduleIntro.innerHTML = `<span class="os-module-label">${definition.label}</span><p>${definition.intro}</p><span class="os-module-state"><i aria-hidden="true"></i> MODULE ONLINE</span>`;
      body.append(moduleIntro);
    }
    body.append(appId === 'projects' ? createProjectUniverse(content, element) : content);

    const task = document.createElement('button');
    task.className = 'os-task';
    task.type = 'button';
    task.innerHTML = `<span aria-hidden="true">${definition.icon}</span><span>${definition.title}</span>`;
    task.setAttribute('aria-label', `Show ${definition.title} window`);
    task.addEventListener('click', () => {
      const instance = this.instances.get(id);
      if (!instance) return;
      instance.element.classList.remove('is-minimized');
      this.focus(id);
      instance.element.projectUniverse?.resume();
    });

    const instance = { id, appId, element, task, drag: null };
    this.instances.set(id, instance);
    windowLayer.append(element);
    taskbar.append(task);
    this.bind(instance);
    this.focus(id);
    window.setTimeout(() => {
      element.classList.remove('is-opening');
      element.style.transform = '';
    }, prefersReducedMotion.matches ? 0 : 30);

    if (appId === 'skills') {
      const clonedPhysics = element.querySelector(`#${id}-physics-canvas`);
      if (clonedPhysics) window.setTimeout(() => initSkillsPhysics(clonedPhysics), 80);
    }
  },
  bind(instance) {
    const { element, id } = instance;
    const header = element.querySelector('.os-window-header');
    element.addEventListener('pointerdown', () => this.focus(id));
    element.querySelector('.window-close').addEventListener('click', event => {
      event.stopPropagation();
      element.projectUniverse?.pause();
      this.close(id);
    });
    element.querySelector('.window-minimize').addEventListener('click', event => {
      event.stopPropagation();
      element.classList.add('is-minimized');
      instance.task.classList.remove('is-active');
      element.projectUniverse?.pause();
    });
    element.querySelector('.window-maximize').addEventListener('click', event => {
      event.stopPropagation();
      element.classList.toggle('is-maximized');
      this.focus(id);
    });
    header.addEventListener('pointerdown', event => {
      if (this.isMobile() || event.target.closest('button') || element.classList.contains('is-maximized')) return;
      const rect = element.getBoundingClientRect();
      instance.drag = { offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top };
      element.classList.add('is-dragging');
      header.setPointerCapture(event.pointerId);
    });
    header.addEventListener('pointermove', event => {
      if (!instance.drag) return;
      element.style.left = `${Math.max(8, event.clientX - instance.drag.offsetX)}px`;
      element.style.top = `${Math.max(66, event.clientY - instance.drag.offsetY)}px`;
      element.style.transform = 'none';
    });
    header.addEventListener('pointerup', () => {
      instance.drag = null;
      element.classList.remove('is-dragging');
    });
    header.addEventListener('keydown', event => {
      if (event.key === 'Enter' && !this.isMobile()) element.classList.toggle('is-maximized');
    });
  },
  close(id) {
    const instance = this.instances.get(id);
    if (!instance) return;
    instance.element.classList.add('is-closing');
    window.setTimeout(() => {
      instance.element.remove();
      instance.element.projectUniverse?.dispose();
      instance.task.remove();
      this.instances.delete(id);
      const next = [...this.instances.values()].pop();
      if (next) this.focus(next.id);
      else this.activeId = null;
    }, prefersReducedMotion.matches ? 0 : 220);
  },
  closeActive() {
    if (this.activeId) this.close(this.activeId);
  }
};

const enterOs = () => {
  if (!bootScreen) return;
  window.clearTimeout(window.raghavBootTimer);
  bootScreen.classList.add('is-complete');
  document.body.classList.add('os-ready');
  window.setTimeout(() => {
    bootScreen.hidden = true;
    osEnvironment?.querySelector('.desktop-icon')?.focus();
  }, prefersReducedMotion.matches ? 0 : 520);
};

const runBootSequence = () => {
  if (!bootScreen || !bootProgressBar || !bootProgressLabel) return;
  const messages = ['Loading personal environment...', 'Loading projects...', 'Loading skills...', 'Loading experience...', 'Loading creativity...'];
  const duration = prefersReducedMotion.matches ? 0 : 1500;
  const startedAt = performance.now();

  const updateBoot = now => {
    const progress = duration === 0 ? 1 : Math.max(0, Math.min(1, (now - startedAt) / duration));
    const messageIndex = Math.min(messages.length - 1, Math.floor(progress * messages.length));
    if (bootLog && bootLog.textContent !== messages[messageIndex]) bootLog.textContent = messages[messageIndex];
    bootProgressBar.style.width = `${Math.round(progress * 100)}%`;
    bootProgressLabel.textContent = `${Math.round(progress * 100)}%`;
    if (progress < 1) window.requestAnimationFrame(updateBoot);
    else {
      bootStatus.textContent = 'SYSTEM READY';
      bootEnter.classList.add('is-ready');
      window.raghavBootTimer = window.setTimeout(enterOs, 350);
    }
  };

  window.requestAnimationFrame(updateBoot);
};

bootEnter?.addEventListener('click', enterOs);
runBootSequence();

const updateClock = () => {
  if (!systemTime) return;
  const now = new Date();
  systemTime.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  systemTime.dateTime = now.toISOString();
};

updateClock();
window.setInterval(updateClock, 30000);

document.querySelectorAll('.desktop-icon').forEach(icon => {
  icon.addEventListener('click', () => {
    const appId = icon.dataset.app;
    if (appDefinitions[appId]) windowManager.create(appId);
    if (desktopPrompt) desktopPrompt.textContent = `${appDefinitions[appId]?.title || appId.toUpperCase()} module initialized.`;
    document.querySelectorAll('.desktop-icon').forEach(item => item.classList.toggle('is-selected', item === icon));
  });
});

archiveToggle?.addEventListener('click', () => {
  if (!legacyPortfolio) return;
  legacyPortfolio.hidden = !legacyPortfolio.hidden;
  archiveToggle.textContent = legacyPortfolio.hidden ? 'OPEN PORTFOLIO ARCHIVE' : 'CLOSE PORTFOLIO ARCHIVE';
  document.body.classList.toggle('archive-open', !legacyPortfolio.hidden);
  if (!legacyPortfolio.hidden) {
    legacyPortfolio.querySelector('.navbar a')?.focus();
    if (!skillsInitialized) initSkillsPhysics();
  }
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    if (bootScreen && !bootScreen.hidden) enterOs();
    if (windowManager.activeId) windowManager.closeActive();
    if (desktopPrompt) desktopPrompt.textContent = 'Select an application to initialize a module.';
    document.querySelectorAll('.desktop-icon').forEach(icon => icon.classList.remove('is-selected'));
  }
});

// Matter.js Physics Animation for Skills Section
const initializedSkillContainers = new WeakSet();
let skillsInitialized = false;
const initSkillsPhysics = (targetContainer = document.getElementById('physics-canvas-container')) => {
  const container = targetContainer;
  if (!container || initializedSkillContainers.has(container) || !window.Matter) return;
  initializedSkillContainers.add(container);
  if (container.id === 'physics-canvas-container') skillsInitialized = true;

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

const animatedSections = [...document.querySelectorAll('section[id]')];
const animatedTargets = '.about-card, .project-card, .timeline-item, .achievement-card, .resume-card, .contact-social-item, .contact-form';
const sectionLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];

animatedSections.forEach(section => {
  section.querySelectorAll(animatedTargets).forEach((element, index) => {
    element.classList.add('reveal-item');
    element.style.transitionDelay = `${Math.min(index * 0.07, 0.35)}s`;
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    entry.target.classList.add('is-visible');
    entry.target.querySelectorAll('.reveal-item').forEach(element => {
      element.classList.add('is-visible');
    });
  });
}, { threshold: 0.16, rootMargin: '-8% 0px -8% 0px' });

const heroSection = document.querySelector('.hero');
heroSection?.classList.add('is-visible');
animatedSections.forEach(section => revealObserver.observe(section));

let sectionJumpTimer;
const playSectionJump = () => {
  document.body.classList.remove('section-jump');
  window.clearTimeout(sectionJumpTimer);
  requestAnimationFrame(() => document.body.classList.add('section-jump'));
  sectionJumpTimer = window.setTimeout(() => document.body.classList.remove('section-jump'), 750);
};

sectionLinks.forEach(link => {
  link.addEventListener('click', () => {
    playSectionJump();
  });
});

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    const activeLink = sectionLinks.find(link => link.getAttribute('href') === `#${entry.target.id}`);
    sectionLinks.forEach(link => link.classList.toggle('active', link === activeLink));
  });
}, { threshold: 0.45, rootMargin: '-12% 0px -45% 0px' });

animatedSections.forEach(section => sectionObserver.observe(section));
