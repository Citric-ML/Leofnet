export function createGrid(numRows, numCols) {
    const grid = [];
    for (let i = 0; i < numRows; i++) {
        grid[i] = [];
        for (let j = 0; j < numCols; j++) {
            grid[i][j] = Math.random() > 0.7 ? 1 : 0;
        }
    }
    return grid;
}

export function drawGrid(canvas, ctx, cellSize, numRows, numCols, color, grid) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
            if (grid[i][j] === 1) {
                ctx.fillStyle = color;
                ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
            }
        }
    }
}

export function updateGrid(numRows, numCols, grid) {
    const newGrid = [];
    for (let i = 0; i < numRows; i++) {
        newGrid[i] = [];
        for (let j = 0; j < numCols; j++) {
            const neighbors = countNeighbors(i, j, numRows, numCols, grid);
            if (grid[i][j] === 1 && (neighbors < 2 || neighbors > 3)) {
                newGrid[i][j] = 0;
            } else if (grid[i][j] === 0 && neighbors === 3) {
                newGrid[i][j] = 1;
            } else {
                newGrid[i][j] = grid[i][j];
            }
        }
    }
    return newGrid; // Return the updated grid
}

function countNeighbors(row, col, numRows, numCols, grid) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const r = row + i;
            const c = col + j;
            if (r >= 0 && r < numRows && c >= 0 && c < numCols && !(i === 0 && j === 0)) {
                count += grid[r][c];
            }
        }
    }
    return count;
}

function mainLoop(canvas, ctx, cellSize, numRows, numCols, color, grid) {
    grid = updateGrid(numRows, numCols, grid);
    drawGrid(canvas, ctx, cellSize, numRows, numCols, color, grid);

    drawScanlines(ctx, canvas.width, canvas.height);

    setTimeout(() => {
        requestAnimationFrame(() => mainLoop(canvas, ctx, cellSize, numRows, numCols, color, grid));
    }, 100);
}

export function init_life(inp_color) {
    const canvas = document.getElementById('lifeCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const cellSize = 2;
    const numRows = Math.floor(canvas.height / cellSize);
    const numCols = Math.floor(canvas.width / cellSize);
    const color = inp_color;
    
    let grid = createGrid(numRows, numCols);
    mainLoop(canvas, ctx, cellSize, numRows, numCols, color, grid);
}

function generateBarrelMap(size = 256, strength = 0.5) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  for (let y = 0; y < size; y++) {
    // Normalize y to [-1, 1]
    const ny = (y / (size - 1)) * 2 - 1;
    
    for (let x = 0; x < size; x++) {
      // Normalize x to [-1, 1]
      const nx = (x / (size - 1)) * 2 - 1;
      
      // Radial distance squared from center
      const r2 = nx * nx + ny * ny;
      
      // Pull pixels inward near edges to create outward barrel bulge
      // Negative sign pulls source pixels toward the center
      const dx = -nx * r2 * strength;
      const dy = -ny * r2 * strength;

      // Map [-1, 1] offset to [0, 255] color channel (128 = neutral)
      const r = Math.max(0, Math.min(255, Math.round((dx * 0.5 + 0.5) * 255)));
      const g = Math.max(0, Math.min(255, Math.round((dy * 0.5 + 0.5) * 255)));

      const idx = (y * size + x) * 4;
      data[idx] = r;     // X displacement
      data[idx + 1] = g; // Y displacement
      data[idx + 2] = 128; // Neutral Blue
      data[idx + 3] = 255; // Full Alpha
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL('image/png');
}

function drawScanlines(ctx, width, height) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)"; // Adjust opacity to taste
    for (let y = 0; y < height; y += 4) {   // Every 4th pixel draws a line
        ctx.fillRect(0, y, width, 2);       // 2px height scanline
    }
}
export function init_svg_filter(strength = 0.25, scale = 60) {
    const dataUrl = generateBarrelMap(256, 0.4);

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.style.position = "absolute";
    svg.style.width = "0";
    svg.style.height = "0";

    svg.innerHTML = `
        <defs>
            <!-- Expanded filter bounds prevent the inner-screen clipping artifact -->
            <filter id="barrel-distortion" x="-30%" y="-30%" width="160%" height="160%" filterUnits="objectBoundingBox" color-interpolation-filters="sRGB">
                <feImage href="${dataUrl}" result="map" width="100%" height="100%" preserveAspectRatio="none" />
                <feDisplacementMap in="SourceGraphic" in2="map" scale="${scale}" xChannelSelector="R" yChannelSelector="G" />
            </filter>
        </defs>
    `;

    document.body.appendChild(svg);
}

export function draw_test_grid(ctx) {
    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#081138';
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = '#00ffcc';
    ctx.lineWidth = 2;

    const step = 40;
    for (let x = 0; x <= width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }

    for (let y = 0; y <= height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }

    // Draw a center reference circle to check symmetry
    ctx.strokeStyle = '#ff0055';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, width / 4, 0, Math.PI * 2);
    ctx.stroke();
}
