// Necroware Interactive World Map
// Shows continents, corporation territories, nations, and bodies of water

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

  // Continent landmasses (base layer - simplified modern world map)
  const continents = [
    {
      name: 'North America',
      color: 'rgba(60, 80, 60, 0.4)',
      borderColor: 'rgba(80, 120, 80, 0.6)',
      polygon: [[5, 15], [12, 10], [20, 12], [25, 18], [28, 25], [25, 35], [20, 42], [15, 45], [10, 40], [8, 30], [5, 22]]
    },
    {
      name: 'South America',
      color: 'rgba(60, 80, 60, 0.4)',
      borderColor: 'rgba(80, 120, 80, 0.6)',
      polygon: [[18, 48], [25, 45], [30, 50], [32, 60], [28, 72], [22, 78], [16, 70], [14, 58]]
    },
    {
      name: 'Europe',
      color: 'rgba(70, 70, 90, 0.4)',
      borderColor: 'rgba(90, 90, 120, 0.6)',
      polygon: [[40, 18], [48, 15], [55, 20], [58, 28], [52, 35], [45, 32], [38, 25]]
    },
    {
      name: 'Africa',
      color: 'rgba(80, 70, 50, 0.4)',
      borderColor: 'rgba(120, 100, 60, 0.6)',
      polygon: [[42, 38], [50, 35], [58, 40], [60, 55], [55, 68], [48, 72], [40, 65], [38, 50]]
    },
    {
      name: 'Asia',
      color: 'rgba(70, 60, 60, 0.4)',
      borderColor: 'rgba(100, 80, 80, 0.6)',
      polygon: [[58, 12], [70, 8], [85, 12], [92, 20], [88, 35], [80, 42], [70, 38], [62, 30], [55, 22]]
    },
    {
      name: 'Australia',
      color: 'rgba(80, 60, 50, 0.4)',
      borderColor: 'rgba(120, 80, 60, 0.6)',
      polygon: [[78, 55], [88, 52], [92, 58], [88, 65], [80, 68], [75, 60]]
    },
    {
      name: 'Antarctica',
      color: 'rgba(200, 200, 220, 0.3)',
      borderColor: 'rgba(220, 220, 240, 0.4)',
      polygon: [[10, 90], [30, 88], [50, 90], [70, 88], [90, 90], [90, 95], [10, 95]]
    }
  ];

  // Corporation territories (overlay on continents)
  const regions = [
    {
      name: 'Ark Corp Territory',
      color: 'rgba(220, 20, 60, 0.35)',
      borderColor: '#dc143c',
      description: 'Ark Corp\'s primary territory. Born from the Russian corporate-state in 2047. Hayden Volkov merged Ark Manufacturing with the Russian government, creating the first corporate-state. Now controls the largest share of Element Zero deposits and spans much of northern Asia.',
      polygon: [[58, 12], [70, 8], [85, 12], [88, 25], [80, 35], [70, 30], [62, 22], [55, 18]]
    },
    {
      name: 'X-Technologies Territory',
      color: 'rgba(0, 150, 255, 0.35)',
      borderColor: '#0096ff',
      description: 'X-Technologies\' stronghold. Founded in 2089 by Dr. Elara Voss after defecting from Ark Corp with the Element Zero synthesis process. Funded by billionaire Vex Kael. Controls the Pacific rim and competes with Ark Corp in every sector.',
      polygon: [[75, 35], [88, 30], [92, 40], [85, 50], [75, 48], [70, 40]]
    },
    {
      name: 'Ash District',
      color: 'rgba(255, 140, 0, 0.35)',
      borderColor: '#ff8c00',
      description: 'The last free zone. A lawless sprawl of ruins, bunkers, and survivors in the crossroads between corporate territories. Home to 100 million people who refused to die. The setting of our game.',
      polygon: [[35, 45], [50, 42], [58, 50], [55, 60], [45, 65], [35, 58], [30, 50]]
    },
    {
      name: 'Neo-Kyoto Crater',
      color: 'rgba(128, 0, 128, 0.5)',
      borderColor: '#800080',
      description: 'Ground zero for the Elemental Warp. Once the city of Neo-Kyoto, population 40 million. Destroyed in 2140 by Dead Circuit with a 1-terraton Element Zero nuke. Now a mile-wide crater and the most contaminated place on Earth.',
      polygon: [[85, 38], [90, 35], [92, 40], [88, 42]]
    },
    {
      name: 'Corporate Plazas',
      color: 'rgba(255, 215, 0, 0.35)',
      borderColor: '#ffd700',
      description: 'Neutral grounds scattered across the globe. Gleaming towers of Element Zero and glass where executives live in luxury. Kept pristine by mutually assured destruction — any attack on a Plaza triggers a response that destroys both sides.',
      polygon: [[42, 25], [48, 22], [52, 28], [46, 32], [40, 28]]
    },
    {
      name: 'Lower Zones',
      color: 'rgba(100, 100, 100, 0.35)',
      borderColor: '#646464',
      description: 'Dirty, violent, lawless regions where everyone else survived. Corporate wars are fought here using proxies, mercenaries, and Reanimate soldiers. The slums, refugee camps, and outer districts that the Plazas pretend don\'t exist.',
      polygon: [[10, 50], [20, 48], [28, 55], [25, 65], [15, 68], [8, 60]]
    },
    {
      name: 'VitaCorp Territory',
      color: 'rgba(0, 200, 100, 0.35)',
      borderColor: '#00c864',
      description: 'VitaCorp\'s domain. Owns reanimation technology — controls who lives and dies. Their territory is where the wealthy come to stack lives like ammo.',
      polygon: [[12, 18], [18, 15], [22, 22], [18, 28], [12, 25], [8, 22]]
    },
    {
      name: 'Genetico Farmlands',
      color: 'rgba(0, 150, 0, 0.35)',
      borderColor: '#009600',
      description: 'Genetico\'s agricultural heartland. Owns all food production and genetic modification. Every calorie you eat has their logo on it.',
      polygon: [[42, 55], [50, 52], [55, 58], [52, 65], [45, 62], [38, 58]]
    },
    {
      name: 'OmniSource Energy Grid',
      color: 'rgba(255, 200, 0, 0.3)',
      borderColor: '#ffc800',
      description: 'OmniSource controls all energy production. Their power grids span continents. They can shut off your district\'s power — and your life support — with a keystroke.',
      polygon: [[60, 42], [70, 40], [78, 45], [75, 52], [65, 55], [58, 48]]
    },
    {
      name: 'Ironclad Defense Zone',
      color: 'rgba(100, 100, 150, 0.35)',
      borderColor: '#646496',
      description: 'Ironclad Defense territory. The largest private military. They don\'t fight wars — they are the war.',
      polygon: [[20, 35], [28, 32], [32, 38], [28, 44], [20, 42], [15, 38]]
    },
    {
      name: 'Synaptic Systems Hub',
      color: 'rgba(150, 0, 150, 0.3)',
      borderColor: '#960096',
      description: 'Synaptic Systems manufactures AI and neural interfaces. They know what you think before you think it.',
      polygon: [[48, 20], [55, 18], [58, 24], [52, 28], [46, 25]]
    },
    {
      name: 'DataVault Archives',
      color: 'rgba(0, 100, 150, 0.3)',
      borderColor: '#006496',
      description: 'DataVault stores all digital information. Every message, every memory, every secret — they have it all.',
      polygon: [[75, 55], [82, 52], [85, 58], [80, 62], [73, 58]]
    },
    {
      name: 'MediGen Healthcare',
      color: 'rgba(200, 50, 50, 0.25)',
      borderColor: '#c83232',
      description: 'MediGen controls healthcare for those who can\'t afford resurrection. They keep you alive just enough to keep working.',
      polygon: [[30, 25], [38, 22], [42, 28], [38, 34], [30, 32], [25, 28]]
    }
  ];

  // Bodies of water
  const waterBodies = [
    {
      name: 'Pacific Ocean',
      color: 'rgba(0, 40, 80, 0.5)',
      polygon: [[30, 10], [35, 25], [32, 45], [28, 60], [20, 75], [15, 85], [10, 80], [12, 60], [15, 40], [18, 20]]
    },
    {
      name: 'Atlantic Ocean',
      color: 'rgba(0, 40, 80, 0.5)',
      polygon: [[30, 15], [38, 25], [40, 45], [38, 60], [30, 75], [25, 85], [20, 80], [22, 60], [25, 40], [28, 20]]
    },
    {
      name: 'Indian Ocean',
      color: 'rgba(0, 40, 80, 0.5)',
      polygon: [[55, 45], [65, 42], [75, 48], [78, 60], [70, 70], [58, 68], [50, 58]]
    },
    {
      name: 'Arctic Ocean',
      color: 'rgba(0, 60, 100, 0.4)',
      polygon: [[10, 5], [30, 3], [50, 5], [70, 3], [90, 5], [90, 10], [10, 10]]
    },
    {
      name: 'Element Zero Sea',
      color: 'rgba(80, 0, 80, 0.4)',
      polygon: [[82, 25], [88, 22], [92, 28], [88, 35], [82, 32], [80, 28]]
    },
    {
      name: 'Contamination Bay',
      color: 'rgba(50, 0, 50, 0.4)',
      polygon: [[85, 45], [92, 42], [95, 48], [90, 52], [84, 48]]
    }
  ];

  // Cities/Points of interest
  const cities = [
    { name: 'The Spire Ruins', x: 82, y: 38, description: 'X-Technologies former HQ. 200-story tower converted to raw Element Zero by Dead Circuit in 2140.' },
    { name: 'Data Center Omega', x: 48, y: 52, description: 'Destroyed by the player. Ark Corp\'s intelligence network blinded across three continents.' },
    { name: 'MindBridge Facility', x: 42, y: 28, description: 'Where ArkMind was born. Where Dr. Okafor\'s dream died.' },
    { name: 'Lazarus Facility Alpha', x: 68, y: 18, description: 'Primary training facility for Lazarus Initiative soldiers. Location deep in Ark territory.' },
    { name: 'Dead Circuit Hideout', x: 35, y: 52, description: 'Where Dead Circuit was born. Where the resistance began.' },
    { name: 'Neo-Kyoto Crater', x: 88, y: 40, description: 'Ground zero for the Elemental Warp. Once a city of 40 million.' },
    { name: 'Corporate Plaza Prime', x: 48, y: 25, description: 'The largest Corporate Plaza. Neutral ground for executive negotiations.' },
    { name: 'Ash District Central', x: 45, y: 55, description: 'Heart of the last free zone. Home to 100 million survivors.' },
    { name: 'VitaCorp Reanimation Center', x: 15, y: 22, description: 'Where the wealthy come to stack lives like ammo.' },
    { name: 'Genetico Prime Farm', x: 48, y: 60, description: 'The largest genetically modified food production facility on Earth.' },
    { name: 'OmniSource Reactor', x: 68, y: 48, description: 'Primary energy production facility. Powers half of Asia.' },
    { name: 'Ironclad Barracks', x: 25, y: 38, description: 'Largest private military base. Home to 500,000 contractors.' },
    { name: 'Synaptic AI Core', x: 52, y: 24, description: 'Where the neural interfaces are made. Where thoughts are read.' },
    { name: 'DataVault Server Farm', x: 78, y: 58, description: 'Underground facility storing all digital information on Earth.' },
    { name: 'MediGen Hospital', x: 35, y: 28, description: 'Where the poor come to be kept alive just enough to keep working.' }
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
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
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

    // Draw water bodies (oceans)
    waterBodies.forEach(water => {
      drawPolygon(water.polygon, water.color, 'rgba(100, 150, 200, 0.3)');
    });

    // Draw continents (base landmasses)
    continents.forEach(continent => {
      const isHovered = hoveredRegion === continent.name;
      drawPolygon(continent.polygon, continent.color, continent.borderColor, isHovered ? 3 : 1);
    });

    // Draw corporation territories (overlay)
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
    const allRegions = [...continents, ...waterBodies, ...regions, ...cities];
    const region = allRegions.find(r => r.name === hoveredRegion);
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
    // Check cities first (highest priority)
    for (const city of cities) {
      const cx = city.x * canvas.width / 100;
      const cy = city.y * canvas.height / 100;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (dist < 15) return city.name;
    }

    // Check corporation regions
    for (const region of regions) {
      if (isPointInPolygon(x, y, region.polygon)) {
        return region.name;
      }
    }

    // Check continents
    for (const continent of continents) {
      if (isPointInPolygon(x, y, continent.polygon)) {
        return continent.name;
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
      const allRegions = [...continents, ...waterBodies, ...regions, ...cities];
      const region = allRegions.find(r => r.name === regionName);
      if (region) {
        if (region.polygon) {
          const centerX = region.polygon.reduce((sum, p) => sum + p[0], 0) / region.polygon.length;
          const centerY = region.polygon.reduce((sum, p) => sum + p[1], 0) / region.polygon.length;
          scale = 2;
          offsetX = canvas.width / 2 - (centerX * canvas.width / 100) * scale;
          offsetY = canvas.height / 2 - (centerY * canvas.height / 100) * scale;
          draw();
        } else if (region.x !== undefined) {
          scale = 2;
          offsetX = canvas.width / 2 - (region.x * canvas.width / 100) * scale;
          offsetY = canvas.height / 2 - (region.y * canvas.height / 100) * scale;
          draw();
        }
      }
    }
  };

})();
