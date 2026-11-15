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

export function distortion_map(distort_object) {
    
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    const imgData = ctx.createImageData(size, size);

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            // Normalize coordinates to -1 to 1
            const nx = (x / (size - 1)) * 2 - 1;
            const ny = (y / (size - 1)) * 2 - 1;
            const r2 = nx * nx + ny * ny;

            // push pixels (adjust const in distortion to increase/decrease distortion)
            const distortion = r2 * 1.2; 
            const dx = -nx * distortion;
            const dy = -ny * distortion;

            // Map -1..1 offset into 0..255 RGB channels (128 = neutral)
            const idx = (y * size + x) * 4;
            imgData.data[idx] = Math.min(255, Math.max(0, 128 + dx * 127));     // R (X)
            imgData.data[idx + 1] = Math.min(255, Math.max(0, 128 + dy * 127)); // G (Y)
            imgData.data[idx + 2] = 128;                                        // B
            imgData.data[idx + 3] = 255;                                        // Alpha
        }
    }
    ctx.putImageData(imgData, 0, 0);
    const dataUrl = canvas.toDataURL();
    distort_object.setAttribute("href", dataUrl);
    distort_object.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", dataUrl);
}

// inject shared SVG filter to avoid safari limitations on referencing external filters from css.
export async function initFilter() {
    try {
        const response = await fetch('./assets/filters.svg');
        const svgText = await response.text();
        
        const div = document.createElement('div');
        div.innerHTML = svgText;
        document.body.appendChild(div.firstElementChild);

        // Target the newly injected element and apply the canvas map
        const obj = document.getElementById('displacement-map');
        if (obj) {
            distortion_map(obj);
        }
    } catch (e) {
        console.error("Failed to load shared distortion filter:", e);
    }
}
