// Function to initialize the grid
function createGrid(numRows, numCols) {
    const grid = [];
    for (let i = 0; i < numRows; i++) {
        grid[i] = [];
        for (let j = 0; j < numCols; j++) {
            grid[i][j] = Math.
            random() > 0.7 ? 1 : 0; // Random initialization
        }
    }
    return grid;
}

// Function to draw the grid
function drawGrid(canvas, ctx, cellSize, numRows, numCols, color) {
    ctx.clearRect(0, 0, canvas.width , canvas.height);
    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
            if (grid[i][j] === 1) {
                ctx.fillStyle = color;
                ctx.fillRect(j * cellSize, i *
                cellSize, cellSize, cellSize);
            }
        }
    }
}

// Function to update the grid based on Conway's rules
function updateGrid(numRows, numCols, grid) {
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
    grid = newGrid;
}

// Function to count live neighbors of a cell
function countNeighbors(row, col, numRows, numCols, grid) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const r = row + i;
            const c = col + j;
            if (r >= 0 && r < numRows && c >= 0 &&
                c < numCols && !(i === 0 && j === 0)) {
                count += grid[r][c];
            }
        }
    }
    return count;
}

// Main loop to update and draw the grid
function mainLoop(canvas, ctx, cellSize, numRows, numCols, color, grid, isRunning, animationId) {
    updateGrid(numRows, numCols, grid);
    drawGrid(canvas, ctx, cellSize, numRows, numCols, color);
    setTimeout(() => {
        animationId = requestAnimationFrame(mainLoop);
    }, 100);
}

// function to be called by html files
function init_life(inp_color) {
    // Initialize canvas and context
    const canvas = document.getElementById('lifeCanvas');
    const ctx = canvas.getContext('2d');
    
    // Define cell size and grid dimensions
    const cellSize = 2;
    const numRows = Math.floor(canvas.height / cellSize);
    const numCols = Math.floor(canvas.width / cellSize);
    const color = inp_color;
    
    let grid = createGrid(numRows, numCols);
    let isRunning = false;
    let animationId = null;
    mainLoop(canvas, ctx, cellSize, numRows, numCols, color, grid, isRunning, animationId);
}
