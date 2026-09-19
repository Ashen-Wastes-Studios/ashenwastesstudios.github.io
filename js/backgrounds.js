// GALAXY UNIVERSE + EXPLOSIVE + Themed Visuals per Page
(function() {
  const canvas = document.createElement('canvas');
  canvas.id = 'bg-canvas';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');

  let w, h;
  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const mouse = { x: w/2, y: h/2, active: false, down: false };
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; });
  window.addEventListener('mousedown', e => { mouse.down = true; createExplosion(mouse.x, mouse.y); });
  window.addEventListener('mouseup', () => mouse.down = false);
  window.addEventListener('mouseleave', () => mouse.active = false);

  const bgType = document.body.dataset.bg || 'particles';

  // Page-specific themes
  const themes = {
    particles: {
      galaxyCount: 60,
      colors: ['#dc143c', '#ff6b6b', '#ff8e53', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff'],
      spiralArms: [2, 3, 4],
      nebulaColors: ['rgba(220,20,60,0.05)', 'rgba(255,107,107,0.04)', 'rgba(72,219,251,0.03)'],
      neuralNodes: 25,
      particleColors: ['#dc143c', '#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3'],
      coreColor: '#fff'
    },
    neural: {
      galaxyCount: 40,
      colors: ['#dc143c', '#ff4757', '#ff6348', '#ff4757', '#c44569', '#f8b500'],
      spiralArms: [3, 4, 5],
      nebulaColors: ['rgba(220,20,60,0.06)', 'rgba(255,71,87,0.05)', 'rgba(196,69,105,0.04)'],
      neuralNodes: 35,
      particleColors: ['#dc143c', '#ff4757', '#ff6348', '#f8b500'],
      coreColor: '#fff'
    },
    ashen: {
      galaxyCount: 50,
      colors: ['#dc143c', '#ff4757', '#ff6b6b', '#ff8e53', '#feca57', '#48dbfb'],
      spiralArms: [3, 4],
      nebulaColors: ['rgba(220,20,60,0.05)', 'rgba(255,107,107,0.04)', 'rgba(254,202,87,0.03)'],
      neuralNodes: 40,
      particleColors: ['#dc143c', '#ff4757', '#feca57', '#48dbfb'],
      coreColor: '#fff'
    },
    matrix: {
      galaxyCount: 30,
      colors: ['#00ff41', '#39ff14', '#00ff00', '#7fff00', '#adff2f', '#dc143c'],
      spiralArms: [2, 3],
      nebulaColors: ['rgba(0,255,65,0.04)', 'rgba(57,255,20,0.03)', 'rgba(220,20,60,0.03)'],
      neuralNodes: 20,
      particleColors: ['#00ff41', '#39ff14', '#00ff00', '#dc143c'],
      coreColor: '#00ff41'
    },
    wireframe: {
      galaxyCount: 45,
      colors: ['#dc143c', '#ff4757', '#ff6348', '#f8b500', '#48dbfb', '#54a0ff'],
      spiralArms: [4, 5, 6],
      nebulaColors: ['rgba(220,20,60,0.05)', 'rgba(72,219,251,0.04)', 'rgba(84,160,255,0.03)'],
      neuralNodes: 30,
      particleColors: ['#dc143c', '#ff4757', '#48dbfb', '#54a0ff'],
      coreColor: '#fff'
    },
    starfield: {
      galaxyCount: 70,
      colors: ['#dc143c', '#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3'],
      spiralArms: [2, 3, 4, 5],
      nebulaColors: ['rgba(220,20,60,0.05)', 'rgba(255,159,243,0.04)', 'rgba(95,39,205,0.03)', 'rgba(0,210,211,0.03)'],
      neuralNodes: 35,
      particleColors: ['#dc143c', '#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff'],
      coreColor: '#fff'
    },
    wave: {
      galaxyCount: 35,
      colors: ['#dc143c', '#c44569', '#f8b500', '#48dbfb', '#54a0ff', '#5f27cd'],
      spiralArms: [2, 3],
      nebulaColors: ['rgba(220,20,60,0.06)', 'rgba(196,69,105,0.05)', 'rgba(84,160,255,0.04)', 'rgba(95,39,205,0.03)'],
      neuralNodes: 20,
      particleColors: ['#dc143c', '#c44569', '#f8b500', '#48dbfb'],
      coreColor: '#fff'
    }
  };

  const theme = themes[bgType] || themes.particles;

  // Create galaxy clusters
  const galaxies = Array.from({ length: theme.galaxyCount }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    z: Math.random() * 1000 + 200,
    r: Math.random() * 30 + 10,
    color: theme.colors[Math.floor(Math.random() * theme.colors.length)],
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.002,
    spiralArms: theme.spiralArms[Math.floor(Math.random() * theme.spiralArms.length)],
    pulsePhase: Math.random() * Math.PI * 2,
    connections: [],
    active: false
  }));

  // Background stars
  const bgStars = Array.from({ length: 300 }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 1.5 + 0.5,
    twinkle: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.02 + 0.005
  }));

  // Nebula clouds
  const nebulae = Array.from({ length: 8 }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    rx: Math.random() * 200 + 100,
    ry: Math.random() * 150 + 80,
    rotation: Math.random() * Math.PI,
    color: theme.nebulaColors[Math.floor(Math.random() * theme.nebulaColors.length)]
  }));

  // Neural network nodes (subset of galaxies)
  const neuralNodes = galaxies.slice(0, theme.neuralNodes);

  // EXPLOSIVE effects arrays
  const explosions = [];
  const particles = Array.from({ length: 150 }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    r: Math.random() * 3 + 1,
    life: 1,
    decay: Math.random() * 0.01 + 0.005,
    color: theme.particleColors[Math.floor(Math.random() * theme.particleColors.length)]
  }));

  function createExplosion(x, y) {
    explosions.push({ x, y, radius: 0, maxRadius: 200, alpha: 1, color: theme.particleColors[Math.floor(Math.random() * theme.particleColors.length)] });
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: Math.random() * 4 + 2,
        life: 1,
        decay: Math.random() * 0.02 + 0.01,
        color: theme.particleColors[Math.floor(Math.random() * theme.particleColors.length)]
      });
    }
  }

  function drawExplosions() {
    explosions.forEach((e, i) => {
      e.radius += 8;
      e.alpha -= 0.02;
      if (e.alpha <= 0) { explosions.splice(i, 1); return; }
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
      ctx.strokeStyle = e.color;
      ctx.globalAlpha = e.alpha;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = e.color;
      ctx.globalAlpha = e.alpha * 0.3;
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  }

  function drawParticles() {
    particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.life -= p.decay;
      if (p.life <= 0) { particles.splice(i, 1); return; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life * 0.8;
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  }

  function drawNebulae() {
    nebulae.forEach(n => {
      ctx.save();
      ctx.translate(n.x, n.y);
      ctx.rotate(n.rotation);
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, n.rx);
      gradient.addColorStop(0, n.color);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.scale(1, n.ry / n.rx);
      ctx.beginPath();
      ctx.arc(0, 0, n.rx, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  function drawBackgroundStars() {
    bgStars.forEach(s => {
      s.twinkle += s.speed;
      const alpha = 0.2 + Math.sin(s.twinkle) * 0.3;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fill();
    });
  }

  function drawGalaxy(g) {
    const d = Math.sqrt((g.x - mouse.x) ** 2 + (g.y - mouse.y) ** 2);
    const proximity = d < 300 ? Math.max(0, 1 - d / 300) : 0;
    g.pulsePhase += 0.02;
    g.rotation += g.rotSpeed;

    const baseAlpha = 0.3 + Math.sin(g.pulsePhase) * 0.1;
    const alpha = Math.min(1, baseAlpha + proximity * 0.7);

    // Outer glow
    const glowSize = g.r * (2 + proximity * 1.5);
    const gradient = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, glowSize);
    gradient.addColorStop(0, g.color);
    gradient.addColorStop(0.3, g.color.replace('0.8', '0.4').replace('0.6', '0.3').replace('0.5', '0.25').replace('0.4', '0.2').replace('0.3', '0.15'));
    gradient.addColorStop(0.6, 'rgba(150, 50, 200, 0.1)');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(g.x, g.y, glowSize, 0, Math.PI * 2);
    ctx.fill();

    // Spiral arms
    ctx.save();
    ctx.translate(g.x, g.y);
    ctx.rotate(g.rotation);
    for (let arm = 0; arm < g.spiralArms; arm++) {
      const armAngle = (arm / g.spiralArms) * Math.PI * 2;
      for (let i = 0; i < 15; i++) {
        const dist = i * (g.r / 8);
        const angle = armAngle + i * 0.3;
        const sx = Math.cos(angle) * dist;
        const sy = Math.sin(angle) * dist;
        const size = Math.max(1, (15 - i) * 0.5 * (1 + proximity));
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * (1 - i / 15)})`;
        ctx.fill();
      }
    }
    ctx.restore();

    // Core
    ctx.beginPath();
    ctx.arc(g.x, g.y, g.r * (1 + proximity * 0.5), 0, Math.PI * 2);
    ctx.fillStyle = theme.coreColor;
    ctx.globalAlpha = alpha;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawNeuralConnections() {
    for (let i = 0; i < neuralNodes.length; i++) {
      for (let j = i + 1; j < neuralNodes.length; j++) {
        const a = neuralNodes[i];
        const b = neuralNodes[j];
        const dist = Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
        if (dist < 400) {
          const alpha = 0.1 * (1 - dist / 400);
          const d1 = Math.sqrt((a.x - mouse.x) ** 2 + (a.y - mouse.y) ** 2);
          const d2 = Math.sqrt((b.x - mouse.x) ** 2 + (b.y - mouse.y) ** 2);
          const mouseProximity = Math.max(0, 1 - Math.min(d1, d2) / 200);

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(220, 20, 60, ${alpha + mouseProximity * 0.4})`;
          ctx.lineWidth = mouseProximity > 0.3 ? 2 : 0.5;
          ctx.stroke();

          // Pulse traveling along connection
          if (mouseProximity > 0.3) {
            const pulsePos = (Date.now() * 0.001 + i * 0.3) % 1;
            const px = a.x + (b.x - a.x) * pulsePos;
            const py = a.y + (b.y - a.y) * pulsePos;
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
          }
        }
      }
    }
  }

  // ===== PAGE-SPECIFIC VISUAL LAYERS =====

  // AI page — floating data streams
  const dataStreams = Array.from({ length: 20 }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    length: Math.random() * 100 + 50,
    speed: Math.random() * 2 + 1,
    chars: Array.from({ length: 10 }, () => String.fromCharCode(0x30A0 + Math.random() * 96)),
    opacity: Math.random() * 0.3 + 0.1
  }));

  function drawDataStreams() {
    if (bgType !== 'neural' && bgType !== 'ashen') return;
    ctx.font = '12px monospace';
    dataStreams.forEach(s => {
      s.y += s.speed;
      if (s.y > h + 100) { s.y = -100; s.x = Math.random() * w; }
      s.chars.forEach((char, i) => {
        const y = s.y + i * 14;
        if (y > 0 && y < h) {
          const alpha = s.opacity * (1 - i / s.chars.length);
          ctx.fillStyle = `rgba(220, 20, 60, ${alpha})`;
          ctx.fillText(char, s.x, y);
        }
      });
    });
  }

  // Chat page — matrix rain
  const matrixDrops = Array.from({ length: 50 }, () => ({
    x: Math.random() * w,
    y: Math.random() * -h,
    speed: Math.random() * 3 + 2,
    chars: Array.from({ length: 20 }, () => String.fromCharCode(0x30A0 + Math.random() * 96))
  }));

  function drawMatrixRain() {
    if (bgType !== 'matrix') return;
    ctx.font = 'bold 14px monospace';
    matrixDrops.forEach(drop => {
      drop.y += drop.speed;
      if (drop.y > h + 300) { drop.y = -Math.random() * 200; drop.x = Math.random() * w; }
      drop.chars.forEach((char, ci) => {
        const y = drop.y + ci * 14;
        if (y > 0 && y < h) {
          const d = Math.sqrt((drop.x - mouse.x) ** 2 + (y - mouse.y) ** 2);
          const glow = d < 100 ? 0.5 * (1 - d / 100) : 0;
          const alpha = ci === 0 ? 1 : 0.15 * (1 - ci / drop.chars.length);
          ctx.fillStyle = `rgba(0, 255, 65, ${alpha + glow})`;
          ctx.fillText(char, drop.x, y);
          if (ci === 0) { ctx.fillStyle = '#fff'; ctx.fillText(char, drop.x, y); }
        }
      });
    });
  }

  // Gaming/Engine page — 3D wireframe shapes
  const wireframeShapes = Array.from({ length: 5 }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    size: Math.random() * 50 + 30,
    rotX: Math.random() * Math.PI,
    rotY: Math.random() * Math.PI,
    rotZ: Math.random() * Math.PI,
    rotSpeedX: (Math.random() - 0.5) * 0.02,
    rotSpeedY: (Math.random() - 0.5) * 0.02,
    rotSpeedZ: (Math.random() - 0.5) * 0.02,
    type: Math.floor(Math.random() * 3)
  }));

  function drawWireframeShapes() {
    if (bgType !== 'wireframe') return;
    wireframeShapes.forEach(shape => {
      shape.rotX += shape.rotSpeedX;
      shape.rotY += shape.rotSpeedY;
      shape.rotZ += shape.rotSpeedZ;

      const vertices = [];
      if (shape.type === 0) {
        // Cube
        for (let x = -1; x <= 1; x += 2)
          for (let y = -1; y <= 1; y += 2)
            for (let z = -1; z <= 1; z += 2)
              vertices.push({ x: x * shape.size, y: y * shape.size, z: z * shape.size });
      } else if (shape.type === 1) {
        // Pyramid
        vertices.push({ x: 0, y: -shape.size, z: 0 });
        for (let i = 0; i < 4; i++) {
          const angle = (i / 4) * Math.PI * 2;
          vertices.push({ x: Math.cos(angle) * shape.size, y: shape.size, z: Math.sin(angle) * shape.size });
        }
      } else {
        // Octahedron
        vertices.push({ x: shape.size, y: 0, z: 0 }, { x: -shape.size, y: 0, z: 0 });
        vertices.push({ x: 0, y: shape.size, z: 0 }, { x: 0, y: -shape.size, z: 0 });
        vertices.push({ x: 0, y: 0, z: shape.size }, { x: 0, y: 0, z: -shape.size });
      }

      // Rotate and project
      const projected = vertices.map(v => {
        let { x, y, z } = v;
        // Rotate X
        let y1 = y * Math.cos(shape.rotX) - z * Math.sin(shape.rotX);
        let z1 = y * Math.sin(shape.rotX) + z * Math.cos(shape.rotX);
        // Rotate Y
        let x2 = x * Math.cos(shape.rotY) + z1 * Math.sin(shape.rotY);
        let z2 = -x * Math.sin(shape.rotY) + z1 * Math.cos(shape.rotY);
        // Rotate Z
        let x3 = x2 * Math.cos(shape.rotZ) - y1 * Math.sin(shape.rotZ);
        let y3 = x2 * Math.sin(shape.rotZ) + y1 * Math.cos(shape.rotZ);

        const fov = 300;
        const scale = fov / (fov + z2 + 200);
        return { x: shape.x + x3 * scale, y: shape.y + y3 * scale, scale };
      });

      // Draw edges
      ctx.strokeStyle = 'rgba(220, 20, 60, 0.2)';
      ctx.lineWidth = 1;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          ctx.beginPath();
          ctx.moveTo(projected[i].x, projected[i].y);
          ctx.lineTo(projected[j].x, projected[j].y);
          ctx.stroke();
        }
      }

      // Draw vertices
      projected.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3 * p.scale, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(220, 20, 60, 0.4)';
        ctx.fill();
      });
    });
  }

  // Games page — floating game elements
  const gameElements = Array.from({ length: 15 }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 1,
    vy: (Math.random() - 0.5) * 1,
    r: Math.random() * 20 + 10,
    color: theme.colors[Math.floor(Math.random() * theme.colors.length)],
    rotation: 0,
    rotSpeed: (Math.random() - 0.5) * 0.05,
    type: Math.floor(Math.random() * 3)
  }));

  function drawGameElements() {
    if (bgType !== 'starfield') return;
    gameElements.forEach(e => {
      e.x += e.vx;
      e.y += e.vy;
      e.rotation += e.rotSpeed;
      if (e.x < -50) e.x = w + 50;
      if (e.x > w + 50) e.x = -50;
      if (e.y < -50) e.y = h + 50;
      if (e.y > h + 50) e.y = -50;

      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.rotate(e.rotation);

      if (e.type === 0) {
        // Diamond
        ctx.beginPath();
        ctx.moveTo(0, -e.r);
        ctx.lineTo(e.r, 0);
        ctx.lineTo(0, e.r);
        ctx.lineTo(-e.r, 0);
        ctx.closePath();
        ctx.strokeStyle = e.color;
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (e.type === 1) {
        // Triangle
        ctx.beginPath();
        ctx.moveTo(0, -e.r);
        ctx.lineTo(e.r, e.r);
        ctx.lineTo(-e.r, e.r);
        ctx.closePath();
        ctx.strokeStyle = e.color;
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        // Cross
        ctx.beginPath();
        ctx.moveTo(-e.r, 0);
        ctx.lineTo(e.r, 0);
        ctx.moveTo(0, -e.r);
        ctx.lineTo(0, e.r);
        ctx.strokeStyle = e.color;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.restore();
    });
  }

  // Philosophy page — flowing waves
  let waveTime = 0;
  function drawWaves() {
    if (bgType !== 'wave') return;
    waveTime += 0.01;
    for (let layer = 0; layer < 3; layer++) {
      ctx.beginPath();
      for (let x = 0; x <= w; x += 5) {
        const d = Math.sqrt((x - mouse.x) ** 2 + (h * 0.5 + layer * 60 - mouse.y) ** 2);
        const mouseInfluence = d < 200 ? Math.sin(d * 0.05 - waveTime * 2) * 20 * (1 - d / 200) : 0;
        const y = h * 0.5 + layer * 60 + Math.sin(x * 0.003 + waveTime + layer) * 30 + mouseInfluence;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(220, 20, 60, ${0.15 - layer * 0.03})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  function draw() {
    // Deep space background
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, w, h);

    drawNebulae();
    drawBackgroundStars();
    drawNeuralConnections();
    galaxies.forEach(g => drawGalaxy(g));

    // Page-specific visuals on top
    drawDataStreams();
    drawMatrixRain();
    drawWireframeShapes();
    drawGameElements();
    drawWaves();

    // EXPLOSIVE effects on top
    drawParticles();
    drawExplosions();

    requestAnimationFrame(draw);
  }

  draw();

})();
