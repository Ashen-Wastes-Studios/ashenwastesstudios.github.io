// GALAXY UNIVERSE Neural Network Visualization
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

  const mouse = { x: w/2, y: h/2, active: false };
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; });
  window.addEventListener('mouseleave', () => mouse.active = false);

  const bgType = document.body.dataset.bg || 'particles';

  // Galaxy colors
  const galaxyColors = [
    'rgba(220, 20, 60, 0.8)',    // Blood red
    'rgba(255, 100, 100, 0.6)',  // Light red
    'rgba(200, 50, 100, 0.5)',   // Pink
    'rgba(150, 50, 200, 0.4)',   // Purple
    'rgba(100, 100, 255, 0.3)',  // Blue
    'rgba(255, 255, 255, 0.9)',  // White hot
  ];

  // Create galaxy clusters (stars/galaxies)
  const galaxyCount = 60;
  const galaxies = Array.from({ length: galaxyCount }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    z: Math.random() * 1000 + 200, // Depth for parallax
    r: Math.random() * 30 + 10,
    color: galaxyColors[Math.floor(Math.random() * galaxyColors.length)],
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.002,
    spiralArms: Math.floor(Math.random() * 3) + 2,
    pulsePhase: Math.random() * Math.PI * 2,
    connections: [],
    active: false
  }));

  // Create background stars
  const bgStars = Array.from({ length: 300 }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 1.5 + 0.5,
    twinkle: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.02 + 0.005
  }));

  // Create nebula clouds
  const nebulae = Array.from({ length: 8 }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    rx: Math.random() * 200 + 100,
    ry: Math.random() * 150 + 80,
    rotation: Math.random() * Math.PI,
    color: `hsla(${Math.random() * 60 + 320}, 80%, 30%, 0.05)`
  }));

  // Neural network nodes (subset of galaxies)
  const neuralNodes = galaxies.slice(0, 25);

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
    gradient.addColorStop(0, `rgba(220, 20, 60, ${alpha * 0.8})`);
    gradient.addColorStop(0.3, `rgba(200, 50, 100, ${alpha * 0.4})`);
    gradient.addColorStop(0.6, `rgba(150, 50, 200, ${alpha * 0.2})`);
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
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fill();
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

  function draw() {
    // Deep space background
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, w, h);

    drawNebulae();
    drawBackgroundStars();
    drawNeuralConnections();
    galaxies.forEach(g => drawGalaxy(g));

    requestAnimationFrame(draw);
  }

  draw();

})();
