import BombModule from "https://hannes-dev.github.io/YUBOG/ModuleLib.js";
const bombModule = new BombModule();

const syms = [
  {
    icon: "",
    ops: [ 'd^', 'O.' ],
  },
  {
    icon: "",
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

// parses operations for a specific symbols and returns unsafe positions relative to position of symbol
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

function get_hit_positions_by_symbol(symbol, symbol_pos) {
  return parse_ops(symbol).map((pos) => [symbol_pos[0] + pos[0], symbol_pos[1] + pos[1]])
}

function get_hit_positions(symbols_with_positions) {
  return symbols_with_positions.map(symbol => get_hit_positions_by_symbol(symbol.symbol, symbol.pos)).flat()
}


const layout = [
  {symbol: syms[0], pos: [1,1]},
  {symbol: syms[1], pos: [0,0]},
]
const hasBeenSolved = false;
let solves = 0;
const solvesNeeded = 3;

function generateLayout() {
  // TODO
}

function updateSymbols() {
  // TODO
}

function handleStrike() {
  if (!hasBeenSolved) {
    bombModule.sendStrike();
  }
}

function handleSolve() {
  if (solves >= solvesNeeded) {
    bombModule.sendSolve();
  } else {
    generateLayout()
  }
}
function onClick(button) {
  const x = button % 3;
  const y = Math.floor(button / 3);

  if (get_hit_positions(layout).some(pos => pos[0] == x && pos[1] == y)) {
    handleStrike()
  } else {
    handleSolve()
  }
}

generateLayout()
document.querySelectorAll(".grid div").forEach((div, index) => {
  div.addEventListener('click', () => onClick(index));
})

