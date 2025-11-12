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
  return parse_ops(symbol).map((pos) => [symbol_pos[0] + pos[0], symbol_pos[1] + pos[1]])
}

// get list of unsafe positions hit by layout
function get_hit_positions(symbols_with_positions) {
  return symbols_with_positions.map(symbol => get_hit_positions_by_symbol(symbol.symbol, symbol.pos)).flat()
}


let layout = []
const hasBeenSolved = false;
let solves = 0;
const solvesNeeded = 3;
//
// generate the symbols displayed on the n
function generateLayout() {
  const res = [];

  const occupiedPositions = new Set();
  const amountOfSymbols = Math.floor(Math.random() * 5) + 1;
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
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (!get_hit_positions(res).some((pos) => pos[0] == i && pos[1] == j)) {
        safeTiles++;
      }
    }
  }

  if (safeTiles > 0 && safeTiles < 3) {
    return res;
  } else {
    return generateLayout() // if layout is impossible, try again
  }
}

// Clear any symbols and display the given layout's symbols on grid
function displaySymbols(layout) {
  // clear symbols
  for (let i = 0; i < 9; i++) {
    const butt = document.getElementById(`button_${i}`);
    if (butt) {
      butt.innerHTML = '';
    }
  }

  // display new symbols
  for (const {symbol, pos} of layout) {
    const buttIndex = pos[0] + pos[1] * 3;
    const butt = document.getElementById(`button_${buttIndex}`);
    if (butt) {
      if (symbol.icon === "") {
        butt.innerHTML = syms.indexOf(symbol)
      } else {
        const img = document.createElement("img");
        img.src = symbol.icon;
        butt.appendChild(img);
      }
    }
  }
}

// trigger a strike
function handleStrike() {
  if (!hasBeenSolved) {
    bombModule.sendStrike();
  }
}

// trigger a solve of a single layout
function handleSolve() {
  if (solves >= solvesNeeded) {
    bombModule.sendSolve();
  } else {
    layout = generateLayout()
    displaySymbols(layout)
  }
}

// handle clicking on a button
function onClick(button) {
  const x = button % 3;
  const y = Math.floor(button / 3);

  if (get_hit_positions(layout).some(pos => pos[0] == x && pos[1] == y)) {
    handleStrike()
  } else {
    handleSolve()
  }
}

layout = generateLayout()
displaySymbols(layout)
document.querySelectorAll(".grid div").forEach((div, index) => {
  div.addEventListener('click', () => onClick(index));
})

