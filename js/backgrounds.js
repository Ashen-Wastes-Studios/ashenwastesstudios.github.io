// GALAXY UNIVERSE + EXPLOSIVE + Enhanced 3D & Wave Visuals
(function() {
  const canvas = document.createElement('canvas');
  canvas.id = 'bg-canvas';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');

  let w, h;
  function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  const mouse = { x: w/2, y: h/2, active: false, down: false };
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; });
  window.addEventListener('mousedown', e => { mouse.down = true; createExplosion(mouse.x, mouse.y); });
  window.addEventListener('mouseup', () => mouse.down = false);
  window.addEventListener('mouseleave', () => mouse.active = false);

  const bgType = document.body.dataset.bg || 'particles';

  const themes = {
    particles: { galaxyCount: 60, colors: ['#dc143c', '#ff6b6b', '#ff8e53', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff'], spiralArms: [2, 3, 4], neuralNodes: 25, coreColor: '#fff' },
    neural: { galaxyCount: 40, colors: ['#dc143c', '#ff4757', '#ff6348', '#c44569', '#f8b500'], spiralArms: [3, 4, 5], neuralNodes: 35, coreColor: '#fff' },
    ashen: { galaxyCount: 50, colors: ['#dc143c', '#ff4757', '#ff6b6b', '#ff8e53', '#feca57', '#48dbfb'], spiralArms: [3, 4], neuralNodes: 40, coreColor: '#fff' },
    matrix: { galaxyCount: 30, colors: ['#00ff41', '#39ff14', '#00ff00', '#7fff00', '#dc143c'], spiralArms: [2, 3], neuralNodes: 20, coreColor: '#00ff41' },
    wireframe: { galaxyCount: 45, colors: ['#dc143c', '#ff4757', '#ff6348', '#f8b500', '#48dbfb', '#54a0ff'], spiralArms: [4, 5, 6], neuralNodes: 30, coreColor: '#fff' },
    starfield: { galaxyCount: 70, colors: ['#dc143c', '#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3'], spiralArms: [2, 3, 4, 5], neuralNodes: 35, coreColor: '#fff' },
    wave: { galaxyCount: 35, colors: ['#dc143c', '#c44569', '#f8b500', '#48dbfb', '#54a0ff', '#5f27cd'], spiralArms: [2, 3], neuralNodes: 20, coreColor: '#fff' }
  };

  const theme = themes[bgType] || themes.particles;

  const galaxies = Array.from({ length: theme.galaxyCount }, () => ({
    x: Math.random()*w, y: Math.random()*h, r: Math.random()*30+10,
    color: theme.colors[Math.floor(Math.random()*theme.colors.length)],
    rotation: Math.random()*Math.PI*2, rotSpeed: (Math.random()-0.5)*0.002,
    spiralArms: theme.spiralArms[Math.floor(Math.random()*theme.spiralArms.length)],
    pulsePhase: Math.random()*Math.PI*2
  }));

  const bgStars = Array.from({ length: 300 }, () => ({ x: Math.random()*w, y: Math.random()*h, r: Math.random()*1.5+0.5, twinkle: Math.random()*Math.PI*2, speed: Math.random()*0.02+0.005 }));
  const nebulae = Array.from({ length: 8 }, () => ({ x: Math.random()*w, y: Math.random()*h, rx: Math.random()*200+100, ry: Math.random()*150+80, rotation: Math.random()*Math.PI, color: `hsla(${Math.random()*60+320},80%,30%,0.05)` }));
  const neuralNodes = galaxies.slice(0, theme.neuralNodes);

  const explosions = [];
  const particles = Array.from({ length: 150 }, () => ({ x: Math.random()*w, y: Math.random()*h, vx: (Math.random()-0.5)*2, vy: (Math.random()-0.5)*2, r: Math.random()*3+1, life: 1, decay: Math.random()*0.01+0.005, color: theme.colors[Math.floor(Math.random()*theme.colors.length)] }));

  function createExplosion(x, y) {
    explosions.push({ x, y, radius: 0, alpha: 1, color: theme.colors[Math.floor(Math.random()*theme.colors.length)] });
    for (let i = 0; i < 20; i++) {
      const angle = Math.random()*Math.PI*2, speed = Math.random()*5+2;
      particles.push({ x, y, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed, r: Math.random()*4+2, life: 1, decay: Math.random()*0.02+0.01, color: theme.colors[Math.floor(Math.random()*theme.colors.length)] });
    }
  }

  function drawBaseGalaxy() {
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, w, h);
    nebulae.forEach(n => { ctx.save(); ctx.translate(n.x, n.y); ctx.rotate(n.rotation); const g = ctx.createRadialGradient(0,0,0,0,0,n.rx); g.addColorStop(0,n.color); g.addColorStop(1,'transparent'); ctx.fillStyle=g; ctx.scale(1,n.ry/n.rx); ctx.beginPath(); ctx.arc(0,0,n.rx,0,Math.PI*2); ctx.fill(); ctx.restore(); });
    bgStars.forEach(s => { s.twinkle+=s.speed; const a=0.2+Math.sin(s.twinkle)*0.3; ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fillStyle=`rgba(255,255,255,${a})`; ctx.fill(); });
    for (let i=0;i<neuralNodes.length;i++) for (let j=i+1;j<neuralNodes.length;j++) { const a=neuralNodes[i],b=neuralNodes[j],d=Math.sqrt((a.x-b.x)**2+(a.y-b.y)**2); if(d<400) { const al=0.1*(1-d/400),d1=Math.sqrt((a.x-mouse.x)**2+(a.y-mouse.y)**2),d2=Math.sqrt((b.x-mouse.x)**2+(b.y-mouse.y)**2),mp=Math.max(0,1-Math.min(d1,d2)/200); ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.strokeStyle=`rgba(220,20,60,${al+mp*0.4})`; ctx.lineWidth=mp>0.3?2:0.5; ctx.stroke(); if(mp>0.3) { const pp=(Date.now()*0.001+i*0.3)%1,px=a.x+(b.x-a.x)*pp,py=a.y+(b.y-a.y)*pp; ctx.beginPath(); ctx.arc(px,py,3,0,Math.PI*2); ctx.fillStyle='#fff'; ctx.fill(); } } }
    galaxies.forEach(g => { const d=Math.sqrt((g.x-mouse.x)**2+(g.y-mouse.y)**2),pr=d<300?Math.max(0,1-d/300):0; g.pulsePhase+=0.02; g.rotation+=g.rotSpeed; const ba=0.3+Math.sin(g.pulsePhase)*0.1,al=Math.min(1,ba+pr*0.7); const gs=g.r*(2+pr*1.5),gr=ctx.createRadialGradient(g.x,g.y,0,g.x,g.y,gs); gr.addColorStop(0,g.color); gr.addColorStop(0.3,g.color.replace('0.8','0.4').replace('0.6','0.3').replace('0.5','0.25').replace('0.4','0.2').replace('0.3','0.15')); gr.addColorStop(0.6,'rgba(150,50,200,0.1)'); gr.addColorStop(1,'transparent'); ctx.fillStyle=gr; ctx.beginPath(); ctx.arc(g.x,g.y,gs,0,Math.PI*2); ctx.fill(); ctx.save(); ctx.translate(g.x,g.y); ctx.rotate(g.rotation); for(let a=0;a<g.spiralArms;a++) { const aa=(a/g.spiralArms)*Math.PI*2; for(let i=0;i<15;i++) { const dist=i*(g.r/8),ang=aa+i*0.3,sx=Math.cos(ang)*dist,sy=Math.sin(ang)*dist,sz=Math.max(1,(15-i)*0.5*(1+pr)); ctx.beginPath(); ctx.arc(sx,sy,sz,0,Math.PI*2); ctx.fillStyle=`rgba(255,255,255,${al*(1-i/15)})`; ctx.fill(); } } ctx.restore(); ctx.beginPath(); ctx.arc(g.x,g.y,g.r*(1+pr*0.5),0,Math.PI*2); ctx.fillStyle=theme.coreColor; ctx.globalAlpha=al; ctx.fill(); ctx.globalAlpha=1; });
  }

  function drawExplosions() {
    explosions.forEach((e,i) => { e.radius+=8; e.alpha-=0.02; if(e.alpha<=0) { explosions.splice(i,1); return; } ctx.beginPath(); ctx.arc(e.x,e.y,e.radius,0,Math.PI*2); ctx.strokeStyle=e.color; ctx.globalAlpha=e.alpha; ctx.lineWidth=3; ctx.stroke(); ctx.beginPath(); ctx.arc(e.x,e.y,e.radius*0.7,0,Math.PI*2); ctx.fillStyle=e.color; ctx.globalAlpha=e.alpha*0.3; ctx.fill(); ctx.globalAlpha=1; });
    particles.forEach((p,i) => { p.x+=p.vx; p.y+=p.vy; p.vx*=0.98; p.vy*=0.98; p.life-=p.decay; if(p.life<=0) { particles.splice(i,1); return; } ctx.beginPath(); ctx.arc(p.x,p.y,p.r*p.life,0,Math.PI*2); ctx.fillStyle=p.color; ctx.globalAlpha=p.life*0.8; ctx.fill(); ctx.globalAlpha=1; });
  }

  // ===== ENHANCED 3D GAMING/ENGINE VISUALS =====
  let rotX=0, rotY=0;
  const shapes3D = Array.from({ length: 12 }, () => ({
    x: (Math.random()-0.5)*w*2, y: (Math.random()-0.5)*h*2, z: (Math.random()-0.5)*1000,
    size: Math.random()*30+20, rotX: Math.random()*Math.PI, rotY: Math.random()*Math.PI, rotZ: Math.random()*Math.PI,
    rx: (Math.random()-0.5)*0.03, ry: (Math.random()-0.5)*0.03, rz: (Math.random()-0.5)*0.03,
    color: theme.colors[Math.floor(Math.random()*theme.colors.length)], type: Math.floor(Math.random()*5)
  }));

  function draw3DShapes() {
    if (bgType !== 'wireframe' && bgType !== 'starfield') return;
    rotX += 0.003; rotY += 0.005;

    shapes3D.forEach(shape => {
      shape.rotX += shape.rx; shape.rotY += shape.ry; shape.rotZ += shape.rz;
      shape.z += 1;
      if (shape.z > 500) shape.z = -500;

      const fov = 400;
      const scale = fov / (fov + shape.z + 200);
      const sx = w/2 + shape.x * scale;
      const sy = h/2 + shape.y * scale;

      // Generate vertices based on shape type
      let verts = [];
      if (shape.type === 0) {
        // Cube
        for (let x = -1; x <= 1; x += 2) for (let y = -1; y <= 1; y += 2) for (let z = -1; z <= 1; z += 2) verts.push({x: x*shape.size, y: y*shape.size, z: z*shape.size});
      } else if (shape.type === 1) {
        // Tetrahedron
        verts.push({x: 0, y: -shape.size, z: 0});
        for (let i = 0; i < 3; i++) { const a = (i/3)*Math.PI*2; verts.push({x: Math.cos(a)*shape.size, y: shape.size, z: Math.sin(a)*shape.size}); }
      } else if (shape.type === 2) {
        // Octahedron
        verts.push({x: shape.size, y: 0, z: 0}, {x: -shape.size, y: 0, z: 0});
        verts.push({x: 0, y: shape.size, z: 0}, {x: 0, y: -shape.size, z: 0});
        verts.push({x: 0, y: 0, z: shape.size}, {x: 0, y: 0, z: -shape.size});
      } else if (shape.type === 3) {
        // Icosahedron (simplified)
        const phi = (1 + Math.sqrt(5)) / 2;
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2;
          verts.push({x: Math.cos(a)*shape.size, y: Math.sin(a)*shape.size*0.5, z: Math.sin(a)*shape.size*phi*0.5});
        }
      } else {
        // Dodecahedron (simplified - star shape)
        for (let i = 0; i < 20; i++) {
          const a = (i / 20) * Math.PI * 2;
          const r = i % 2 === 0 ? shape.size : shape.size * 0.6;
          verts.push({x: Math.cos(a)*r, y: Math.sin(a)*r, z: (i%3-1)*shape.size*0.5});
        }
      }

      // Rotate and project
      const projected = verts.map(v => {
        let {x, y, z} = v;
        // Rotate X
        let y1 = y*Math.cos(shape.rotX) - z*Math.sin(shape.rotX);
        let z1 = y*Math.sin(shape.rotX) + z*Math.cos(shape.rotX);
        // Rotate Y
        let x2 = x*Math.cos(shape.rotY) + z1*Math.sin(shape.rotY);
        let z2 = -x*Math.sin(shape.rotY) + z1*Math.cos(shape.rotY);
        // Rotate Z
        let x3 = x2*Math.cos(shape.rotZ) - y1*Math.sin(shape.rotZ);
        let y3 = x2*Math.sin(shape.rotZ) + y1*Math.cos(shape.rotZ);
        // Apply global rotation
        let x4 = x3*Math.cos(rotY) - z2*Math.sin(rotY);
        let z4 = x3*Math.sin(rotY) + z2*Math.cos(rotY);
        let y4 = y3*Math.cos(rotX) - z4*Math.sin(rotX);
        let z5 = y3*M.sin(rotX) + z4*Math.cos(rotX);
        const s = fov / (fov + z5 + 300);
        return { x: sx + x4*s, y: sy + y4*s, z: z5, scale: s };
      });

      // Draw edges
      ctx.strokeStyle = shape.color;
      ctx.lineWidth = 1.5 * scale;
      ctx.globalAlpha = 0.3 * scale;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i+1; j < projected.length; j++) {
          ctx.beginPath();
          ctx.moveTo(projected[i].x, projected[i].y);
          ctx.lineTo(projected[j].x, projected[j].y);
          ctx.stroke();
        }
      }

      // Draw vertices
      projected.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3 * p.scale, 0, Math.PI*2);
        ctx.fillStyle = shape.color;
        ctx.globalAlpha = 0.5 * p.scale;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    });
  }

  // Particle systems for games page
  const gameParticles = Array.from({ length: 100 }, () => ({
    x: Math.random()*w, y: Math.random()*h, vx: (Math.random()-0.5)*3, vy: (Math.random()-0.5)*3,
    r: Math.random()*4+1, life: 1, decay: Math.random()*0.02+0.005,
    color: theme.colors[Math.floor(Math.random()*theme.colors.length)]
  }));

  function drawGameParticles() {
    if (bgType !== 'starfield') return;
    gameParticles.forEach((p,i) => {
      p.x += p.vx; p.y += p.vy; p.life -= p.decay;
      if (p.life <= 0 || p.x < -10 || p.x > w+10 || p.y < -10 || p.y > h+10) {
        p.x = Math.random()*w; p.y = Math.random()*h; p.life = 1; p.vx = (Math.random()-0.5)*3; p.vy = (Math.random()-0.5)*3;
      }
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r*p.life, 0, Math.PI*2); ctx.fillStyle = p.color; ctx.globalAlpha = p.life*0.6; ctx.fill(); ctx.globalAlpha = 1;
    });
  }

  // ===== ENHANCED WAVE/PHILOSOPHY VISUALS =====
  let waveTime = 0;
  const waveLayers = Array.from({ length: 8 }, (_, i) => ({
    amp: 40 + i*10, freq: 0.002 + i*0.0005, speed: 0.01 + i*0.005, offset: i*50, color: theme.colors[i % theme.colors.length]
  }));
  const ripples = [];
  window.addEventListener('mousemove', e => { if(Math.random()>0.9) ripples.push({x:e.clientX, y:e.clientY, r:0, maxR:200, alpha:1}); });

  function drawWaves() {
    if (bgType !== 'wave') return;
    waveTime += 0.01;

    waveLayers.forEach(layer => {
      ctx.beginPath();
      for (let x = 0; x <= w; x += 3) {
        const d = Math.sqrt((x-mouse.x)**2 + (h*0.5+layer.offset-mouse.y)**2);
        const mi = d < 300 ? Math.sin(d*0.06 - waveTime*3) * 40 * (1-d/300) : 0;
        const y = h*0.5 + layer.offset + Math.sin(x*layer.freq + waveTime*layer.speed) * layer.amp + mi;
        if (x === 0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.strokeStyle = layer.color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.15;
      ctx.stroke();

      // Glow under wave
      ctx.beginPath();
      for (let x = 0; x <= w; x += 3) {
        const d = Math.sqrt((x-mouse.x)**2 + (h*0.5+layer.offset-mouse.y)**2);
        const mi = d < 300 ? Math.sin(d*0.06 - waveTime*3) * 40 * (1-d/300) : 0;
        const y = h*0.5 + layer.offset + Math.sin(x*layer.freq + waveTime*layer.speed) * layer.amp + mi + 15;
        if (x === 0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.strokeStyle = layer.color;
      ctx.lineWidth = 20;
      ctx.globalAlpha = 0.03;
      ctx.stroke();
    });
    ctx.globalAlpha = 1;

    // Ripples
    ripples.forEach((r,i) => { r.r += 5; r.alpha -= 0.01; if(r.alpha <= 0) { ripples.splice(i,1); return; } ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI*2); ctx.strokeStyle = `rgba(220,20,60,${r.alpha})`; ctx.lineWidth = 2; ctx.stroke(); });
  }

  function draw() {
    drawBaseGalaxy();
    draw3DShapes();
    drawGameParticles();
    drawWaves();
    drawExplosions();
    requestAnimationFrame(draw);
  }

  draw();

})();
