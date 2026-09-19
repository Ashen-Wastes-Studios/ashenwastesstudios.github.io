// Interactive Backgrounds for Ashen Wastes Studios
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

  const mouse = { x: w / 2, y: h / 2 };
  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  // Get background type from body data attribute
  const bgType = document.body.dataset.bg || 'particles';

  // Color palette
  const accent = '#dc143c';
  const accentDim = 'rgba(220, 20, 60, 0.1)';
  const ink = 'rgba(220, 20, 60, 0.15)';

  // ===== PARTICLES (index, general) =====
  if (bgType === 'particles') {
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2 + 1
    }));

    function draw() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = ink;
        ctx.fill();
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(220, 20, 60, ${0.1 * (1 - dist / 150)})`;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  // ===== NEURAL NETWORK (ai, ashen-gpt) =====
  else if (bgType === 'neural') {
    const nodes = Array.from({ length: 40 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 3 + 1,
      pulse: Math.random() * Math.PI * 2
    }));

    function draw() {
      ctx.clearRect(0, 0, w, h);
      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += 0.02;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;

        const glow = Math.sin(n.pulse) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + glow, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 20, 60, ${0.2 + glow * 0.3})`;
        ctx.fill();
      });

      // Connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(220, 20, 60, ${0.08 * (1 - dist / 180)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  // ===== MATRIX RAIN (chat) =====
  else if (bgType === 'matrix') {
    const fontSize = 14;
    const columns = Math.floor(w / fontSize);
    const drops = Array(columns).fill(1).map(() => Math.random() * -100);
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';

    function draw() {
      ctx.fillStyle = 'rgba(10, 10, 15, 0.05)';
      ctx.fillRect(0, 0, w, h);

      ctx.font = `${fontSize}px monospace`;
      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillStyle = `rgba(220, 20, 60, ${0.1 + Math.random() * 0.1})`;
        ctx.fillText(char, x, y);

        if (y > h && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  // ===== WIREFRAME GRID (gaming-technology, engine-docs) =====
  else if (bgType === 'wireframe') {
    let rotation = 0;
    const gridSize = 50;
    const depth = 20;

    function draw() {
      ctx.clearRect(0, 0, w, h);
      rotation += 0.002;

      const cx = w / 2;
      const cy = h / 2;
      const fov = 300;

      // 3D grid points
      for (let x = -depth; x <= depth; x++) {
        for (let z = -depth; z <= depth; z++) {
          const px = x * gridSize;
          const pz = z * gridSize;
          const py = Math.sin((x + z) * 0.3 + rotation) * 20;

          // Rotate
          const rx = px * Math.cos(rotation) - pz * Math.sin(rotation);
          const rz = px * Math.sin(rotation) + pz * Math.cos(rotation);

          // Project
          const scale = fov / (fov + rz + 200);
          const sx = cx + rx * scale;
          const sy = cy + py * scale;

          if (sx >= 0 && sx <= w && sy >= 0 && sy <= h) {
            ctx.beginPath();
            ctx.arc(sx, sy, 1.5 * scale, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(220, 20, 60, ${0.15 * scale})`;
            ctx.fill();
          }
        }
      }

      // Connect nearby points
      ctx.strokeStyle = 'rgba(220, 20, 60, 0.03)';
      ctx.lineWidth = 0.5;
      for (let x = -depth; x < depth; x++) {
        for (let z = -depth; z < depth; z++) {
          const px1 = x * gridSize;
          const pz1 = z * gridSize;
          const py1 = Math.sin((x + z) * 0.3 + rotation) * 20;
          const px2 = (x + 1) * gridSize;
          const pz2 = pz1;
          const py2 = Math.sin((x + 1 + z) * 0.3 + rotation) * 20;

          const rx1 = px1 * Math.cos(rotation) - pz1 * Math.sin(rotation);
          const rz1 = px1 * Math.sin(rotation) + pz1 * Math.cos(rotation);
          const rx2 = px2 * Math.cos(rotation) - pz2 * Math.sin(rotation);
          const rz2 = px2 * Math.sin(rotation) + pz2 * Math.cos(rotation);

          const scale1 = fov / (fov + rz1 + 200);
          const scale2 = fov / (fov + rz2 + 200);
          const sx1 = cx + rx1 * scale1;
          const sy1 = cy + py1 * scale1;
          const sx2 = cx + rx2 * scale2;
          const sy2 = cy + py2 * scale2;

          ctx.beginPath();
          ctx.moveTo(sx1, sy1);
          ctx.lineTo(sx2, sy2);
          ctx.stroke();
        }
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  // ===== STARFIELD (games) =====
  else if (bgType === 'starfield') {
    const stars = Array.from({ length: 150 }, () => ({
      x: (Math.random() - 0.5) * w * 2,
      y: (Math.random() - 0.5) * h * 2,
      z: Math.random() * 1000,
      pz: 0
    }));
    stars.forEach(s => s.pz = s.z);

    function draw() {
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;

      stars.forEach(s => {
        s.z -= 1.5;
        if (s.z <= 0) {
          s.z = 1000;
          s.x = (Math.random() - 0.5) * w * 2;
          s.y = (Math.random() - 0.5) * h * 2;
          s.pz = s.z;
        }

        const sx = (s.x / s.z) * 300 + cx;
        const sy = (s.y / s.z) * 300 + cy;
        const psx = (s.x / s.pz) * 300 + cx;
        const psy = (s.y / s.pz) * 300 + cy;

        const size = Math.max(0, (1000 - s.z) / 200);
        const alpha = Math.min(1, (1000 - s.z) / 500);

        ctx.beginPath();
        ctx.moveTo(psx, psy);
        ctx.lineTo(sx, sy);
        ctx.strokeStyle = `rgba(220, 20, 60, ${alpha * 0.3})`;
        ctx.lineWidth = size;
        ctx.stroke();

        s.pz = s.z;
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  // ===== WAVE FLOW (philosophy) =====
  else if (bgType === 'wave') {
    let time = 0;

    function draw() {
      ctx.clearRect(0, 0, w, h);
      time += 0.01;

      for (let layer = 0; layer < 3; layer++) {
        ctx.beginPath();
        ctx.moveTo(0, h);

        for (let x = 0; x <= w; x += 5) {
          const y = h * 0.6 +
            Math.sin(x * 0.003 + time + layer * 0.5) * 40 +
            Math.sin(x * 0.007 + time * 1.3 + layer) * 20 +
            layer * 30;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fillStyle = `rgba(220, 20, 60, ${0.02 + layer * 0.01})`;
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

})();
