import BombModule from "https://hannes-dev.github.io/YUBOG/ModuleLib.js";
const bombModule = new BombModule();

const syms = [
  {
    icon: "./assets/icon_8.png",
    ops: [ '   ',  ' * ', ' * ' ],
  },
  {
    icon: "./assets/icon_3.png",
    ops: [ ' * ', '***', ' * ' ],
  },
  {
    icon: "./assets/icon_5.png",
    ops: [ ' * ', '* *',  ' * '  ],
  },
  {
    icon: "./assets/icon_14.png",
    ops: [ '* *', ' * ', '* *' ],
  },
  {
    icon: "./assets/icon_13.png",
    ops: [ ' * ', '   ', ' * '  ],
  },
  {
    icon: "./assets/icon_7.png",
    ops: [ '* *', '***', '* *'  ],
  },
  {
    icon: "./assets/icon_2.png",
    ops: [ ' **', '  *', ' * '  ],
  },
  {
    icon: "./assets/icon_4.png",
    ops: [ '** ', '*  ', ' **'  ],
  },
  {
    icon: "./assets/icon_9.png",
    ops: [ '** ', '* *', ' **'  ],
  },
  {
    icon: "./assets/icon_1.png",
    ops: [ '* *', '* *', '* *'  ],
  },

  {
    icon: "./assets/icon_16.png",
    ops: [ '***', '   ', '***'  ],
  },
  {
    icon: "./assets/icon_15.png",
    ops: [ '* *', '***', '  *'  ],
  },
  {
    icon: "./assets/icon_11.png",
    ops: [ '* *', ' * ', ' * '  ],
  },
  {
    icon: "./assets/icon_6.png",
    ops: [ ' **', '** ', ' * '  ],
  },
  {
    icon: "./assets/icon_10.png",
    ops: [ '** ', ' **', '** '  ],
  },
  {
    icon: "./assets/icon_12.png",
    ops: [ '  *', '*  ', '  *'  ],
  }
]

const windmolen = { icon: "./assets/windmolen.png", ops: [ '***', '***', '***'  ] };


// parses operations for a specific symbols and returns unsafe positions, relative to symbol position
function parse_ops(symbol) {
  let res = [];
  for (let y = 0; y < symbol.ops.length; y++ ) {
    const row = symbol.ops[y];
    for (let x = 0; x < row.length; x++) {
      if (row[x] === '*') {
        res.push([x-1, y-1])
      }
    }
  }
  return res;
}

// get positions that are hit by given symbol at symbol_pos
function get_hit_positions_by_symbol(symbol, symbol_pos) {
  return parse_ops(symbol).map((pos) => { 
    return [symbol_pos[0] + pos[0], symbol_pos[1] + pos[1]] 
  })
}

// get list of unsafe positions hit by layout
function get_hit_positions(symbols_with_positions) {
  return symbols_with_positions.map(symbol => get_hit_positions_by_symbol(symbol.symbol, symbol.pos)).flat()
}


let layout = []
let hasBeenSolved = false;
let solves = 0;
const solvesNeeded = 3;

// generate the symbols displayed on the n
function generateLayout() {
  const res = [];

  const occupiedPositions = new Set();
  const amountOfSymbols = Math.floor(Math.random() * 4) + 1;
  for (let i = 0; i < amountOfSymbols; i++) {
    const sym = Math.random() < 0.01 
      ? windmolen // rare chance of windmolen
      : syms[Math.floor(Math.random()*syms.length)];

    let position = Math.random() < 0.6 
      ? [1,1] 
      : [Math.floor(Math.random() * 3), Math.floor(Math.random() * 3)];
    while ( occupiedPositions.has(position.toString())) { // make sure we don't have duplicate positions
      position = [Math.floor(Math.random() * 3), Math.floor(Math.random() * 3)];
    }

    res.push({symbol: sym, pos: position});
    occupiedPositions.add(position.toString());
  }

  // check if layout is possible
  let safeTiles = 0;
  const hit_positions = get_hit_positions(res);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const isHit = hit_positions.some(([x, y]) => x === i && y === j);
      if (!isHit) safeTiles++;
    }
  }

  if (safeTiles > 0 && safeTiles < 5) {
    return res;
  } else {
    return generateLayout() // if layout is impossible, try again
  }
}

// clear visuals of grid
function clearGrid() {
  for (let i = 0; i < 9; i++) {
    const butt = document.getElementById(`button_${i}`);
    if (butt) {
      butt.innerHTML = '';
    }
  }
}

function getButtIndex(pos) {
  if (pos[0] < 0 || pos[1] < 0 || pos[0] > 2 || pos[1] > 2) {
    return -1
  } else {
    return pos[0] + pos[1] * 3
  }
}

// Clear any symbols and display the given layout's symbols on grid
function displaySymbols(layout) {
  clearGrid()

  // display new symbols
  for (const {symbol, pos} of layout) {
    const buttIndex = getButtIndex(pos)
    const butt = document.getElementById(`button_${buttIndex}`);
    if (butt) {
      const img = document.createElement("img");
      img.src = symbol.icon;
      butt.appendChild(img);
    }
  }
}

function displayHitTiles(layout) {
  clearGrid()
  for (const pos of get_hit_positions(layout)) {
    const buttIndex = getButtIndex(pos)
    const butt = document.getElementById(`button_${buttIndex}`);
    if (butt) {
      butt.textContent = "X"
    }
  }
}

function updateProgressCircles() {
  for (let i = 0; i < solves; i++) {
    const doc = document.getElementById(`circle_${i}`)
    if (doc) {
      doc.classList.add("solved-circle")
    }
  }
}

// trigger a strike
function handleStrike() {
  if (!hasBeenSolved) {
    document.body.classList.add("strike-effect");
    setTimeout(() => document.body.classList.remove("strike-effect"), 1000);
    bombModule.sendStrike();
  }
}

// trigger a solve of a single layout
function handleSolve() {
  solves += 1;
  if (solves >= solvesNeeded) {
    bombModule.sendSolve();
    document.body.classList.add("we-solved-the-puzzle-exclamation-mark");
    hasBeenSolved = true
  }

  updateProgressCircles();
  document.body.classList.add("solve-effect");
  setTimeout(() => document.body.classList.remove("solve-effect"), 1000);
}

let clickDebounce = false;
// handle clicking on a button
function onClick(button) {
  if (clickDebounce || hasBeenSolved) { return };
  clickDebounce = true;
  const x = button % 3;
  const y = Math.floor(button / 3);

  displayHitTiles(layout)
  if (get_hit_positions(layout).some(pos => pos[0] == x && pos[1] == y)) {
    handleStrike()
  } else {
    handleSolve()
  }
  if (!hasBeenSolved) {
    setTimeout(() => {
      layout = generateLayout()
      displaySymbols(layout)
      clickDebounce = false
    }, 1000)
  } else {
    console.log("4D bomb radar solved")
    clearGrid()
    setTimeout(() => document.getElementById("grid").classList.add("we-solved-the-puzzle-exclamation-mark"), 200);
  }
}

layout = generateLayout()
displaySymbols(layout)
document.querySelectorAll(".grid div").forEach((div, index) => {
  div.addEventListener('click', () => onClick(index));
})

