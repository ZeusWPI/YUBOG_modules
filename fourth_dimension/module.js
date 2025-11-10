import BombModule from "https://hannes-dev.github.io/YUBOG/ModuleLib.js";
const bombModule = new BombModule();

const syms = [
  {
    icon: "./assets/damnation-bird-2013121115.gif",
    ops: [ 'd^', 'O.' ],
  },
  {
    icon: "./assets/DAMN.png",
    ops: [ '_', 'o_' ],
  },
  {
    icon: "",
    ops: [ '_', 'o.', 'o_' ],
  },
  {
    icon: "",
    ops: [ '/', 'o/' ],
  },
  {
    icon: "",
    ops: [ '^', 'o^' ],
  },
  {
    icon: "",
    ops: [ '/', 'o/', '_' ],
  },
  {
    icon: "",
    ops: [ '', '' ],
  },
  {
    icon: "",
    ops: [ '', '' ],
  },
  {
    icon: "",
    ops: [ '', '' ],
  },
  {
    icon: "",
    ops: [ '', '' ],
  },
  {
    icon: "",
    ops: [ '', '' ],
  },
  {
    icon: "",
    ops: [ '', '' ],
  },
  {
    icon: "",
    ops: [ '', '' ],
  },
  {
    icon: "",
    ops: [ '', '' ],
  },
  {
    icon: "",
    ops: [ '', '' ],
  },
  {
    icon: "",
    ops: [ '', '' ],
  },
]

// parses operations for a specific symbols and returns unsafe positions, relative to symbol position
function parse_ops(symbol) {
  let res = [];
  for (const op of symbol.ops) {
    let isAltOp = false;
    for (const char of op) {
      const charCode = char.charCodeAt(0);
      if (charCode > 'a'.charCodeAt(0) && charCode < 'z'.charCodeAt(0)) {
        isAltOp = true;
      } else {
        switch (char) {
          case '_':
            res.push(isAltOp ? [0,1] : [-1,0]);
            res.push([0,0]);
            res.push(isAltOp ? [0,-1] : [1,0]);
            break;
          case '^':
            res.push(isAltOp ? [0, 1] : [0, -1]);
            break;
          case '.':
            if (isAltOp) {
              res.splice(res.indexOf([0,0]), 1);
            } else {
              res.push([0,0])
            }
            break;
          case '/':
            res.push(isAltOp ? [-1,-1] : [-1,1]);
            res.push([0,0]);
            res.push(isAltOp ? [1,1] : [1,-1]);
            break;
        }
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


let layout = [
  {symbol: syms[0], pos: [1,1]},
  {symbol: syms[1], pos: [0,0]},
]
const hasBeenSolved = false;
let solves = 0;
const solvesNeeded = 3;

// generate the symbols displayed on the n
function generateLayout() {
  const res = [];

  const occupiedPositions = new Set();
  const amountOfSymbols = Math.floor(Math.random() * 5) + 1;
  for (let i = 0; i < amountOfSymbols; i++) {
    const sym = syms[Math.floor(Math.random()*syms.length)];
    let position
    do { // make sure we don't have duplicate positions
      position = [Math.floor(Math.random() * 3), Math.floor(Math.random() * 3)];
    } while (occupiedPositions.has(position.toString()));

    res.push({symbol: sym, pos: position});
    occupiedPositions.add(position.toString());
  }

  // check if layout is possible
  let safeExists = false;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (!get_hit_positions(res).some((pos) => pos[0] == i && pos[1] == j)) {
        safeExists = true
        break;
      }
    }
  }

  if (safeExists) {
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
      const img = document.createElement("img");
      img.src = symbol.icon;
      butt.appendChild(img);
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

