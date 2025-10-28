const ROWS = 30;
const COLS = 40;
const gridDiv = document.getElementById('grid');
// Diagnostic log to confirm the script executed on the page
console.log('Pathfinding Visualizer: script loaded');
const setStartBtn = document.getElementById('setStartBtn');
const setEndBtn = document.getElementById('setEndBtn');
const wallModeBtn = document.getElementById('wallModeBtn');
const runBtn = document.getElementById('runBtn');
const clearBtn = document.getElementById('clearBtn');

gridDiv.style.gridTemplateRows = `repeat(${ROWS}, 1fr)`;
gridDiv.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;

const grid = [];
let startCell = null;
let endCell = null;
let wallMode = false;
let settingStart = false;
let settingEnd = false;

// Create the grid
for (let r = 0; r < ROWS; r++) {
  const row = [];
  for (let c = 0; c < COLS; c++) {
    const cell = {
      row: r,
      col: c,
      isWall: false,
      g: Infinity,
      h: Infinity,
      f: Infinity,
      parent: null,
      element: null
    };
    const cellDiv = document.createElement('div');
    cellDiv.classList.add('cell');
    cellDiv.addEventListener('click', () => {
      console.log(`cell clicked r=${r} c=${c}`);
      if (settingStart) {
        if (startCell) startCell.element.classList.remove('start');
        startCell = cell;
        cellDiv.classList.add('start');
        settingStart = false;
      } else if (settingEnd) {
        if (endCell) endCell.element.classList.remove('end');
        endCell = cell;
        cellDiv.classList.add('end');
        settingEnd = false;
      } else if (wallMode) {
        cell.isWall = !cell.isWall;
        cellDiv.classList.toggle('wall');
      }
    });
    cell.element = cellDiv;
    gridDiv.appendChild(cellDiv);
    row.push(cell);
  }
  grid.push(row);
}

// Button event listeners
setStartBtn.addEventListener('click', () => {
  console.log('setStartBtn clicked');
  settingStart = true;
  settingEnd = false;
  wallMode = false;
});

setEndBtn.addEventListener('click', () => {
  console.log('setEndBtn clicked');
  settingStart = false;
  settingEnd = true;
  wallMode = false;
});

wallModeBtn.addEventListener('click', () => {
  console.log('wallModeBtn clicked');
  wallMode = !wallMode;
  settingStart = false;
  settingEnd = false;
  wallModeBtn.textContent = wallMode ? 'Wall Mode (ON)' : 'Toggle Wall Mode';
});

clearBtn.addEventListener('click', () => {
  console.log('clearBtn clicked');
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = grid[r][c];
      cell.isWall = false;
      cell.g = Infinity;
      cell.h = Infinity;
      cell.f = Infinity;
      cell.parent = null;
      cell.element.className = 'cell';
    }
  }
  startCell = null;
  endCell = null;
});

// A* pathfinding algorithm
function heuristic(cell, end) {
  return Math.abs(cell.row - end.row) + Math.abs(cell.col - end.col);
}

function getNeighbors(cell) {
  const neighbors = [];
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  
  for (const [dr, dc] of directions) {
    const r = cell.row + dr;
    const c = cell.col + dc;
    
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS && !grid[r][c].isWall) {
      neighbors.push(grid[r][c]);
    }
  }
  return neighbors;
}

async function astar() {
  if (!startCell || !endCell) {
    alert('Please set both start and end points');
    return;
  }

  // Reset previous path
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = grid[r][c];
      if (!cell.isWall && cell !== startCell && cell !== endCell) {
        cell.element.className = 'cell';
      }
      cell.g = Infinity;
      cell.f = Infinity;
      cell.parent = null;
    }
  }

  const openSet = [startCell];
  const closedSet = new Set();
  startCell.g = 0;
  startCell.f = heuristic(startCell, endCell);

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift();
    
    if (current === endCell) {
      // Path found, visualize it
      let path = current;
      while (path.parent) {
        if (path !== endCell) {
          path.element.classList.add('path');
        }
        path = path.parent;
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      return;
    }

    closedSet.add(current);

    for (const neighbor of getNeighbors(current)) {
      if (closedSet.has(neighbor)) continue;

      const tentativeG = current.g + 1;

      if (!openSet.includes(neighbor)) {
        openSet.push(neighbor);
      } else if (tentativeG >= neighbor.g) {
        continue;
      }

      neighbor.parent = current;
      neighbor.g = tentativeG;
      neighbor.f = neighbor.g + heuristic(neighbor, endCell);

      if (neighbor !== endCell) {
        neighbor.element.classList.add('visited');
        await new Promise(resolve => setTimeout(resolve, 20));
      }
    }
  }

  alert('No path found!');
}

runBtn.addEventListener('click', astar);
