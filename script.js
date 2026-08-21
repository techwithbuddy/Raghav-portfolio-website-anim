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
  core: { title: 'RAGHAV CORE', icon: '🧠', source: '#core', width: 880, label: 'COGNITIVE NEURAL ENGINE', intro: 'Interactive knowledge map and digital brain index.' },
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
  return {
    name,
    description,
    technologies,
    github: card.querySelector('.github-link')?.href || '',
    demo: card.querySelector('.demo-link')?.getAttribute('href') || ''
  };
});

const createDigitalBrain = (source, windowElement) => {
  const container = windowElement.querySelector('.digital-brain-container');
  const canvas = windowElement.querySelector('.brain-canvas');
  const ctx = canvas.getContext('2d');
  const terminalHistory = windowElement.querySelector('.terminal-history');
  const typingText = windowElement.querySelector('.typing-text');
  const questionBtns = windowElement.querySelectorAll('.question-btn');
  const hudLabel = windowElement.querySelector('.brain-hud-label');

  const state = {
    paused: false,
    animationId: null,
    hoveredNode: null,
    selectedNode: null,
    currentOffset: { x: 0, y: 0 },
    targetOffset: { x: 0, y: 0 },
    isTyping: false,
    expandedCategory: null
  };

  // Structured response data
  const ANSWERS = {
    build: "Raghav builds modern, responsive and user-friendly web applications, AI/ML tools, and backend utilities. Highlighted builds:\n\n" +
           "• **AuraSense**: AI/ML accessibility assistant for visually impaired users. Built with Python, featuring custom audio feedback.\n" +
           "• **ShikshaFlow**: Unified EdTech remote learning platform designed to streamline educational workflows.\n" +
           "• **NetProbe**: Concurrent multi-threaded port scanner for security auditing. Built with raw socket programming.\n" +
           "• **GNDU Attendance System**: University management platform with normalized database schemas.",
    skills: "Raghav's strongest skills cover full-stack engineering and systems:\n\n" +
            "• **Languages**: Python, JavaScript, Java, C, C++\n" +
            "• **Web Frontend**: HTML5, CSS3, ES6+ JavaScript, React\n" +
            "• **Backend & Databases**: Data Structures & Algorithms (DSA), OOP, MySQL, Computer Networks\n" +
            "• **Specialized Tools**: Git/GitHub, AI/ML basics, Cybersecurity basics.",
    projects: "Raghav has engineered multiple practical projects:\n\n" +
              "• **AuraSense** — Deployed AI Assistant [Vercel]\n" +
              "• **ShikshaFlow** — EdTech Platform [Vercel]\n" +
              "• **NetProbe** — Multi-threaded Port Scanner [Python/CLI]\n" +
              "• **GNDU Attendance** — University attendance dashboard [Vercel]\n\n" +
              "Click on the PROJECTS nodes or trigger the Projects application to view detailed case-studies.",
    experience: "Raghav's professional involvement and leadership includes:\n\n" +
                "• **Data Science Intern** @ Acmegrade (Aug 2026 - Present) — Data analysis using Python and Pandas.\n" +
                "• **Campus Lead** @ Open Source Connect India (Aug 2026 - Present) — Representing OSCI'26, promoting open-source.\n" +
                "• **Campus Ambassador** @ SmartED Innovations (Aug 2026 - Present) — Full-time project management and community outreach.\n" +
                "• **Open Source Contributor** @ GirlScript Summer of Code (May 2026 - Present) — Frontend developer tasks.",
    hire: "Why hire Raghav?\n\n" +
          "1. **Full-Stack Mastery**: Practical knowledge of Java, Python, JavaScript, and database systems (MySQL).\n" +
          "2. **Proven Commitment**: Active in open source programs (GSSoC, OSCI'26) and student leadership.\n" +
          "3. **Focus on Quality**: Passionate about clean code, performance optimization, and responsive design systems."
  };

  const NODE_ANSWERS = {
    'RAGHAV': "RAGHAV SHARMA — B.Tech Computer Science student, full stack developer, and open-source contributor. Currently learning Kotlin, backend architecture, and MySQL.",
    'PROJECTS': "Featured projects: AuraSense, ShikshaFlow, NetProbe, and GNDU Attendance. Click PROJECTS on your desktop to explore full 3D case studies.",
    'SKILLS': "Proficient in Python, JavaScript, React, Java, MySQL, DSA, OOP, Git, AI/ML, and Cybersecurity.",
    'EXPERIENCE': "Hands-on experience as Data Science Intern @ Acmegrade, Campus Lead @ OSCI'26, and Campus Ambassador @ SmartED.",
    'EDUCATION': "Currently pursuing B.Tech in Computer Science & Engineering. Strong foundations in DSA, Networks, and OOP.",
    'ACHIEVEMENTS': "GSSoC 2026 Contributor badge, OSCI'26 Campus Lead role, SmartPro Java and Web Development certifications.",
    'OPEN SOURCE': "Active contributor at GirlScript Summer of Code 2026 and Open Source Connect India '26 campus lead.",
    'CONTACT': "Connect with Raghav:\n• Email: raghavsharmahhps07@gmail.com\n• LinkedIn: raghavsharma1402\n• GitHub: techwithbuddy"
  };

  // Node structures
  const nodes = [
    { id: 'CORE', label: 'RAGHAV CORE', x: 0, y: 0, radius: 42, color: '#9d4edd', isCore: true, pulsePhase: 0 },
    { id: 'RAGHAV', label: 'IDENTITY', x: -80, y: -110, radius: 22, color: '#b29aff', targetApp: 'about' },
    { id: 'PROJECTS', label: 'PROJECTS', x: 80, y: -110, radius: 22, color: '#62d6ff', targetApp: 'projects' },
    { id: 'SKILLS', label: 'SKILLS', x: 140, y: -20, radius: 22, color: '#f472b6', targetApp: 'skills' },
    { id: 'EXPERIENCE', label: 'EXPERIENCE', x: 90, y: 90, radius: 22, color: '#38bdf8', targetApp: 'experience' },
    { id: 'EDUCATION', label: 'EDUCATION', x: -90, y: 90, radius: 22, color: '#a3e635', targetApp: 'about' },
    { id: 'ACHIEVEMENTS', label: 'ACHIEVEMENTS', x: -140, y: -20, radius: 22, color: '#ffb86b', targetApp: 'achievements' },
    { id: 'OPEN SOURCE', label: 'OPEN SOURCE', x: -20, y: 130, radius: 22, color: '#7ee7c4', targetApp: 'experience' },
    { id: 'CONTACT', label: 'CONTACT', x: 20, y: -140, radius: 22, color: '#f87171', targetApp: 'contact' }
  ];

  // Connections (edges)
  const connections = [
    { from: 'CORE', to: 'RAGHAV' },
    { from: 'CORE', to: 'PROJECTS' },
    { from: 'CORE', to: 'SKILLS' },
    { from: 'CORE', to: 'EXPERIENCE' },
    { from: 'CORE', to: 'EDUCATION' },
    { from: 'CORE', to: 'ACHIEVEMENTS' },
    { from: 'CORE', to: 'OPEN SOURCE' },
    { from: 'CORE', to: 'CONTACT' },
    { from: 'RAGHAV', to: 'PROJECTS' },
    { from: 'PROJECTS', to: 'SKILLS' },
    { from: 'SKILLS', to: 'EXPERIENCE' },
    { from: 'EXPERIENCE', to: 'OPEN SOURCE' },
    { from: 'EDUCATION', to: 'RAGHAV' },
    { from: 'ACHIEVEMENTS', to: 'CORE' }
  ];

  // Subnodes for projects (expandable)
  const subNodes = [
    { parentId: 'PROJECTS', id: 'SUB_AURA', label: 'AuraSense', x: 170, y: -160, radius: 14, color: '#62d6ff', isProject: true, projectIndex: 0 },
    { parentId: 'PROJECTS', id: 'SUB_SHIKSHA', label: 'ShikshaFlow', x: 200, y: -110, radius: 14, color: '#62d6ff', isProject: true, projectIndex: 1 },
    { parentId: 'PROJECTS', id: 'SUB_NETPROBE', label: 'NetProbe', x: 150, y: -70, radius: 14, color: '#62d6ff', isProject: true, projectIndex: 2 }
  ];

  // Pulses traveling down connections
  const pulses = connections.map(conn => ({
    conn,
    progress: Math.random(),
    speed: 0.005 + Math.random() * 0.008
  }));

  // Helper to type text into terminal
  const typeText = (queryLabel, fullText) => {
    if (state.isTyping) return;
    state.isTyping = true;
    questionBtns.forEach(btn => btn.disabled = true);

    // Save previous output to history
    const currentText = typingText.innerHTML;
    if (currentText.trim() && !currentText.includes("Neural interface online")) {
      const historyEntry = document.createElement('div');
      historyEntry.className = 'terminal-history-entry';
      
      const lastQuery = terminalHistory.dataset.lastQuery || 'Command Query';
      historyEntry.innerHTML = `<span class="history-query">&gt; ${lastQuery}</span><span class="history-response">${currentText}</span>`;
      terminalHistory.appendChild(historyEntry);
    }

    terminalHistory.dataset.lastQuery = queryLabel.toUpperCase();
    typingText.innerHTML = '';
    
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullText.length) {
        // If markdown style link or list, translate formatting easily
        let char = fullText[index];
        if (char === '\n') {
          typingText.innerHTML += '<br>';
        } else {
          typingText.innerHTML += char;
        }
        index++;
        // Auto-scroll console output to bottom
        const outputPanel = windowElement.querySelector('.brain-console-output');
        if (outputPanel) outputPanel.scrollTop = outputPanel.scrollHeight;
      } else {
        clearInterval(interval);
        state.isTyping = false;
        questionBtns.forEach(btn => btn.disabled = false);
      }
    }, prefersReducedMotion.matches ? 0 : 15);
  };

  // Click handler for preset questions
  questionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const queryType = btn.dataset.query;
      const answer = ANSWERS[queryType];
      if (answer) {
        // Highlight associated nodes
        if (queryType === 'projects') {
          state.expandedCategory = 'PROJECTS';
          state.targetOffset = { x: -60, y: 60 };
        } else if (queryType === 'skills') {
          state.targetOffset = { x: -100, y: 0 };
        } else if (queryType === 'experience') {
          state.targetOffset = { x: -60, y: -60 };
        } else {
          state.targetOffset = { x: 0, y: 0 };
        }
        typeText(btn.textContent.trim(), answer);
      }
    });
  });

  // Canvas interaction
  const getCanvasCoords = (e) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left - rect.width / 2 - state.currentOffset.x,
      y: e.clientY - rect.top - rect.height / 2 - state.currentOffset.y
    };
  };

  canvas.addEventListener('pointermove', e => {
    const coords = getCanvasCoords(e);
    let found = null;

    // Check subnodes first if expanded
    if (state.expandedCategory === 'PROJECTS') {
      subNodes.forEach(node => {
        if (Math.hypot(node.x - coords.x, node.y - coords.y) < node.radius + 4) {
          found = node;
        }
      });
    }

    // Check main nodes
    if (!found) {
      nodes.forEach(node => {
        if (Math.hypot(node.x - coords.x, node.y - coords.y) < node.radius + 4) {
          found = node;
        }
      });
    }

    state.hoveredNode = found;
    canvas.style.cursor = found ? 'pointer' : 'default';

    if (found) {
      hudLabel.textContent = `${found.label} [NODE_INDEX_ACTIVE]`;
      hudLabel.classList.add('is-visible');
      const r = canvas.getBoundingClientRect();
      hudLabel.style.left = `${e.clientX - r.left + 16}px`;
      hudLabel.style.top = `${e.clientY - r.top - 12}px`;
    } else {
      hudLabel.classList.remove('is-visible');
    }
  });

  canvas.addEventListener('click', e => {
    if (!state.hoveredNode) return;
    const node = state.hoveredNode;
    state.selectedNode = node.id;

    // Move camera focus to clicked node
    state.targetOffset = { x: -node.x * 0.5, y: -node.y * 0.5 };

    if (node.isProject) {
      // Open case study directly
      typeText(`LOAD_PROJECT_${node.label}`, `Navigating neural bridge to project: ${node.label} case-study...`);
      setTimeout(() => {
        windowManager.create('projects');
        // Let PROJECTS window open, then trigger its showProject
        setTimeout(() => {
          const projectWindows = document.querySelectorAll('.os-window');
          projectWindows.forEach(win => {
            if (win.id.includes('projects') && win.projectUniverse) {
              win.projectUniverse.selected = node.projectIndex;
              win.projectUniverse.focusIndex = node.projectIndex;
              const accessBtns = win.querySelectorAll('.access-btn');
              if (accessBtns[node.projectIndex]) accessBtns[node.projectIndex].click();
            }
          });
        }, 300);
      }, 400);
      return;
    }

    if (node.id === 'PROJECTS') {
      state.expandedCategory = (state.expandedCategory === 'PROJECTS') ? null : 'PROJECTS';
    } else {
      state.expandedCategory = null;
    }

    // Type out answers for main category nodes
    const nodeResponse = NODE_ANSWERS[node.id];
    if (nodeResponse) {
      typeText(`INSPECT_NODE_${node.id}`, nodeResponse);
    }

    // Open corresponding window in desktop after a slight delay
    if (node.targetApp) {
      setTimeout(() => {
        windowManager.create(node.targetApp);
      }, 600);
    }
  });

  // Handle Resize
  const resizeCanvas = () => {
    const r = container.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(1, Math.floor(r.width * 0.55)); // canvas takes ~55% of panel
    const h = Math.max(1, Math.floor(r.height));
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.width = Math.floor(canvas.clientWidth * dpr);
    canvas.height = Math.floor(canvas.clientHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  state.resizeObserver = new ResizeObserver(resizeCanvas);
  state.resizeObserver.observe(container);
  setTimeout(resizeCanvas, 80);

  // Render loop
  const render = (time) => {
    if (state.paused) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    // Smooth Camera/Focus translation
    state.currentOffset.x += (state.targetOffset.x - state.currentOffset.x) * 0.08;
    state.currentOffset.y += (state.targetOffset.y - state.currentOffset.y) * 0.08;

    ctx.save();
    ctx.translate(w / 2 + state.currentOffset.x, h / 2 + state.currentOffset.y);

    // Gentle floating offset
    const floatOffset = Math.sin(time * 0.0015) * 4;

    // Draw connecting lines
    connections.forEach(conn => {
      const fromNode = nodes.find(n => n.id === conn.from);
      const toNode = nodes.find(n => n.id === conn.to);
      if (!fromNode || !toNode) return;

      const isHoveredConn = (state.hoveredNode && (state.hoveredNode.id === conn.from || state.hoveredNode.id === conn.to));
      ctx.beginPath();
      ctx.strokeStyle = isHoveredConn ? 'rgba(180, 110, 255, 0.45)' : 'rgba(157, 78, 221, 0.12)';
      ctx.lineWidth = isHoveredConn ? 2 : 1;
      
      const fx = fromNode.x;
      const fy = fromNode.isCore ? fromNode.y + floatOffset : fromNode.y;
      const tx = toNode.x;
      const ty = toNode.isCore ? toNode.y + floatOffset : toNode.y;

      ctx.moveTo(fx, fy);
      ctx.lineTo(tx, ty);
      ctx.stroke();
    });

    // Draw expandable subnode lines
    if (state.expandedCategory === 'PROJECTS') {
      const projectsNode = nodes.find(n => n.id === 'PROJECTS');
      subNodes.forEach(sub => {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(98, 214, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.moveTo(projectsNode.x, projectsNode.y);
        ctx.lineTo(sub.x, sub.y);
        ctx.stroke();
      });
    }

    // Draw connection pulses
    pulses.forEach(pulse => {
      const fromNode = nodes.find(n => n.id === pulse.conn.from);
      const toNode = nodes.find(n => n.id === pulse.conn.to);
      if (!fromNode || !toNode) return;

      if (!prefersReducedMotion.matches) {
        pulse.progress += pulse.speed;
        if (pulse.progress > 1) pulse.progress = 0;
      }

      const fx = fromNode.x;
      const fy = fromNode.isCore ? fromNode.y + floatOffset : fromNode.y;
      const tx = toNode.x;
      const ty = toNode.isCore ? toNode.y + floatOffset : toNode.y;

      const px = fx + (tx - fx) * pulse.progress;
      const py = fy + (ty - fy) * pulse.progress;

      ctx.beginPath();
      ctx.fillStyle = pulse.conn.from === 'CORE' ? '#a855f7' : '#62d6ff';
      ctx.arc(px, py, 2.2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw main nodes
    nodes.forEach(node => {
      const isCore = node.isCore;
      const isSelected = state.selectedNode === node.id;
      const isHovered = state.hoveredNode && state.hoveredNode.id === node.id;
      
      const ny = isCore ? node.y + floatOffset : node.y;
      const radius = isCore ? node.radius + Math.sin(time * 0.002) * 2 : node.radius;

      ctx.save();
      ctx.shadowColor = node.color;
      ctx.shadowBlur = isSelected ? 22 : (isHovered ? 16 : (isCore ? 14 : 5));

      // Node background/fill
      ctx.beginPath();
      ctx.fillStyle = isCore ? 'rgba(15, 8, 38, 0.95)' : 'rgba(4, 6, 15, 0.9)';
      ctx.strokeStyle = isSelected ? '#fff' : node.color;
      ctx.lineWidth = isSelected ? 3 : (isHovered ? 2 : 1.5);
      ctx.arc(node.x, ny, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Core neural graphics
      if (isCore) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(157, 78, 221, 0.3)';
        ctx.arc(node.x, ny, radius - 8, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = 'rgba(157, 78, 221, 0.15)';
        ctx.arc(node.x, ny, radius - 16, 0, Math.PI * 2);
        ctx.fill();
      }

      // Node labels
      ctx.fillStyle = isSelected ? '#fff' : 'rgba(230, 240, 255, 0.88)';
      ctx.font = isCore ? 'bold 10px Outfit, sans-serif' : '500 9px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x, ny);
    });

    // Draw subnodes if active
    if (state.expandedCategory === 'PROJECTS') {
      subNodes.forEach(node => {
        const isHovered = state.hoveredNode && state.hoveredNode.id === node.id;
        ctx.save();
        ctx.shadowColor = node.color;
        ctx.shadowBlur = isHovered ? 14 : 4;
        ctx.beginPath();
        ctx.fillStyle = 'rgba(8, 14, 40, 0.9)';
        ctx.strokeStyle = isHovered ? '#fff' : node.color;
        ctx.lineWidth = isHovered ? 2 : 1.2;
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = 'rgba(230, 240, 255, 0.95)';
        ctx.font = '500 8px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.label, node.x, node.y);
      });
    }

    ctx.restore();

    state.animationId = prefersReducedMotion.matches ? null : requestAnimationFrame(render);
  };

  state.resume = () => {
    if (state.paused || state.animationId) return;
    state.paused = false;
    if (prefersReducedMotion.matches) {
      render(0);
    } else {
      state.animationId = requestAnimationFrame(render);
    }
  };

  state.pause = () => {
    state.paused = true;
    cancelAnimationFrame(state.animationId);
    state.animationId = null;
  };

  state.dispose = () => {
    state.pause();
    state.resizeObserver?.disconnect();
  };

  // Launch initial display greeting
  setTimeout(() => {
    typeText("SYSTEM_INIT", "Neural interface online. RAGHAV CORE cognitive systems calibrated.\n\nAsk a query below or select a node in the graph to inspect portfolio knowledge.");
  }, 100);

  state.resume();
  windowElement.digitalBrain = state;
  return content;
};

const createProjectUniverse = (source, windowElement) => {
  const projects = readProjectData(source);
  const content = document.createElement('div');
  content.className = 'project-universe';
  content.innerHTML = `
    <div class="universe-stage" role="region" aria-label="Interactive project universe">
      <canvas class="universe-canvas" tabindex="0" aria-label="Project galaxy — use Tab to navigate projects by keyboard"></canvas>
      <div class="universe-hud" aria-hidden="true">
        <div class="universe-hud-left">
          <span class="universe-kicker">PROJECT GALAXY / RAGHAV OS</span>
          <h2 class="universe-title">RAGHAV<span class="universe-title-accent"> CORE</span></h2>
          <p class="universe-subtitle">Select a planet to explore a project.</p>
        </div>
        <button class="universe-reset" type="button" aria-label="Reset project universe view">⟳ RESET</button>
      </div>
      <div class="universe-hover-label" aria-hidden="true">
        <span class="hover-label-name"></span>
        <span class="hover-label-hint">CLICK TO EXPLORE</span>
      </div>
      <div class="universe-loading" role="status" aria-live="polite">CALIBRATING ORBITS<span class="loading-dots"></span></div>
    </div>
    <nav class="universe-access-list" aria-label="Project keyboard navigation">
      <span class="access-list-label">PLANETS</span>
    </nav>
    <section class="universe-case-study" hidden aria-live="polite" aria-labelledby="case-study-title">
      <div class="case-study-top">
        <span class="universe-kicker">PROJECT FILE / NODE <span class="case-study-index"></span></span>
        <button class="case-study-close" type="button" aria-label="Close project and return to universe">×</button>
      </div>
      <div class="case-study-heading">
        <div class="case-study-planet-dot" aria-hidden="true"></div>
        <div>
          <p class="case-study-kicker">RAGHAV OS — PROJECT DOCUMENTARY</p>
          <h3 class="case-study-name" id="case-study-title" tabindex="-1"></h3>
          <p class="case-study-description"></p>
        </div>
      </div>
      <div class="case-study-body">
        <div class="case-study-sections"></div>
        <div class="case-study-footer">
          <div class="case-study-footer-group">
            <span class="universe-kicker">TECH STACK</span>
            <div class="case-study-tech"></div>
          </div>
          <div class="case-study-footer-group">
            <span class="universe-kicker">LINKS</span>
            <div class="case-study-links"></div>
          </div>
        </div>
      </div>
      <button class="back-to-universe" type="button">← BACK TO GALAXY</button>
    </section>`;

  const stage = content.querySelector('.universe-stage');
  const uCanvas = content.querySelector('.universe-canvas');
  const panel = content.querySelector('.universe-case-study');
  const accessList = content.querySelector('.universe-access-list');
  const loadingEl = content.querySelector('.universe-loading');
  const hoverLabel = content.querySelector('.universe-hover-label');
  const hoverName = content.querySelector('.hover-label-name');
  const planetDot = content.querySelector('.case-study-planet-dot');

  const PLANET_COLORS = ['#62d6ff', '#b29aff', '#7ee7c4', '#ffb86b'];
  const PLANET_COLORS_HEX = [0x62d6ff, 0xb29aff, 0x7ee7c4, 0xffb86b];

  const PROJECT_META = [
    {
      problem: 'Visually impaired users struggle to interact with digital systems designed only for sighted people.',
      idea: 'Build an AI-powered sensory assistant that bridges the accessibility gap with smart audio feedback and adaptive UI.',
      build: 'Built with Python and AI/ML libraries. Features a custom accessibility layer with real-time audio cues and a high-contrast adaptive interface.',
      challenge: 'Balancing real-time audio performance with AI inference speed without causing noticeable lag for users.',
      solution: 'Optimized the AI pipeline to run inference asynchronously, keeping audio feedback under 120ms response time.',
      result: 'A functional accessibility tool deployed on Vercel — AuraSense — demonstrating human-centered AI design.'
    },
    {
      problem: 'Remote learning suffers from fragmented tools and poor workflow management for both teachers and students.',
      idea: 'A unified EdTech platform that brings lesson delivery, student tracking, and communication into one seamless experience.',
      build: 'Full-stack web application with a modern frontend and backend infrastructure optimized for concurrent classroom use.',
      challenge: 'Designing a UI simple enough for all age groups while packing in enough features to be genuinely useful for educators.',
      solution: 'Iterative UX research with a component-based architecture that allows educators to customize their workflow.',
      result: 'ShikshaFlow went live on Vercel — an end-to-end EdTech platform that simplifies remote education management.'
    },
    {
      problem: 'Security auditors need fast, reliable visibility into open ports and services on networked devices.',
      idea: 'A CLI-based port scanner that delivers fast, accurate results for cybersecurity professionals and students.',
      build: 'Written in Python, using raw socket programming and multi-threaded scanning for maximum speed and accuracy.',
      challenge: 'Handling network timeouts, false positives, and scanning a large port range within acceptable time limits.',
      solution: 'Implemented concurrent socket connections with configurable thread pools and smart timeout management.',
      result: 'NetProbe — a robust open-source port scanner used for learning and cybersecurity auditing tasks.'
    },
    {
      problem: 'University attendance tracking is manual, error-prone, and lacks real-time visibility for faculty and students.',
      idea: 'A digital attendance system that automates tracking, generates analytics, and provides a clean dashboard for all stakeholders.',
      build: 'Web-based management system with a database backend for persistent record storage and a responsive UI for all devices.',
      challenge: 'Ensuring data integrity across concurrent updates while keeping the interface fast and intuitive for faculty.',
      solution: 'Designed a normalised database schema with transaction-safe operations and a lightweight frontend dashboard.',
      result: 'GNDU Attendance System deployed on Vercel — actively used for managing student attendance at the university level.'
    }
  ];

  const state = {
    paused: false,
    animationId: null,
    selected: null,
    focusIndex: null,
    hoveredIndex: null,
    planets: [],
    scene: null, renderer: null, camera: null,
    resizeObserver: null,
    caseStudyScrollHandler: null,
    use3D: false,
    targetCamPos: null,
    idleCamPos: null
  };

  const showProject = (index) => {
    const project = projects[index];
    const meta = PROJECT_META[index] || {};
    if (!project) return;
    state.selected = index;
    state.focusIndex = index;

    panel.querySelector('.case-study-index').textContent = String(index + 1).padStart(2, '0');
    panel.querySelector('.case-study-name').textContent = project.name;
    panel.querySelector('.case-study-description').textContent = project.description;
    planetDot.style.background = PLANET_COLORS[index] || '#62d6ff';
    planetDot.style.boxShadow = `0 0 20px ${PLANET_COLORS[index] || '#62d6ff'}80`;

    const facts = [
      ['01', 'THE PROBLEM', meta.problem || project.description],
      ['02', 'THE IDEA', meta.idea || ''],
      ['03', 'THE BUILD', meta.build || ''],
      ['04', 'THE CHALLENGE', meta.challenge || ''],
      ['05', 'THE SOLUTION', meta.solution || ''],
      ['06', 'THE RESULT', meta.result || '']
    ].filter(([, , text]) => text);

    panel.querySelector('.case-study-sections').innerHTML = facts.map(([num, title, text]) =>
      `<article class="case-study-section">
        <div class="cs-num">${num}</div>
        <div class="cs-body"><h4>${title}</h4><p>${text}</p></div>
      </article>`
    ).join('');

    panel.querySelector('.case-study-tech').innerHTML =
      project.technologies.map(t => `<span class="tech-tag">${t}</span>`).join('');

    const links = [
      project.github ? `<a href="${project.github}" target="_blank" rel="noopener noreferrer" class="cs-link cs-link--github"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>GitHub ↗</a>` : '',
      project.demo && project.demo !== '#' ? `<a href="${project.demo}" target="_blank" rel="noopener noreferrer" class="cs-link cs-link--demo">🌐 Live Demo ↗</a>` : ''
    ].filter(Boolean).join('');
    panel.querySelector('.case-study-links').innerHTML = links;

    const scrollRoot = windowElement.querySelector('.os-window-body');
    if (state.caseStudyScrollHandler) scrollRoot?.removeEventListener('scroll', state.caseStudyScrollHandler);
    const revealSections = () => {
      const rootRect = scrollRoot?.getBoundingClientRect();
      if (!rootRect) return;
      panel.querySelectorAll('.case-study-section').forEach((sec, i) => {
        const r = sec.getBoundingClientRect();
        if (r.top < rootRect.bottom - 16 && r.bottom > rootRect.top + 16) sec.classList.add('is-revealed');
        if (i < 2) sec.classList.add('is-revealed');
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
