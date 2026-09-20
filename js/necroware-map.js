// Necroware Interactive World Map
// Shows corporation territories, nations, and bodies of water

(function() {
  'use strict';

  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Map state
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;
  let isDragging = false;
  let lastMouseX = 0;
  let lastMouseY = 0;
  let hoveredRegion = null;
  let tooltip = null;

  // World regions (simplified political map of Necroware universe)
  const regions = [
    {
      name: 'Ark Corp Territory',
      color: 'rgba(220, 20, 60, 0.3)',
      borderColor: '#dc143c',
      description: 'Ark Corp\'s primary territory. Born from the Russian corporate-state. Controls the largest share of Element Zero deposits.',
      // Simplified polygon (x, y coordinates as percentages)
      polygon: [[15, 20], [35, 15], [45, 25], [50, 40], [40, 50], [25, 45], [15, 35]]
    },
    {
      name: 'X-Technologies Territory',
      color: 'rgba(0, 150, 255, 0.3)',
      borderColor: '#0096ff',
      description: 'X-Technologies\' stronghold. Founded by Dr. Elara Voss and Vex Kael. Competes with Ark Corp in every sector.',
      polygon: [[55, 30], [75, 25], [85, 35], [80, 50], [65, 55], [55, 45]]
    },
    {
      name: 'Ash District',
      color: 'rgba(255, 140, 0, 0.3)',
      borderColor: '#ff8c00',
      description: 'The last free zone. Lawless sprawl of ruins, bunkers, and survivors. Home to 100 million people. Setting of the game.',
      polygon: [[30, 55], [50, 50], [60, 60], [55, 75], [35, 70], [25, 65]]
    },
    {
      name: 'Neo-Kyoto Crater',
      color: 'rgba(128, 0, 128, 0.4)',
      borderColor: '#800080',
      description: 'Ground zero for the Elemental Warp. A mile-wide hole where a city of 40 million used to be. Most contaminated place on Earth.',
      polygon: [[70, 60], [80, 55], [85, 65], [75, 70]]
    },
    {
      name: 'Corporate Plazas',
      color: 'rgba(255, 215, 0, 0.3)',
      borderColor: '#ffd700',
      description: 'Neutral grounds where executives lived in luxury. Mutually assured destruction keeps them pristine.',
      polygon: [[20, 40], [30, 35], [35, 45], [25, 50]]
    },
    {
      name: 'Lower Zones',
      color: 'rgba(100, 100, 100, 0.3)',
      borderColor: '#646464',
      description: 'Dirty, violent, lawless. Where everyone else survived. Corporate wars fought here using proxies and mercenaries.',
      polygon: [[10, 60], [30, 55], [40, 65], [35, 80], [15, 75]]
    },
    {
      name: 'Mars Bunker',
      color: 'rgba(255, 69, 0, 0.3)',
      borderColor: '#ff4500',
      description: 'Hayden Volkov\'s fortress on Mars. Built during the first Clusterfuck. Still operational. Still watching.',
      polygon: [[5, 10], [15, 5], [20, 15], [10, 20]]
    }
  ];

  // Bodies of water
  const waterBodies = [
    {
      name: 'Element Zero Sea',
      color: 'rgba(0, 50, 100, 0.4)',
      polygon: [[45, 70], [60, 65], [70, 75], [60, 85], [45, 80]]
    },
    {
      name: 'Contamination Bay',
      color: 'rgba(50, 0, 50, 0.4)',
      polygon: [[75, 40], [90, 35], [95, 50], [80, 55]]
    }
  ];

  // Cities/Points of interest
  const cities = [
    { name: 'The Spire Ruins', x: 72, y: 62, description: 'X-Technologies former HQ. 200-story tower converted to raw Element Zero.' },
    { name: 'Data Center Omega', x: 48, y: 52, description: 'Destroyed by the player. Ark Corp\'s intelligence network blinded across three continents.' },
    { name: 'MindBridge Facility', x: 38, y: 42, description: 'Where ArkMind was born. Where Dr. Okafor\'s dream died.' },
    { name: 'Lazarus Facility Alpha', x: 28, y: 35, description: 'Primary training facility for Lazarus Initiative soldiers. Location classified.' },
    { name: 'Dead Circuit Hideout', x: 32, y: 58, description: 'Where Dead Circuit was born. Where the resistance began.' },
    { name: 'Smasher\'s Last Known', x: 62, y: 48, description: 'Last confirmed sighting of Smasher before the Hellspawn invasion.' }
  ];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw();
  }

  function drawPolygon(polygon, color, borderColor, lineWidth = 2) {
    if (!polygon || polygon.length < 3) return;
    ctx.beginPath();
    const first = polygon[0];
    ctx.moveTo(first[0] * canvas.width / 100, first[1] * canvas.height / 100);
    for (let i = 1; i < polygon.length; i++) {
      ctx.lineTo(polygon[i][0] * canvas.width / 100, polygon[i][1] * canvas.height / 100);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }

  function drawCity(city, isHovered) {
    const x = city.x * canvas.width / 100;
    const y = city.y * canvas.height / 100;
    const radius = isHovered ? 8 : 5;

    // Glow effect
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 3);
    gradient.addColorStop(0, isHovered ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 200, 100, 0.5)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius * 3, 0, Math.PI * 2);
    ctx.fill();

    // City dot
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = isHovered ? '#ffffff' : '#ffcc00';
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();

    // City name
    ctx.font = isHovered ? 'bold 14px Inter, sans-serif' : '12px Inter, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.fillText(city.name, x, y - radius - 8);
    ctx.shadowBlur = 0;
  }

  function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const gridSize = 50 * scale;

    for (let x = offsetX % gridSize; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = offsetY % gridSize; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }

  function drawBackground() {
    // Dark space background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#050508');
    gradient.addColorStop(0.5, '#0a0a12');
    gradient.addColorStop(1, '#050508');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 100; i++) {
      const x = (i * 137.5) % canvas.width;
      const y = (i * 73.3) % canvas.height;
      const size = (i % 3) + 1;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawGrid();

    // Draw water bodies
    waterBodies.forEach(water => {
      drawPolygon(water.polygon, water.color, 'rgba(100, 150, 200, 0.3)');
    });

    // Draw regions
    regions.forEach(region => {
      const isHovered = hoveredRegion === region.name;
      drawPolygon(region.polygon, region.color, region.borderColor, isHovered ? 4 : 2);
    });

    // Draw cities
    cities.forEach(city => {
      const isHovered = hoveredRegion === city.name;
      drawCity(city, isHovered);
    });

    // Draw tooltip
    if (hoveredRegion) {
      drawTooltip();
    }
  }

  function drawTooltip() {
    const region = [...regions, ...waterBodies, ...cities].find(r => r.name === hoveredRegion);
    if (!region || !region.description) return;

    const padding = 15;
    const maxWidth = 300;
    ctx.font = '14px Inter, sans-serif';
    const words = region.description.split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    if (currentLine) lines.push(currentLine);

    const lineHeight = 20;
    const tooltipWidth = maxWidth + padding * 2;
    const tooltipHeight = lines.length * lineHeight + padding * 2 + 30;

    // Position tooltip near mouse but keep on screen
    let tooltipX = lastMouseX + 20;
    let tooltipY = lastMouseY + 20;
    if (tooltipX + tooltipWidth > canvas.width) tooltipX = lastMouseX - tooltipWidth - 20;
    if (tooltipY + tooltipHeight > canvas.height) tooltipY = lastMouseY - tooltipHeight - 20;

    // Tooltip background
    ctx.fillStyle = 'rgba(10, 10, 20, 0.95)';
    ctx.strokeStyle = region.borderColor || '#dc143c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 4);
    ctx.fill();
    ctx.stroke();

    // Tooltip title
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillStyle = region.borderColor || '#ffffff';
    ctx.textAlign = 'left';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.fillText(region.name, tooltipX + padding, tooltipY + padding + 15);
    ctx.shadowBlur = 0;

    // Tooltip description
    ctx.font = '14px Inter, sans-serif';
    ctx.fillStyle = '#e0e0e8';
    lines.forEach((line, i) => {
      ctx.fillText(line, tooltipX + padding, tooltipY + padding + 40 + i * lineHeight);
    });
  }

  function isPointInPolygon(x, y, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0] * canvas.width / 100;
      const yi = polygon[i][1] * canvas.height / 100;
      const xj = polygon[j][0] * canvas.width / 100;
      const yj = polygon[j][1] * canvas.height / 100;

      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    return inside;
  }

  function getRegionAtPoint(x, y) {
    // Check cities first (higher priority)
    for (const city of cities) {
      const cx = city.x * canvas.width / 100;
      const cy = city.y * canvas.height / 100;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (dist < 15) return city.name;
    }

    // Check regions
    for (const region of regions) {
      if (isPointInPolygon(x, y, region.polygon)) {
        return region.name;
      }
    }

    // Check water bodies
    for (const water of waterBodies) {
      if (isPointInPolygon(x, y, water.polygon)) {
        return water.name;
      }
    }

    return null;
  }

  // Event handlers
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDragging) {
      offsetX += x - lastMouseX;
      offsetY += y - lastMouseY;
      lastMouseX = x;
      lastMouseY = y;
      draw();
      return;
    }

    lastMouseX = x;
    lastMouseY = y;

    const newHovered = getRegionAtPoint(x, y);
    if (newHovered !== hoveredRegion) {
      hoveredRegion = newHovered;
      canvas.style.cursor = hoveredRegion ? 'pointer' : 'default';
      draw();
    }
  });

  canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
      isDragging = true;
      lastMouseX = e.clientX - canvas.getBoundingClientRect().left;
      lastMouseY = e.clientY - canvas.getBoundingClientRect().top;
      canvas.style.cursor = 'grabbing';
    }
  });

  canvas.addEventListener('mouseup', () => {
    isDragging = false;
    canvas.style.cursor = hoveredRegion ? 'pointer' : 'default';
  });

  canvas.addEventListener('mouseleave', () => {
    isDragging = false;
    hoveredRegion = null;
    canvas.style.cursor = 'default';
    draw();
  });

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomIntensity = 0.1;
    const wheel = e.deltaY < 0 ? 1 : -1;
    const zoom = Math.exp(wheel * zoomIntensity);

    // Zoom toward mouse position
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newScale = Math.max(0.5, Math.min(5, scale * zoom));
    const scaleChange = newScale / scale;

    offsetX = mouseX - (mouseX - offsetX) * scaleChange;
    offsetY = mouseY - (mouseY - offsetY) * scaleChange;
    scale = newScale;

    draw();
  }, { passive: false });

  // Touch support
  let lastTouchDistance = 0;
  let lastTouchCenter = { x: 0, y: 0 };

  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      lastMouseX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
      lastMouseY = e.touches[0].clientY - canvas.getBoundingClientRect().top;
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDistance = Math.sqrt(dx * dx + dy * dy);
      lastTouchCenter = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2
      };
    }
  });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (e.touches.length === 1 && isDragging) {
      const x = e.touches[0].clientX - canvas.getBoundingClientRect().left;
      const y = e.touches[0].clientY - canvas.getBoundingClientRect().top;
      offsetX += x - lastMouseX;
      offsetY += y - lastMouseY;
      lastMouseX = x;
      lastMouseY = y;
      draw();
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const zoom = distance / lastTouchDistance;
      scale = Math.max(0.5, Math.min(5, scale * zoom));
      lastTouchDistance = distance;
      draw();
    }
  }, { passive: false });

  canvas.addEventListener('touchend', () => {
    isDragging = false;
  });

  // Initialize
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Expose API
  window.necrowareMap = {
    reset: () => {
      scale = 1;
      offsetX = 0;
      offsetY = 0;
      draw();
    },
    zoomTo: (regionName) => {
      const region = regions.find(r => r.name === regionName);
      if (region && region.polygon.length > 0) {
        const centerX = region.polygon.reduce((sum, p) => sum + p[0], 0) / region.polygon.length;
        const centerY = region.polygon.reduce((sum, p) => sum + p[1], 0) / region.polygon.length;
        scale = 2;
        offsetX = canvas.width / 2 - (centerX * canvas.width / 100) * scale;
        offsetY = canvas.height / 2 - (centerY * canvas.height / 100) * scale;
        draw();
      }
    }
  };

})();
