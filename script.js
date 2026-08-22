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
  contact: { title: 'CONTACT', icon: '📡', source: '#contact', width: 760, label: 'OPEN CHANNEL MODULE', intro: 'A direct channel for projects, opportunities, and conversation.' },
  terminal: { title: 'TERMINAL', icon: '⌘', source: '#terminal', width: 860, label: 'RAGHAV TERMINAL', intro: 'A safe, simulated command line for exploring this portfolio.' }
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
  // Ensure content is appended before querying sub-elements
  if (!source.parentElement) {
    const tempBody = windowElement.querySelector('.os-window-body') || windowElement;
    tempBody.append(source);
  }
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

  // ── Helpers ──────────────────────────────────────────────────────────────
  // Get all neighbour node IDs for a given nodeId (via connections)
  const getNeighbours = (nodeId) => {
    const neighbours = new Set();
    connections.forEach(conn => {
      if (conn.from === nodeId) neighbours.add(conn.to);
      if (conn.to === nodeId) neighbours.add(conn.from);
    });
    return neighbours;
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
    'RAGHAV': "**RAGHAV SHARMA** — B.Tech Computer Science student, full-stack developer, and open-source contributor.\n\nCurrently mastering **Kotlin**, **backend architecture**, and **MySQL**. Passionate about clean code and building things that matter.",
    'PROJECTS': "**4 live projects** engineered and deployed:\n\n• **AuraSense** — AI accessibility assistant for visually impaired users\n• **ShikshaFlow** — Unified EdTech remote learning platform\n• **NetProbe** — Multi-threaded port scanner for cybersecurity auditing\n• **GNDU Attendance** — University attendance management system\n\nClick any project sub-node to open its full case study.",
    'SKILLS': "**Core Tech Stack:**\n\n• Languages: **Python, JavaScript, Java, C, C++**\n• Web: **HTML5, CSS3, ES6+, React**\n• Backend / DB: **MySQL, DSA, OOP, Computer Networks**\n• Tools: **Git/GitHub, AI/ML, Cybersecurity**\n\nClick SKILLS node to expand skill tree.",
    'EXPERIENCE': "**Professional Experience:**\n\n• **Data Science Intern** @ Acmegrade — Aug 2026 – Present\n• **Campus Lead** @ OSCI'26 — Aug 2026 – Present\n• **Campus Ambassador** @ SmartED Innovations — Aug 2026 – Present\n• **Open Source Contributor** @ GSSoC 2026 — May 2026 – Present\n• **Web Dev & SmartPro Java** @ Aptech Learning — Apr 2023 – Present",
    'EDUCATION': "Currently pursuing **B.Tech Computer Science & Engineering**.\n\nStrong foundations in **Data Structures & Algorithms**, **Computer Networks**, **OOP**, and **Database Management Systems**.",
    'ACHIEVEMENTS': "**Milestones & Certifications:**\n\n🏆 **GSSoC 2026 Contributor Badge** — India's largest open-source program\n🌐 **OSCI'26 Campus Lead** — Prestigious leadership role\n📜 **Web Development Cert** — Aptech Learning (2023)\n☕ **SmartPro Java Cert** — Aptech Learning (2023)\n🚀 **Campus Ambassador** — SmartED Innovations (Full-time)",
    'OPEN SOURCE': "**Active Open-Source Contributions:**\n\n• **GirlScript Summer of Code 2026** — Frontend developer tasks & UI improvements\n• **Open Source Connect India '26** — Campus Lead promoting open-source culture\n• Working on real-world features using **structured Git/GitHub workflows**",
    'CONTACT': "**Connect with Raghav:**\n\n📧 raghavsharmahhps07@gmail.com\n💼 LinkedIn: **raghavsharma1402**\n🐙 GitHub: **techwithbuddy**\n📸 Instagram: **raghavsharma1504**\n\nAlways open to new opportunities and collaborations!"
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
    { parentId: 'PROJECTS', id: 'SUB_AURA', label: 'AuraSense', x: 185, y: -175, radius: 15, color: '#62d6ff', isProject: true, projectIndex: 0 },
    { parentId: 'PROJECTS', id: 'SUB_SHIKSHA', label: 'ShikshaFlow', x: 215, y: -118, radius: 15, color: '#62d6ff', isProject: true, projectIndex: 1 },
    { parentId: 'PROJECTS', id: 'SUB_NETPROBE', label: 'NetProbe', x: 175, y: -68, radius: 15, color: '#62d6ff', isProject: true, projectIndex: 2 },
    { parentId: 'PROJECTS', id: 'SUB_GNDU', label: 'GNDU Attend', x: 130, y: -35, radius: 15, color: '#62d6ff', isProject: true, projectIndex: 3 }
  ];

  // Skill subnodes (shown when SKILLS node selected)
  const skillSubNodes = [
    { parentId: 'SKILLS', id: 'SK_PY', label: 'Python', x: 218, y: 20, radius: 12, color: '#f472b6' },
    { parentId: 'SKILLS', id: 'SK_JS', label: 'JS', x: 228, y: 55, radius: 12, color: '#f472b6' },
    { parentId: 'SKILLS', id: 'SK_JAVA', label: 'Java', x: 205, y: 86, radius: 12, color: '#f472b6' },
    { parentId: 'SKILLS', id: 'SK_DSA', label: 'DSA', x: 175, y: 108, radius: 12, color: '#38bdf8' },
    { parentId: 'SKILLS', id: 'SK_SQL', label: 'MySQL', x: 145, y: 120, radius: 12, color: '#38bdf8' }
  ];

  // Pulses traveling down connections
  const pulses = connections.map(conn => ({
    conn,
    progress: Math.random(),
    speed: 0.005 + Math.random() * 0.008
  }));

  // Helper to render markdown-ish bold text (**text**) as HTML
  const parseMarkdown = (text) => {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#b29aff">$1</strong>')
      .replace(/\n/g, '<br>')
      .replace(/•/g, '<span style="color:#9d4edd">▸</span>');
  };

  // Helper to type text into terminal (character by character, with markdown)
  const typeText = (queryLabel, fullText) => {
    if (state.isTyping) return;
    state.isTyping = true;
    questionBtns.forEach(btn => btn.disabled = true);

    // Save previous output to history
    const currentHTML = typingText.innerHTML;
    if (currentHTML.trim() && !currentHTML.includes('Neural interface online') && !currentHTML.includes('cognitive systems')) {
      const historyEntry = document.createElement('div');
      historyEntry.className = 'terminal-history-entry';
      const lastQuery = terminalHistory.dataset.lastQuery || 'Command Query';
      historyEntry.innerHTML = `<span class="history-query">▸ ${lastQuery}</span><div class="history-response">${currentHTML}</div>`;
      terminalHistory.appendChild(historyEntry);
      // Cap history at 6 entries
      const entries = terminalHistory.querySelectorAll('.terminal-history-entry');
      if (entries.length > 6) entries[0].remove();
    }

    terminalHistory.dataset.lastQuery = queryLabel.toUpperCase();
    typingText.innerHTML = '';

    // Build typed output char-by-char, but flush markdown tags atomically
    const parsed = parseMarkdown(fullText);
    // Convert to array of tokens (plain chars + html tags)
    const tokens = [];
    let i = 0;
    while (i < parsed.length) {
      if (parsed[i] === '<') {
        const end = parsed.indexOf('>', i);
        if (end !== -1) { tokens.push(parsed.slice(i, end + 1)); i = end + 1; continue; }
      }
      tokens.push(parsed[i]);
      i++;
    }

    let idx = 0;
    const outputPanel = windowElement.querySelector('.brain-console-output');
    const interval = setInterval(() => {
      if (idx < tokens.length) {
        // Batch several tokens per tick for speed
        const batchSize = prefersReducedMotion.matches ? tokens.length : 2;
        for (let b = 0; b < batchSize && idx < tokens.length; b++, idx++) {
          typingText.innerHTML += tokens[idx];
        }
        if (outputPanel) outputPanel.scrollTop = outputPanel.scrollHeight;
      } else {
        clearInterval(interval);
        state.isTyping = false;
        questionBtns.forEach(btn => btn.disabled = false);
      }
    }, prefersReducedMotion.matches ? 0 : 18);
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

    // Check project subnodes first
    if (state.expandedCategory === 'PROJECTS') {
      subNodes.forEach(node => {
        if (Math.hypot(node.x - coords.x, node.y - coords.y) < node.radius + 5) found = node;
      });
    }
    // Check skill subnodes
    if (!found && state.expandedCategory === 'SKILLS') {
      skillSubNodes.forEach(node => {
        if (Math.hypot(node.x - coords.x, node.y - coords.y) < node.radius + 5) found = node;
      });
    }
    // Check main nodes
    if (!found) {
      nodes.forEach(node => {
        if (Math.hypot(node.x - coords.x, node.y - coords.y) < node.radius + 5) found = node;
      });
    }

    state.hoveredNode = found;
    canvas.style.cursor = found ? 'pointer' : 'default';

    if (found) {
      const tag = found.isProject ? 'PROJECT NODE' : found.id === 'CORE' ? 'NEURAL CORE' : 'KNOWLEDGE NODE';
      hudLabel.textContent = `${found.label || found.id}  [${tag}]`;
      hudLabel.classList.add('is-visible');
      const r = canvas.getBoundingClientRect();
      hudLabel.style.left = `${Math.min(e.clientX - r.left + 18, r.width - 200)}px`;
      hudLabel.style.top = `${Math.max(e.clientY - r.top - 16, 8)}px`;
    } else {
      hudLabel.classList.remove('is-visible');
    }
  });

  canvas.addEventListener('click', e => {
    if (!state.hoveredNode) return;
    const node = state.hoveredNode;
    state.selectedNode = node.id;

    // Smooth camera pan toward clicked node
    const panStrength = node.isCore ? 0 : 0.45;
    state.targetOffset = { x: -node.x * panStrength, y: -node.y * panStrength };

    if (node.isProject) {
      typeText(`LOAD_PROJECT_${node.label}`, `**NEURAL BRIDGE ACTIVATED**\n\nNavigating to project: **${node.label}**\n\nOpening project universe case study...`);
      setTimeout(() => {
        windowManager.create('projects');
        setTimeout(() => {
          document.querySelectorAll('.os-window').forEach(win => {
            if (win.projectUniverse) {
              const btns = win.querySelectorAll('[class*="access"] button');
              if (btns[node.projectIndex]) btns[node.projectIndex].click();
            }
          });
        }, 350);
      }, 450);
      return;
    }

    // Toggle expanded subnodes
    if (node.id === 'PROJECTS') {
      state.expandedCategory = (state.expandedCategory === 'PROJECTS') ? null : 'PROJECTS';
    } else if (node.id === 'SKILLS') {
      state.expandedCategory = (state.expandedCategory === 'SKILLS') ? null : 'SKILLS';
    } else {
      state.expandedCategory = null;
    }

    // Type out node answers
    const nodeResponse = NODE_ANSWERS[node.id];
    if (nodeResponse) typeText(`INSPECT_NODE_${node.id}`, nodeResponse);

    // Open corresponding OS window
    if (node.targetApp) {
      setTimeout(() => windowManager.create(node.targetApp), 650);
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

    // Precompute hovered neighbours for illumination
    const hoveredNeighbours = state.hoveredNode ? getNeighbours(state.hoveredNode.id) : new Set();
    const selectedNeighbours = state.selectedNode ? getNeighbours(state.selectedNode) : new Set();

    // Draw connecting lines
    connections.forEach(conn => {
      const fromNode = nodes.find(n => n.id === conn.from);
      const toNode = nodes.find(n => n.id === conn.to);
      if (!fromNode || !toNode) return;

      const isHoveredConn = state.hoveredNode && (state.hoveredNode.id === conn.from || state.hoveredNode.id === conn.to);
      const isSelectedConn = state.selectedNode && (state.selectedNode === conn.from || state.selectedNode === conn.to);

      const fx = fromNode.x;
      const fy = fromNode.isCore ? fromNode.y + floatOffset : fromNode.y;
      const tx = toNode.x;
      const ty = toNode.isCore ? toNode.y + floatOffset : toNode.y;

      if (isHoveredConn) {
        // Glowing illuminated edge
        ctx.save();
        ctx.shadowColor = 'rgba(157, 78, 221, 0.9)';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(200, 140, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.moveTo(fx, fy);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        ctx.restore();
      } else if (isSelectedConn) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(157, 78, 221, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.moveTo(fx, fy);
        ctx.lineTo(tx, ty);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(157, 78, 221, 0.09)';
        ctx.lineWidth = 0.8;
        ctx.moveTo(fx, fy);
        ctx.lineTo(tx, ty);
        ctx.stroke();
      }
    });

    // Draw expandable subnode lines — PROJECTS
    if (state.expandedCategory === 'PROJECTS') {
      const projectsNode = nodes.find(n => n.id === 'PROJECTS');
      subNodes.forEach(sub => {
        ctx.save();
        ctx.shadowColor = 'rgba(98, 214, 255, 0.5)';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(98, 214, 255, 0.35)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.moveTo(projectsNode.x, projectsNode.y);
        ctx.lineTo(sub.x, sub.y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      });
    }

    // Draw expandable subnode lines — SKILLS
    if (state.expandedCategory === 'SKILLS') {
      const skillsNode = nodes.find(n => n.id === 'SKILLS');
      skillSubNodes.forEach(sub => {
        ctx.save();
        ctx.shadowColor = 'rgba(244, 114, 182, 0.5)';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(244, 114, 182, 0.35)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.moveTo(skillsNode.x, skillsNode.y);
        ctx.lineTo(sub.x, sub.y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
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
      const isNeighbour = hoveredNeighbours.has(node.id) || selectedNeighbours.has(node.id);

      const ny = isCore ? node.y + floatOffset : node.y;
      const radius = isCore ? node.radius + Math.sin(time * 0.002) * 3 : node.radius;

      // Outer illumination halo for hovered/selected/neighbour nodes
      if (isHovered || isSelected || isNeighbour) {
        const haloAlpha = isHovered ? 0.22 : isSelected ? 0.18 : 0.09;
        const haloRadius = radius + (isHovered ? 14 : isSelected ? 12 : 8);
        const halo = ctx.createRadialGradient(node.x, ny, radius * 0.5, node.x, ny, haloRadius);
        halo.addColorStop(0, `${node.color}${Math.round(haloAlpha * 255).toString(16).padStart(2, '0')}`);
        halo.addColorStop(1, `${node.color}00`);
        ctx.beginPath();
        ctx.fillStyle = halo;
        ctx.arc(node.x, ny, haloRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.save();
      ctx.shadowColor = node.color;
      ctx.shadowBlur = isSelected ? 28 : isHovered ? 20 : isNeighbour ? 14 : (isCore ? 16 : 4);

      // Node background fill
      ctx.beginPath();
      ctx.fillStyle = isCore ? 'rgba(20, 8, 50, 0.97)' : 'rgba(6, 8, 20, 0.92)';
      ctx.strokeStyle = isSelected ? '#fff' : isHovered ? '#fff' : node.color;
      ctx.lineWidth = isSelected ? 2.5 : isHovered ? 2 : isNeighbour ? 1.8 : 1.2;
      ctx.arc(node.x, ny, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Core neural inner graphics
      if (isCore) {
        // Rotating inner rings
        ctx.save();
        ctx.translate(node.x, ny);
        ctx.rotate(time * 0.0004);
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(157, 78, 221, 0.35)';
        ctx.lineWidth = 0.8;
        ctx.arc(0, 0, radius - 8, 0, Math.PI * 1.5);
        ctx.stroke();
        ctx.rotate(-time * 0.0008);
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(98, 214, 255, 0.2)';
        ctx.lineWidth = 0.6;
        ctx.arc(0, 0, radius - 15, 0, Math.PI * 1.0);
        ctx.stroke();
        ctx.restore();

        ctx.beginPath();
        ctx.fillStyle = 'rgba(157, 78, 221, 0.12)';
        ctx.arc(node.x, ny, radius - 18, 0, Math.PI * 2);
        ctx.fill();
      }

      // Node label
      ctx.save();
      if (isHovered || isSelected) {
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 8;
      }
      ctx.fillStyle = isSelected ? '#fff' : isHovered ? '#fff' : isNeighbour ? 'rgba(230,240,255,0.95)' : 'rgba(200,215,255,0.8)';
      ctx.font = isCore ? 'bold 9.5px Outfit, sans-serif' : isHovered || isSelected ? '600 8.5px Outfit, sans-serif' : '500 8px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x, ny);
      ctx.restore();
    });

    // Draw subnodes — helper
    const drawSubnodes = (list) => {
      list.forEach(node => {
        const isHov = state.hoveredNode && state.hoveredNode.id === node.id;
        // Halo
        if (isHov) {
          const halo = ctx.createRadialGradient(node.x, node.y, node.radius * 0.5, node.x, node.y, node.radius + 10);
          halo.addColorStop(0, `${node.color}30`);
          halo.addColorStop(1, `${node.color}00`);
          ctx.beginPath();
          ctx.fillStyle = halo;
          ctx.arc(node.x, node.y, node.radius + 10, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.save();
        ctx.shadowColor = node.color;
        ctx.shadowBlur = isHov ? 16 : 5;
        ctx.beginPath();
        ctx.fillStyle = 'rgba(6, 10, 30, 0.92)';
        ctx.strokeStyle = isHov ? '#fff' : node.color;
        ctx.lineWidth = isHov ? 1.8 : 1;
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        ctx.fillStyle = isHov ? '#fff' : 'rgba(230, 240, 255, 0.9)';
        ctx.font = '500 7.5px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.label, node.x, node.y);
      });
    };
    if (state.expandedCategory === 'PROJECTS') drawSubnodes(subNodes);
    if (state.expandedCategory === 'SKILLS') drawSubnodes(skillSubNodes);

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
    typeText("SYSTEM_INIT", "Neural interface online. **RAGHAV CORE** cognitive systems calibrated.\n\nSelect a node in the graph or run a query below to inspect portfolio knowledge.");
  }, 100);

  state.resume();
  windowElement.digitalBrain = state;
  return source;
};

const createUniverseModule = (appId, source, windowElement) => {
  const PLANET_COLORS = ['#62d6ff', '#b29aff', '#7ee7c4', '#ffb86b', '#a3e635', '#f472b6'];
  const PLANET_COLORS_HEX = [0x62d6ff, 0xb29aff, 0x7ee7c4, 0xffb86b, 0xa3e635, 0xf472b6];

  const readAboutData = source => [...source.querySelectorAll('.about-card')].map(card => {
    const title = card.querySelector('h3')?.textContent.trim() || 'About Topic';
    const icon = card.querySelector('.card-icon')?.textContent.trim() || '👤';
    const text = card.querySelector('p')?.textContent.trim() || '';
    const highlight = card.querySelector('.card-highlight')?.textContent.trim() || '';
    return { title, icon, text, highlight };
  });

  const readExperienceData = source => [...source.querySelectorAll('.timeline-item')].map(item => {
    const role = item.querySelector('h3')?.textContent.trim() || 'Role';
    const date = item.querySelector('.exp-date')?.textContent.trim() || '';
    const company = item.querySelector('.exp-company-row a')?.textContent.trim() || item.querySelector('.exp-company-link')?.textContent.trim() || 'Company';
    const companyUrl = item.querySelector('.exp-company-row a')?.href || item.querySelector('.exp-company-link')?.href || '';
    const companyLogo = item.querySelector('.company-logo')?.src || '';
    const details = [...item.querySelectorAll('.exp-details li')].map(li => li.textContent.trim());
    return { role, date, company, companyUrl, companyLogo, details };
  });

  const readAchievementsData = source => [...source.querySelectorAll('.achievement-card')].map(card => {
    const title = card.querySelector('h3')?.textContent.trim() || 'Achievement';
    const icon = card.querySelector('.achievement-icon')?.textContent.trim() || '🏆';
    const tag = card.querySelector('.achievement-tag')?.textContent.trim() || '';
    const description = card.querySelector('p')?.textContent.trim() || '';
    const year = card.querySelector('.achievement-year')?.textContent.trim() || '';
    return { title, icon, tag, description, year };
  });

  const skillsData = [
    { name: 'Languages', color: '#9d4edd', items: ['C', 'C++', 'Python', 'JavaScript'] },
    { name: 'Web Frontend', color: '#f472b6', items: ['HTML', 'CSS', 'React'] },
    { name: 'Backend & DB', color: '#38bdf8', items: ['DSA', 'OOP', 'MySQL', 'Networks'] },
    { name: 'Tools & Specialized', color: '#a3e635', items: ['Git', 'AI/ML', 'Cybersec'] }
  ];

  const contactData = [
    { name: 'Email', icon: '✉️', color: '#ea4335', value: 'raghavsharmahhps07@gmail.com', url: 'mailto:raghavsharmahhps07@gmail.com' },
    { name: 'LinkedIn', icon: '💼', color: '#0a66c2', value: 'raghavsharma1402', url: 'https://www.linkedin.com/in/raghavsharma1402/' },
    { name: 'GitHub', icon: '🐙', color: '#24292e', value: 'techwithbuddy', url: 'https://github.com/techwithbuddy' },
    { name: 'Instagram', icon: '📸', color: '#fd1d1d', value: 'raghavsharma1504', url: 'https://www.instagram.com/raghavsharma1504/' },
    { name: 'Send Message', icon: '💬', color: '#7ee7c4', isForm: true }
  ];

  let planetItems = [];
  let orbitalText = "RAGHAV SHARMA • B.TECH CSE • DEVELOPER • OPEN SOURCE CONNECT INDIA LEAD •";

  if (appId === 'projects') {
    const rawProjects = readProjectData(source);
    planetItems = rawProjects.map((p, i) => ({
      name: p.name,
      description: p.description,
      color: PLANET_COLORS[i % PLANET_COLORS.length],
      colorHex: PLANET_COLORS_HEX[i % PLANET_COLORS_HEX.length],
      data: p,
      type: 'project'
    }));
  } else if (appId === 'about') {
    const rawAbout = readAboutData(source);
    planetItems = rawAbout.map((a, i) => ({
      name: a.title,
      description: a.text,
      color: PLANET_COLORS[i % PLANET_COLORS.length],
      colorHex: PLANET_COLORS_HEX[i % PLANET_COLORS_HEX.length],
      data: a,
      type: 'about'
    }));
    orbitalText = "RAGHAV SHARMA • ABOUT ME • IDENTITY MODULE • B.TECH CSE STUDENT •";
  } else if (appId === 'skills') {
    planetItems = skillsData.map((s, i) => ({
      name: s.name,
      description: `Core capabilities in ${s.name}`,
      color: s.color,
      colorHex: parseInt(s.color.replace('#', '0x'), 16),
      data: s,
      type: 'skills'
    }));
    orbitalText = "RAGHAV SHARMA • SKILLS MODULE • CAPABILITY MAP • TECH STACK •";
  } else if (appId === 'experience') {
    const rawExp = readExperienceData(source);
    planetItems = rawExp.map((e, i) => ({
      name: e.role,
      description: `${e.company} (${e.date})`,
      color: PLANET_COLORS[i % PLANET_COLORS.length],
      colorHex: PLANET_COLORS_HEX[i % PLANET_COLORS_HEX.length],
      data: e,
      type: 'experience'
    }));
    orbitalText = "RAGHAV SHARMA • EXPERIENCE TIMELINE • FIELD LOG MODULE •";
  } else if (appId === 'achievements') {
    const rawAch = readAchievementsData(source);
    planetItems = rawAch.map((a, i) => ({
      name: a.title,
      description: `${a.tag} (${a.year})`,
      color: PLANET_COLORS[i % PLANET_COLORS.length],
      colorHex: PLANET_COLORS_HEX[i % PLANET_COLORS_HEX.length],
      data: a,
      type: 'achievements'
    }));
    orbitalText = "RAGHAV SHARMA • MILESTONE MODULE • CERTIFICATIONS & HONOURS •";
  } else if (appId === 'resume') {
    planetItems = [
      {
        name: 'Download Resume',
        description: 'Download Raghav\'s complete resume PDF',
        color: '#62d6ff',
        colorHex: 0x62d6ff,
        data: { action: 'download', file: './resume.pdf' },
        type: 'resume'
      },
      {
        name: 'View PDF Document',
        description: 'Open the resume in a new tab for inspection',
        color: '#b29aff',
        colorHex: 0xb29aff,
        data: { action: 'view', file: './resume.pdf' },
        type: 'resume'
      }
    ];
    orbitalText = "RAGHAV SHARMA • RESUME PROFILE • B.TECH CSE • PROFESSIONAL SNAPSHOT •";
  } else if (appId === 'contact') {
    planetItems = contactData.map((c, i) => ({
      name: c.name,
      description: c.value || 'Send an instant email message',
      color: c.color,
      colorHex: parseInt(c.color.replace('#', '0x'), 16),
      data: c,
      type: 'contact'
    }));
    orbitalText = "RAGHAV SHARMA • CONTACT INFO • LET'S CONNECT • OPEN CHANNELS •";
  }

  const definition = appDefinitions[appId] || { title: appId.toUpperCase(), label: 'SYSTEM GALAXY', intro: 'Interactive module details.' };

  const content = document.createElement('div');
  content.className = 'project-universe';
  content.innerHTML = `
    <div class="universe-stage" role="region" aria-label="Interactive module universe">
      <canvas class="universe-canvas" tabindex="0" aria-label="Module galaxy — use Tab to navigate by keyboard"></canvas>
      <div class="universe-hud" aria-hidden="true">
        <div class="universe-hud-left">
          <span class="universe-kicker">${definition.label || 'SYSTEM GALAXY'} / RAGHAV OS</span>
          <h2 class="universe-title">${definition.title.split(' ')[0]}<span class="universe-title-accent">${definition.title.split(' ').slice(1).join(' ') ? ' ' + definition.title.split(' ').slice(1).join(' ') : ''}</span></h2>
          <p class="universe-subtitle">Select a node to explore details.</p>
        </div>
        <button class="universe-reset" type="button" aria-label="Reset universe view">⟳ RESET</button>
      </div>
      <div class="universe-hover-label" aria-hidden="true">
        <span class="hover-label-name"></span>
        <span class="hover-label-hint">CLICK TO EXPLORE</span>
      </div>
      <div class="universe-loading" role="status" aria-live="polite">CALIBRATING ORBITS<span class="loading-dots"></span></div>
    </div>
    <nav class="universe-access-list" aria-label="Keyboard navigation">
      <span class="access-list-label">NODES</span>
    </nav>
    <section class="universe-case-study" hidden aria-live="polite" aria-labelledby="case-study-title">
      <div class="case-study-top">
        <span class="universe-kicker">${definition.title} / NODE <span class="case-study-index"></span></span>
        <button class="case-study-close" type="button" aria-label="Close details">×</button>
      </div>
      <div class="case-study-heading">
        <div class="case-study-planet-dot" aria-hidden="true"></div>
        <div>
          <p class="case-study-kicker">RAGHAV OS — MODULE DOCUMENTARY</p>
          <h3 class="case-study-name" id="case-study-title" tabindex="-1"></h3>
          <p class="case-study-description"></p>
        </div>
      </div>
      <div class="case-study-body">
        <div class="case-study-sections"></div>
        <div class="case-study-footer">
          <div class="case-study-footer-group">
            <span class="universe-kicker">METADATA</span>
            <div class="case-study-tech"></div>
          </div>
          <div class="case-study-footer-group">
            <span class="universe-kicker">ACTIONS / LINKS</span>
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

  const showPlanet = (index) => {
    const item = planetItems[index];
    if (!item) return;
    state.selected = index;
    state.focusIndex = index;

    panel.querySelector('.case-study-index').textContent = String(index + 1).padStart(2, '0');
    panel.querySelector('.case-study-name').textContent = item.name;
    panel.querySelector('.case-study-description').textContent = item.description;
    planetDot.style.background = item.color;
    planetDot.style.boxShadow = `0 0 20px ${item.color}80`;

    let sectionsHtml = '';
    let techTagsHtml = '';
    let linksHtml = '';

    if (appId === 'projects') {
      const p = item.data;
      const meta = PROJECT_META[index] || {};
      const facts = [
        ['01', 'THE PROBLEM', meta.problem || p.description],
        ['02', 'THE IDEA', meta.idea || ''],
        ['03', 'THE BUILD', meta.build || ''],
        ['04', 'THE CHALLENGE', meta.challenge || ''],
        ['05', 'THE SOLUTION', meta.solution || ''],
        ['06', 'THE RESULT', meta.result || '']
      ].filter(([, , text]) => text);

      sectionsHtml = facts.map(([num, title, text]) =>
        `<article class="case-study-section">
          <div class="cs-num">${num}</div>
          <div class="cs-body"><h4>${title}</h4><p>${text}</p></div>
        </article>`
      ).join('');

      techTagsHtml = p.technologies.map(t => `<span class="tech-tag" style="border-color:${item.color}80; color:${item.color}">${t}</span>`).join('');
      linksHtml = [
        p.github ? `<a href="${p.github}" target="_blank" rel="noopener noreferrer" class="cs-link cs-link--github"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>GitHub ↗</a>` : '',
        p.demo && p.demo !== '#' ? `<a href="${p.demo}" target="_blank" rel="noopener noreferrer" class="cs-link cs-link--demo">🌐 Live Demo ↗</a>` : ''
      ].filter(Boolean).join('');

    } else if (appId === 'about') {
      const a = item.data;
      sectionsHtml = `
        <article class="case-study-section">
          <div class="cs-num">${a.icon}</div>
          <div class="cs-body"><h4>SUMMARY</h4><p>${a.text}</p></div>
        </article>
        <article class="case-study-section">
          <div class="cs-num">⚡</div>
          <div class="cs-body"><h4>HIGHLIGHT</h4><p>${a.highlight}</p></div>
        </article>`;
      techTagsHtml = `<span class="tech-tag" style="border-color:${item.color}80; color:${item.color}">Identity</span>`;

    } else if (appId === 'skills') {
      const s = item.data;
      sectionsHtml = `
        <article class="case-study-section">
          <div class="cs-num">🧩</div>
          <div class="cs-body"><h4>${s.name.toUpperCase()}</h4><p>Here are Raghav's skills and languages mapped to this capability node.</p></div>
        </article>`;
      techTagsHtml = s.items.map(skill => `<span class="tech-tag" style="border-color:${item.color}80; color:${item.color}">${skill}</span>`).join('');

    } else if (appId === 'experience') {
      const e = item.data;
      sectionsHtml = `
        <article class="case-study-section">
          <div class="cs-num">💼</div>
          <div class="cs-body">
            <h4>${e.company.toUpperCase()}</h4>
            <p><strong>Role:</strong> ${e.role}</p>
            <p><strong>Timeline:</strong> ${e.date}</p>
          </div>
        </article>
        <article class="case-study-section">
          <div class="cs-num">▸</div>
          <div class="cs-body">
            <h4>KEY RESPONSIBILITIES</h4>
            <ul style="padding-left:1.2rem; margin:0.5rem 0 0; color:#aabbd0; font-size:0.82rem; line-height:1.5;">
              ${e.details.map(bullet => `<li>${bullet}</li>`).join('')}
            </ul>
          </div>
        </article>`;
      techTagsHtml = `<span class="tech-tag" style="border-color:${item.color}80; color:${item.color}">Experience</span>`;
      if (e.companyUrl) {
        linksHtml = `<a href="${e.companyUrl}" target="_blank" rel="noopener noreferrer" class="cs-link cs-link--demo">🌐 Company Page ↗</a>`;
      }

    } else if (appId === 'achievements') {
      const a = item.data;
      sectionsHtml = `
        <article class="case-study-section">
          <div class="cs-num">${a.icon}</div>
          <div class="cs-body">
            <h4>${a.tag.toUpperCase()}</h4>
            <p>${a.description}</p>
            <p><strong>Year achieved:</strong> ${a.year}</p>
          </div>
        </article>`;
      techTagsHtml = `<span class="tech-tag" style="border-color:${item.color}80; color:${item.color}">${a.tag}</span>`;

    } else if (appId === 'resume') {
      sectionsHtml = `
        <article class="case-study-section">
          <div class="cs-num">📄</div>
          <div class="cs-body">
            <h4>RESUME SNAPSHOT</h4>
            <p><strong>Raghav Sharma</strong></p>
            <p>B.Tech Computer Science & Engineering student, full stack developer, and open-source contributor.</p>
            <p>• <strong>Internships/Leadership:</strong> Data Science @ Acmegrade, Campus Ambassador @ SmartED, Campus Lead @ OSCI\'26, GSSoC Contributor.</p>
            <p>• <strong>Live Deployed Projects:</strong> AuraSense, ShikshaFlow, NetProbe, GNDU Attendance.</p>
          </div>
        </article>
        <article class="case-study-section" style="padding:0;">
          <div class="resume-preview" style="height:280px; width:100%; margin-top:15px; border-radius:8px; overflow:hidden; border:1px solid rgba(255,255,255,0.1);">
            <embed src="./resume.pdf#page=1" type="application/pdf" style="width:100%; height:100%; border:none;" />
          </div>
        </article>`;
      techTagsHtml = `
        <span class="tech-tag" style="border-color:${item.color}80; color:${item.color}">B.Tech CSE</span>
        <span class="tech-tag" style="border-color:${item.color}80; color:${item.color}">Resume PDF</span>`;
      linksHtml = `
        <a href="./resume.pdf" download="Raghav_Sharma_Resume.pdf" class="cs-link cs-link--demo">📥 Download PDF</a>
        <a href="./resume.pdf" target="_blank" class="cs-link cs-link--github">👁️ View Fullscreen</a>`;

    } else if (appId === 'contact') {
      const c = item.data;
      if (c.isForm) {
        sectionsHtml = `
          <article class="case-study-section" style="width:100%;">
            <div class="cs-body" style="width:100%;">
              <h4>SEND A DIRECT MESSAGE</h4>
              <p style="margin-bottom: 1.5rem;">Fill out the form below to reach me instantly through Formspree.</p>
              <div class="contact-form-container" style="width:100%;"></div>
            </div>
          </article>`;
        techTagsHtml = `<span class="tech-tag" style="border-color:${item.color}80; color:${item.color}">Message Portal</span>`;
      } else {
        sectionsHtml = `
          <article class="case-study-section">
            <div class="cs-num">${c.icon}</div>
            <div class="cs-body">
              <h4>${c.name.toUpperCase()}</h4>
              <p><strong>Handle/Address:</strong></p>
              <code style="display:block; padding:8px 12px; background:rgba(255,255,255,0.05); border-radius:4px; font-family:monospace; font-size:0.85rem; color:#fff; word-break:break-all;">${c.value}</code>
            </div>
          </article>`;
        techTagsHtml = `<span class="tech-tag" style="border-color:${item.color}80; color:${item.color}">${c.name}</span>`;
        linksHtml = `<a href="${c.url}" target="_blank" rel="noopener noreferrer" class="cs-link cs-link--demo">🌐 Open Link ↗</a>`;
      }
    }

    panel.querySelector('.case-study-sections').innerHTML = sectionsHtml;
    panel.querySelector('.case-study-tech').innerHTML = techTagsHtml;
    panel.querySelector('.case-study-links').innerHTML = linksHtml;

    if (appId === 'contact' && item.data.isForm) {
      const formContainer = panel.querySelector('.contact-form-container');
      if (formContainer) {
        const originalForm = source.querySelector('.contact-form');
        if (originalForm) {
          const formClone = originalForm.cloneNode(true);
          formClone.id = 'cloned-contact-form';
          formContainer.appendChild(formClone);
        }
      }
    }

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

    panel.hidden = false;
    content.classList.add('is-case-study-open');

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

  planetItems.forEach((planet, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'access-btn';
    const colorHex = planet.color;
    button.innerHTML = `<span class="access-orb" style="background:${colorHex};box-shadow:0 0 8px ${colorHex}88" aria-hidden="true"></span><span class="access-name">${planet.name}</span>`;
    button.addEventListener('click', () => showPlanet(index));
    accessList.append(button);
  });

  content.querySelector('.universe-reset').addEventListener('click', closeProject);
  content.querySelector('.case-study-close').addEventListener('click', closeProject);
  content.querySelector('.back-to-universe').addEventListener('click', closeProject);

  const drawBrain2D = (ctx, cx, cy, size, pulse) => {
    ctx.save();
    ctx.shadowColor = '#d946ef';
    ctx.shadowBlur = 18 + pulse * 4;

    // Left Hemisphere
    ctx.beginPath();
    ctx.fillStyle = 'rgba(236, 72, 153, 0.35)';
    ctx.strokeStyle = '#d946ef';
    ctx.lineWidth = 1.8;
    ctx.ellipse(cx - 9, cy - 2, 14, 18, -0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Right Hemisphere
    ctx.beginPath();
    ctx.fillStyle = 'rgba(236, 72, 153, 0.35)';
    ctx.strokeStyle = '#d946ef';
    ctx.lineWidth = 1.8;
    ctx.ellipse(cx + 9, cy - 2, 14, 18, 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cerebellum
    ctx.beginPath();
    ctx.fillStyle = 'rgba(139, 92, 246, 0.35)';
    ctx.strokeStyle = '#a78bfa';
    ctx.lineWidth = 1.5;
    ctx.ellipse(cx, cy + 12, 11, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Central Core Node
    ctx.beginPath();
    ctx.fillStyle = '#62d6ff';
    ctx.shadowColor = '#62d6ff';
    ctx.shadowBlur = 10;
    ctx.arc(cx, cy + 2, 5, 0, Math.PI * 2);
    ctx.fill();

    // Draw neural connection patterns inside the hemispheres
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(cx - 15, cy - 10);
    ctx.lineTo(cx - 8, cy);
    ctx.lineTo(cx, cy - 8);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx + 15, cy - 10);
    ctx.lineTo(cx + 8, cy);
    ctx.lineTo(cx, cy - 8);
    ctx.stroke();

    ctx.restore();
  };

  const fallback = () => {
    stage.classList.add('is-fallback');
    if (loadingEl) loadingEl.textContent = '2D GALAXY ACTIVE';
    const context = uCanvas.getContext('2d');
    state.mapZoom = 1;
    state.targetZoom = 1;
    const points = Array.from({ length: 64 }, () => ({
      x: Math.random(),
      y: Math.random(),
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.5 + 0.2
    }));
    state.planets = planetItems.map((planet, index) => ({
      index,
      angle: (index / planetItems.length) * Math.PI * 2,
      radius: 0.28 + (index % 2) * 0.08,
      speed: 0.00012 + index * 0.00003,
      x: 0,
      y: 0,
      color: planet.color
    }));

    const resize = () => {
      const rect = stage.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      uCanvas.style.width = `${width}px`;
      uCanvas.style.height = `${height}px`;
      uCanvas.width = Math.max(1, Math.floor(width * dpr));
      uCanvas.height = Math.max(1, Math.floor(height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const hitTest = event => {
      const rect = uCanvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const hit = state.planets.find(planet => Math.hypot(planet.x - x, planet.y - y) < 32);
      uCanvas.style.cursor = hit ? 'pointer' : 'default';
      if (hit) {
        hoverName.textContent = planetItems[hit.index].name;
        hoverLabel.classList.add('is-visible');
        hoverLabel.style.left = `${Math.min(x + 16, rect.width - 160)}px`;
        hoverLabel.style.top = `${Math.max(y - 20, 10)}px`;
      } else {
        hoverLabel.classList.remove('is-visible');
      }
      return hit;
    };

    uCanvas.addEventListener('pointermove', hitTest);
    uCanvas.addEventListener('click', event => {
      const hit = hitTest(event);
      if (hit) showPlanet(hit.index);
    });

    state.resizeObserver = new ResizeObserver(resize);
    state.resizeObserver.observe(stage);
    resize();
    window.setTimeout(resize, 100);
    window.setTimeout(resize, 400);

    const render = time => {
      if (state.paused) return;
      const rect = stage.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const centerX = width / 2;
      const centerY = height / 2 + 20;

      state.mapZoom += (state.targetZoom - state.mapZoom) * 0.08;
      context.clearRect(0, 0, width, height);
      context.save();
      context.translate(centerX, centerY);
      context.scale(state.mapZoom, state.mapZoom);
      context.translate(-centerX, -centerY);

      // Starfield
      points.forEach(point => {
        context.beginPath();
        context.fillStyle = `rgba(139, 201, 255, ${point.alpha})`;
        context.arc(point.x * width, point.y * height, point.radius, 0, Math.PI * 2);
        context.fill();
      });

      // Orbit lines
      context.strokeStyle = 'rgba(125, 164, 214, 0.14)';
      context.lineWidth = 1;
      [0.26, 0.36, 0.44].forEach(radius => {
        context.beginPath();
        context.ellipse(centerX, centerY, width * radius, height * radius * 0.45, -0.1, 0, Math.PI * 2);
        context.stroke();
      });

      // Core Brain in 2D
      const corePulse = Math.sin(time * 0.002);
      drawBrain2D(context, centerX, centerY, 32, corePulse);

      // Text Orbit Pill revolving close to core
      const textPillAngle = time * 0.00015;
      const pillX = centerX + Math.cos(textPillAngle) * width * 0.18;
      const pillY = centerY + Math.sin(textPillAngle) * height * 0.18 * 0.45;

      context.save();
      context.fillStyle = 'rgba(157, 78, 221, 0.85)';
      context.strokeStyle = '#d946ef';
      context.lineWidth = 1.2;
      context.shadowColor = '#d946ef';
      context.shadowBlur = 10;
      context.beginPath();

      context.font = '500 8px Outfit, sans-serif';
      const displayVal = "RAGHAV SHARMA • DEV PROFILE";
      const displayW = context.measureText(displayVal).width;
      context.roundRect(pillX - displayW / 2 - 6, pillY - 7, displayW + 12, 14, 7);
      context.fill();
      context.stroke();

      context.fillStyle = '#ffffff';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(displayVal, pillX, pillY);
      context.restore();

      // Orbiting planets
      state.planets.forEach(planet => {
        const angle = planet.angle + time * planet.speed;
        planet.x = centerX + Math.cos(angle) * width * planet.radius;
        planet.y = centerY + Math.sin(angle) * height * planet.radius * 0.45;
        const selected = state.selected === planet.index;
        const size = selected ? 24 : 18;

        context.save();
        context.fillStyle = planet.color;
        context.shadowColor = planet.color;
        context.shadowBlur = selected ? 24 : 12;
        context.beginPath();
        context.arc(planet.x, planet.y, size, 0, Math.PI * 2);
        context.fill();
        context.restore();

        context.fillStyle = '#ffffff';
        context.font = '600 9px Outfit, sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(planetItems[planet.index].name.slice(0, 5), planet.x, planet.y);
      });

      context.restore();
      state.animationId = prefersReducedMotion.matches ? null : requestAnimationFrame(render);
    };

    state.resume = () => {
      if (state.paused || state.animationId) return;
      state.paused = false;
      if (prefersReducedMotion.matches) render(0);
      else state.animationId = requestAnimationFrame(render);
    };
    state.pause = () => {
      state.paused = true;
      window.cancelAnimationFrame(state.animationId);
      state.animationId = null;
    };
    state.paused = document.hidden;
    state.resume();
  };

  const createBrainMesh = (THREE) => {
    const brainGroup = new THREE.Group();

    // Left Hemisphere
    const leftGeo = new THREE.SphereGeometry(0.7, 24, 24);
    leftGeo.scale(0.85, 0.95, 1.25);
    const leftMat = new THREE.MeshStandardMaterial({
      color: 0xec4899,
      emissive: 0xd946ef,
      emissiveIntensity: 0.9,
      wireframe: true,
      transparent: true,
      opacity: 0.6
    });
    const leftHemisphere = new THREE.Mesh(leftGeo, leftMat);
    leftHemisphere.position.set(-0.35, 0.1, 0);
    brainGroup.add(leftHemisphere);

    // Right Hemisphere
    const rightGeo = new THREE.SphereGeometry(0.7, 24, 24);
    rightGeo.scale(0.85, 0.95, 1.25);
    const rightMat = new THREE.MeshStandardMaterial({
      color: 0xec4899,
      emissive: 0xd946ef,
      emissiveIntensity: 0.9,
      wireframe: true,
      transparent: true,
      opacity: 0.6
    });
    const rightHemisphere = new THREE.Mesh(rightGeo, rightMat);
    rightHemisphere.position.set(0.35, 0.1, 0);
    brainGroup.add(rightHemisphere);

    // Cerebellum
    const cerebellumGeo = new THREE.SphereGeometry(0.42, 16, 16);
    cerebellumGeo.scale(1.0, 0.75, 0.85);
    const cerebellumMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      emissive: 0xa78bfa,
      emissiveIntensity: 0.8,
      wireframe: true,
      transparent: true,
      opacity: 0.55
    });
    const cerebellum = new THREE.Mesh(cerebellumGeo, cerebellumMat);
    cerebellum.position.set(0, -0.4, -0.3);
    brainGroup.add(cerebellum);

    // Pineal gland / core stem
    const coreGeo = new THREE.SphereGeometry(0.32, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x62d6ff,
      transparent: true,
      opacity: 0.85
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.set(0, -0.2, 0);
    brainGroup.add(coreMesh);

    // Outer soft glowing aura sphere
    const auraGeo = new THREE.SphereGeometry(1.35, 16, 16);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0xd946ef,
      transparent: true,
      opacity: 0.08
    });
    const auraMesh = new THREE.Mesh(auraGeo, auraMat);
    brainGroup.add(auraMesh);

    return brainGroup;
  };

  const createTextOrbit = (THREE, text) => {
    const textCanvas = document.createElement('canvas');
    textCanvas.width = 1024;
    textCanvas.height = 64;
    const textCtx = textCanvas.getContext('2d');

    textCtx.clearRect(0, 0, 1024, 64);

    textCtx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    textCtx.shadowColor = '#62d6ff';
    textCtx.shadowBlur = 8;
    textCtx.font = 'bold 20px Outfit, sans-serif';
    textCtx.textAlign = 'center';
    textCtx.textBaseline = 'middle';

    const repeatedText = `${text}    ${text}    `;
    textCtx.fillText(repeatedText, 512, 32);

    const textTexture = new THREE.CanvasTexture(textCanvas);
    textTexture.wrapS = THREE.RepeatWrapping;
    textTexture.wrapT = THREE.ClampToEdgeWrapping;

    const textMaterial = new THREE.MeshBasicMaterial({
      map: textTexture,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const textGeometry = new THREE.CylinderGeometry(2.0, 2.0, 0.4, 64, 1, true);
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);

    textMesh.rotation.x = Math.PI / 2.3;
    textMesh.rotation.y = 0.1;

    return textMesh;
  };

  const initThree = () => {
    try {
      const THREE = window.THREE;
      if (!THREE) { fallback(); return; }

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
      camera.position.set(0, 1.5, 11);
      const renderer = new THREE.WebGLRenderer({ canvas: uCanvas, antialias: true, alpha: true, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio || 1));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      state.scene = scene;
      state.camera = camera;
      state.renderer = renderer;
      state.planets = [];
      const universe = new THREE.Group();
      scene.add(universe);
      scene.add(new THREE.AmbientLight(0x8ba9d6, 1.6));

      const pointLight = new THREE.PointLight(0x62d6ff, 2, 20);
      pointLight.position.set(0, 0, 0);
      scene.add(pointLight);

      // Programmatic 3D Brain Core
      const brainMesh = createBrainMesh(THREE);
      universe.add(brainMesh);

      // Rotating Text details orbit
      const textOrbit = createTextOrbit(THREE, orbitalText);
      universe.add(textOrbit);

      const leftH = brainMesh.children[0];
      const rightH = brainMesh.children[1];
      const cereb = brainMesh.children[2];

      const orbitRings = [2.8, 3.6, 4.5].map(radius => {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(radius - 0.008, radius, 96),
          new THREE.MeshBasicMaterial({ color: 0x6d9ad0, transparent: true, opacity: 0.15, side: THREE.DoubleSide })
        );
        ring.rotation.x = Math.PI / 2.3;
        universe.add(ring);
        return ring;
      });

      const particleGeometry = new THREE.BufferGeometry();
      const particlePositions = new Float32Array(200 * 3);
      for (let i = 0; i < particlePositions.length; i += 3) {
        particlePositions[i] = (Math.random() - 0.5) * 18;
        particlePositions[i + 1] = (Math.random() - 0.5) * 12;
        particlePositions[i + 2] = (Math.random() - 0.5) * 12;
      }
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      scene.add(new THREE.Points(particleGeometry, new THREE.PointsMaterial({ color: 0x8bc9ff, size: 0.03, transparent: true, opacity: 0.7 })));

      planetItems.forEach((planet, index) => {
        const angle = (index / planetItems.length) * Math.PI * 2;
        const radius = 2.8 + (index % 2) * 0.8;
        const colorHex = planet.colorHex;
        const pMesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.38 + (index % 2) * 0.08, 24, 24),
          new THREE.MeshStandardMaterial({
            color: colorHex,
            emissive: colorHex,
            emissiveIntensity: 0.35,
            roughness: 0.3,
            metalness: 0.25
          })
        );
        pMesh.userData = { index, angle, radius, speed: 0.12 + index * 0.02, baseScale: pMesh.scale.x };
        pMesh.position.set(Math.cos(angle) * radius, Math.sin(angle * 1.7) * 0.4, Math.sin(angle) * radius * 0.6);
        universe.add(pMesh);
        state.planets.push(pMesh);
      });

      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();

      const selectAt = event => {
        const rect = uCanvas.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(state.planets)[0];
        if (hit) showPlanet(hit.object.userData.index);
      };

      uCanvas.addEventListener('pointermove', event => {
        const rect = uCanvas.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(state.planets)[0];
        uCanvas.style.cursor = hit ? 'pointer' : 'default';
        if (hit) {
          hoverName.textContent = planetItems[hit.object.userData.index].name;
          hoverLabel.classList.add('is-visible');
          hoverLabel.style.left = `${Math.min(event.clientX - rect.left + 16, rect.width - 160)}px`;
          hoverLabel.style.top = `${Math.max(event.clientY - rect.top - 20, 10)}px`;
        } else {
          hoverLabel.classList.remove('is-visible');
        }
        state.planets.forEach(p => {
          p.scale.setScalar(p === hit?.object ? p.userData.baseScale * 1.25 : p.userData.baseScale);
        });
      });

      uCanvas.addEventListener('click', selectAt);

      const resize = () => {
        const rect = stage.getBoundingClientRect();
        const width = Math.max(1, Math.floor(rect.width));
        const height = Math.max(1, Math.floor(rect.height));
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };

      state.resizeObserver = new ResizeObserver(resize);
      state.resizeObserver.observe(stage);
      resize();

      if (loadingEl) loadingEl.textContent = `${definition.title} GALAXY ONLINE`;

      const render = time => {
        if (state.paused) return;
        const seconds = time * 0.001;
        state.planets.forEach(p => {
          const data = p.userData;
          const angle = data.angle + seconds * data.speed;
          p.position.x = Math.cos(angle) * data.radius;
          p.position.z = Math.sin(angle) * data.radius * 0.6;
          p.position.y = Math.sin(angle * 1.7) * 0.4;
        });

        // Rotate Brain Core hemispheres organically
        leftH.rotation.y = seconds * 0.15;
        rightH.rotation.y = -seconds * 0.15;
        cereb.rotation.y = seconds * 0.08;

        // Rotate text orbit cylinder
        textOrbit.rotation.y = -seconds * 0.18;

        orbitRings.forEach((ring, i) => { ring.rotation.z = seconds * (i + 1) * 0.025; });

        const targetPlanet = state.focusIndex === null ? null : state.planets[state.focusIndex];
        const lookTarget = targetPlanet ? targetPlanet.position : new THREE.Vector3(0, 0, 0);
        const desiredCamera = targetPlanet
          ? new THREE.Vector3(targetPlanet.position.x * 0.75, targetPlanet.position.y * 0.75 + 0.35, targetPlanet.position.z + 3.2)
          : new THREE.Vector3(Math.sin(seconds * 0.15) * 0.4, 1.5, 11);

        camera.position.lerp(desiredCamera, targetPlanet ? 0.04 : 0.015);
        camera.lookAt(lookTarget);
        renderer.render(scene, camera);
        state.animationId = requestAnimationFrame(render);
      };

      state.resume = () => {
        if (!state.paused && !state.animationId) state.animationId = requestAnimationFrame(render);
      };
      state.pause = () => {
        state.paused = true;
        window.cancelAnimationFrame(state.animationId);
        state.animationId = null;
      };
      state.paused = document.hidden;
      state.resume();
    } catch (err) {
      console.warn('Three.js init failed, using 2D fallback:', err);
      fallback();
    }
  };

  if (window.THREE && !prefersReducedMotion.matches && !window.matchMedia('(max-width: 700px)').matches) {
    initThree();
  } else if (!prefersReducedMotion.matches && !window.matchMedia('(max-width: 700px)').matches) {
    const onReady = () => {
      window.removeEventListener('three-ready', onReady);
      if (!state.paused && !state.renderer) initThree();
    };
    window.addEventListener('three-ready', onReady);
    window.setTimeout(() => {
      if (!window.THREE && !state.renderer) fallback();
      else if (window.THREE && !state.renderer) initThree();
    }, 500);
  } else {
    fallback();
  }

  state.resume ||= () => { state.paused = false; };
  state.pause ||= () => { state.paused = true; };
  state.visibilityHandler = () => {
    state.paused = document.hidden;
    if (!state.paused) state.resume();
  };
  document.addEventListener('visibilitychange', state.visibilityHandler);
  state.dispose = () => {
    state.pause();
    state.resizeObserver?.disconnect();
    state.caseStudyObserver?.disconnect();
    if (state.caseStudyScrollHandler) windowElement.querySelector('.os-window-body')?.removeEventListener('scroll', state.caseStudyScrollHandler);
    state.renderer?.dispose();
    document.removeEventListener('visibilitychange', state.visibilityHandler);
  };
  windowElement.projectUniverse = state;
  return content;
};

const createRaghavTerminal = (windowElement) => {
  // This terminal is intentionally self-contained: it never evaluates input or accesses the host system.
  const commands = ['help', 'about', 'projects', 'skills', 'experience', 'achievements', 'resume', 'contact', 'github', 'linkedin', 'clear', 'neofetch', 'whoami', 'pwd', 'ls', 'date', 'sudo hire-raghav', 'coffee', 'matrix', 'secret', 'sudo', 'rm -rf /', 'hack'];
  const terminal = document.createElement('section');
  terminal.className = 'raghav-terminal';
  terminal.setAttribute('aria-label', 'Raghav simulated terminal');
  terminal.innerHTML = `
    <div class="raghav-terminal-bar"><span class="terminal-window-dot terminal-window-dot--red"></span><span class="terminal-window-dot terminal-window-dot--yellow"></span><span class="terminal-window-dot terminal-window-dot--green"></span><span>RAGHAV@OS:~$</span><span class="terminal-safe-state">SIMULATION MODE</span></div>
    <div class="raghav-terminal-output" role="log" aria-live="polite" aria-label="Terminal output"></div>
    <form class="raghav-terminal-form" autocomplete="off">
      <label class="raghav-terminal-prompt" for="raghav-terminal-input-${windowElement.id}">RAGHAV@OS:~$</label>
      <input id="raghav-terminal-input-${windowElement.id}" class="raghav-terminal-input" type="text" inputmode="text" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Type a simulated terminal command" placeholder="Type help to see commands" />
      <button type="submit" class="raghav-terminal-run">RUN</button>
    </form>
    <p class="raghav-terminal-hint">↑↓ history · Tab autocomplete · <kbd>Enter</kbd> run · simulated portfolio terminal only</p>`;

  const output = terminal.querySelector('.raghav-terminal-output');
  const form = terminal.querySelector('.raghav-terminal-form');
  const input = terminal.querySelector('.raghav-terminal-input');
  const history = [];
  let historyIndex = 0;

  const print = (text = '', className = '') => {
    const line = document.createElement('pre');
    line.className = `raghav-terminal-line ${className}`.trim();
    line.textContent = text;
    output.append(line);
    output.scrollTop = output.scrollHeight;
    return line;
  };
  const printLink = (label, href) => {
    const line = document.createElement('p');
    line.className = 'raghav-terminal-line terminal-link-line';
    const link = document.createElement('a');
    link.href = href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = label;
    line.append(link);
    output.append(line);
    output.scrollTop = output.scrollHeight;
  };
  const showHelp = () => print(`AVAILABLE COMMANDS\n\nhelp          show this command reference\nabout         profile summary\nprojects      featured project directory\nskills        technical capabilities\nexperience    experience timeline\nachievements  selected milestones\nresume        resume details\ncontact       contact channels\ngithub        open GitHub profile\nlinkedin      open LinkedIn profile\nwhoami        identity details\npwd           current simulated location\nls            list portfolio modules\ndate          local date and time\nneofetch      RAGHAV OS system card\nclear         clear this terminal\n\nFUN COMMANDS\nsudo hire-raghav · coffee · matrix · secret · sudo · rm -rf / · hack`, 'terminal-help');

  const run = rawCommand => {
    const command = rawCommand.trim().toLowerCase().replace(/\s+/g, ' ');
    if (!command) return;
    print(`RAGHAV@OS:~$ ${rawCommand.trim()}`, 'terminal-command');
    if (!history.length || history.at(-1) !== rawCommand.trim()) history.push(rawCommand.trim());
    historyIndex = history.length;

    const results = {
      help: showHelp,
      about: () => print('Raghav Sharma\nB.Tech CSE student and developer focused on clean, useful digital experiences.\nBuilder · problem solver · open-source contributor.'),
      projects: () => print('FEATURED PROJECTS\n• AuraSense — accessibility-focused AI assistance\n• ShikshaFlow — streamlined EdTech platform\n• NetProbe — port scanner\n• GNDU Attendance System — attendance management'),
      skills: () => print('LANGUAGES: C, C++, Python, JavaScript\nWEB: HTML, CSS, React\nFOUNDATIONS: DSA, OOP, MySQL, Networks\nTOOLS: Git, AI/ML, Cybersecurity'),
      experience: () => print('EXPERIENCE LOG\n• Acmegrade — Aug 2026–Present\n• SmartED Innovations — Aug 2026–Present\n• Open Source Connect India — Aug 2026–Present\n• GirlScript Summer of Code — May 2026–Present'),
      achievements: () => print('MILESTONES\n• Open-source and leadership contributions\n• Technical certifications in Java and AI\n• Community and internship recognition'),
      resume: () => { print('RESUME READY\nA PDF profile is available for viewing or download.'); printLink('Open resume.pdf ↗', './resume.pdf'); },
      contact: () => { print('OPEN CHANNELS\nEmail: raghavsharmahhps07@gmail.com\nGitHub: techwithbuddy\nLinkedIn: raghavsharma1402'); },
      github: () => { print('Opening GitHub profile...'); printLink('github.com/techwithbuddy ↗', 'https://github.com/techwithbuddy'); },
      linkedin: () => { print('Opening LinkedIn profile...'); printLink('linkedin.com/in/raghavsharma1402 ↗', 'https://www.linkedin.com/in/raghavsharma1402/'); },
      whoami: () => print('Raghav Sharma\nB.Tech CSE\nDeveloper\nBuilder\nOpen Source Contributor'),
      pwd: () => print('/home/raghav/portfolio  (simulated)'),
      ls: () => print('about/  achievements/  contact/  experience/  projects/  resume.pdf  skills/'),
      date: () => print(new Date().toLocaleString([], { dateStyle: 'full', timeStyle: 'medium' })),
      neofetch: () => print('      RRRR    RAGHAV OS\n     RR  RR   ─────────────\n     RRRR     User: raghav\n     RR RR    Role: Developer / Builder\n     RR  RR   Stack: HTML · CSS · JavaScript\n              Status: Online'),
      coffee: () => print('  ( (\n   ) )   Brewing focus...\n........\n|      |]  Coffee deployed. ☕'),
      matrix: () => print(Array.from({ length: 8 }, () => Array.from({ length: 34 }, () => Math.random() > 0.55 ? '1' : '0').join('')).join('\n'), 'terminal-matrix'),
      secret: () => print('🔐 SECRET UNLOCKED\nThe best interfaces make people feel capable.\nNow go build something memorable.'),
      sudo: () => print('sudo: a portfolio terminal has no superuser privileges. Nice try. 🙂'),
      'rm -rf /': () => print('🛡️ SAFETY SHIELD ACTIVE\nNothing was removed. This is a simulated terminal with no filesystem access.'),
      hack: () => print('Initiating cinematic hacking sequence...\n[▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100%\nAccess granted: you found a harmless easter egg. 😎'),
      'sudo hire-raghav': () => {
        print('Checking permissions...');
        print('████████████████████ 100%', 'terminal-success');
        print('Permission granted.\n\nOpening contact...', 'terminal-success');
        window.setTimeout(() => windowManager.create('contact'), prefersReducedMotion.matches ? 0 : 350);
      }
    };
    if (command === 'clear') {
      output.replaceChildren();
      return;
    }
    (results[command] || (() => print(`command not found: ${rawCommand.trim()}\nType help to view the available simulated commands.`, 'terminal-error')))();
  };

  form.addEventListener('submit', event => { event.preventDefault(); run(input.value); input.value = ''; });
  input.addEventListener('keydown', event => {
    if (event.key === 'ArrowUp') { event.preventDefault(); if (history.length) { historyIndex = Math.max(0, historyIndex - 1); input.value = history[historyIndex]; } }
    if (event.key === 'ArrowDown') { event.preventDefault(); historyIndex = Math.min(history.length, historyIndex + 1); input.value = history[historyIndex] || ''; }
    if (event.key === 'Tab') {
      event.preventDefault();
      const typed = input.value.trim().toLowerCase();
      const matches = commands.filter(item => item.startsWith(typed));
      if (matches.length === 1) input.value = matches[0];
      else if (matches.length > 1) print(matches.join('    '), 'terminal-suggestion');
    }
  });
  terminal.addEventListener('pointerdown', event => { if (event.target === terminal || event.target === output) input.focus(); });
  print('RAGHAV TERMINAL v6.0.0 — SIMULATION MODE\nNo operating-system commands or filesystem access are available.\nType help to explore the portfolio.');
  window.setTimeout(() => input.focus(), prefersReducedMotion.matches ? 0 : 100);
  return terminal;
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
    instance.element.digitalBrain?.resume();
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
    if (appId === 'core') {
      // For RAGHAV CORE, we need to append content first so the brain canvas is in DOM,
      // then wire up the brain logic
      body.append(content);
      createDigitalBrain(content, element);
    } else if (appId === 'terminal') {
      body.append(createRaghavTerminal(element));
    } else {
      body.append(createUniverseModule(appId, content, element));
    }

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
      instance.element.digitalBrain?.resume();
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
      element.digitalBrain?.pause();
      this.close(id);
    });
    element.querySelector('.window-minimize').addEventListener('click', event => {
      event.stopPropagation();
      element.classList.add('is-minimized');
      instance.task.classList.remove('is-active');
      element.projectUniverse?.pause();
      element.digitalBrain?.pause();
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
      instance.element.digitalBrain?.dispose();
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
