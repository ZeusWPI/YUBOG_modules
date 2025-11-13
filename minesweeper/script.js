let divBoard = null;
let divBsodFailed = null;
let divBsodSuccess = null;

let BombModule = null;
let bombModule = null;
import("https://hannes-dev.github.io/YUBOG/ModuleLib.js").then((m) => {
    BombModule = m.default;
    bombModule = new BombModule();
});

let troll = false;

let goodX = 0;
let goodY = 0;

// Return the WIDTH of the MineSweeper game window to be created.
function calcWidth(maxX) {
    // icons are 16pixels wide.  20 for graphic border.
    // Extra 22 is for window border (required).
    return (maxX + 1) * 16 + 20 + 22 + 8;
}

// Return the HEIGHT of the MineSweeper game window to be created.
function calcHeight(maxY) {
    // icons are 16 high, time & bombs are 23 high, and extra 23 for borders.
    // 30 for 3 10-pixel border components.  10 for menu bar.
    // 35 is for top/bottom margin.
    statusbarExtra = 16;
    try {
        if (window.statusbar.visible) {
            statusbarExtra = 28;
        }
    } catch (e) { }
    // 12 extra because Firefox defaults to not allowing toolbar to be suppressed, and doesn`t report it properly! (can`t check window.toolbar).
    return (maxY + 1) * 16 + 23 + 23 + 30 + 35 + 12 + statusbarExtra;
} // }

//
// Variable and document setup stuff:
//

// Read in the board dimensions cookies

let maxX;
let maxY;
let maxNumBombs;
let useQuestionMarks;
let useMacroOpen;
let openRemaining;
let maxCells;
let topImages;
let maxStackHeight;
let smileMargin;
let cellArray;
let markedArray;
let tempClock;
let digit;

function initGame() {
    maxX = 12; // width - 1
    maxY = 9; // height - 1
    
    // Read the other param vars set by the intro page
    // Note how the double negative will force missing to default to true
    useQuestionMarks = false; //!(getCookie("useQuestionMarks") == `false`);
    useMacroOpen = false; //!(getCookie("useMacroOpen") == `false`);
    openRemaining = false; //(getCookie("openRemaining") == `true`);

    // Set global constants
    maxCells = (maxX + 1) * (maxY + 1) - 1; // Constant: # of cells on board
    maxNumBombs = maxCells;

    topImages = 7; //19; // 7 on game menu, 8 on opt menu, 3 bomb #s, smile face, 3 time #s
    maxStackHeight = 300; // For recursive cell opening stack
    smileMargin = 0.75 + (((maxX + 1) * 16 - (13 * 6 + 26)) / 2) - 2; // To center smile & rt jstfy time

    // Global Arrays (created once)
    cellArray = new Array(maxCells); // One per cell on the board
    for (let l = 0; l <= maxCells; l++) {
        cellArray[l] = new constructCell()
    }
    markedArray = new Array(maxStackHeight); // For recursive cell opening stack

    markedCount = -1; // For recursive cell opening stack
    highestStackHeight = -1; // For recursive cell opening stack
}

// Variables used & reset during play
let dead = false; // Hit a bomb?
let win = false; // All cells open?
let bombsFlagged = 0; // How many bombs marked so far?
let cellsOpen = 0; // How many cells open so far?
let markedCount = -1; // For recursive cell opening stack
let highestStackHeight = -1; // For recursive cell opening stack
let pointingAtX = -1; // Current cell being pointed at.
let pointingAtY = -1; // Used for space bar bomb flagging
let numMoves = 0; // Count the number of clicks
let openRemainingUsed = false; // Was openRemaining used by the player?
let lastClickOnMenu = false; // Used to control smooth menu closing

// Vars for the clock time
let clockMoving = false; // Is it moving?
let clockActive = false; // Should it be moving?
let killLastClock = false; // To start new time w/ old still running
let clockCurrent = -1; // Current time

// preload images: all time/#bombs images, including the negative
let timeDigits = new Array(10);
for (let l = 0; l <= 9; l++) {
    timeDigits[l] = new Image(23, 13);
    let tstr = "images/time" + l + ".gif";
    timeDigits[l].src = tstr;
}
let timeNeg = new Image(23, 13);
timeNeg.src = "images/time-.gif";

// preload moves counter images
let movesDigits0 = new Image(23, 13);
movesDigits0.src = "images/moves0.gif";

// preload images: 9 open tiles (0..8)
let cellOpenIm = new Array(9);
for (let l = 0; l <= 8; l++) {
    cellOpenIm[l] = new Image(16, 16);
    let tstr = "images/open" + l + ".gif";
    cellOpenIm[l].src = tstr;
}

// preload images: the many faces of bombs and bomb markers
let bombFlagged = new Image(16, 16);
bombFlagged.src = "images/bombflagged.gif";
let bombRevealed = new Image(16, 16);
bombRevealed.src = "images/bombrevealed.gif";
let bombMisFlagged = new Image(16, 16);
bombMisFlagged.src = "images/bombmisflagged.gif";
let bombDeath = new Image(16, 16);
bombDeath.src = "images/bombdeath.gif";
let bombQuestion = new Image(16, 16);
bombQuestion.src = "images/bombquestion.gif";
let blankCell = new Image(16, 16);
blankCell.src = "images/blank.gif";

// preload images: the 3 faces (can`t use "oh" w/o mouseUp/Down methods)
let faceDead = new Image(26, 26);
faceDead.src = "images/facedead.gif";
let faceSmile = new Image(26, 26);
faceSmile.src = "images/facesmile.gif";
let faceWin = new Image(26, 26);
faceWin.src = "images/facewin.gif";
let faceWait = new Image(26, 26);
faceWait.src = "images/faceclock.gif";
let faceOoh = new Image(26, 26);
faceOoh.src = "images/faceooh.gif";
let facePirate = new Image(26, 26);
facePirate.src = "images/facepirate.gif";

// preload images: two images used in the menus for check marks and place holders
let checked = new Image(10, 10);
checked.src = "images/checked.gif";
let notchecked = new Image(10, 10);
notchecked.src = "images/notchecked.gif";

// Creates the internal cells (as opposed to the image cells).  Called once
// per cell upon creation of the window (see above).
function constructCell() {
    this.isBomb = false; // Is the cell a bomb?
    this.isExposed = false; // Is it open?
    this.isFlagged = false; // Does it have a bomb flag on it?
    this.isQuestion = false; // Question mark (if its used)
    this.isMarked = false; // Used for recursive macro opening
    this.neighborBombs = 0;
} // # surrounding bombs.  Set for all cells.

//
// General-purpose routines called from throughout the game
//

// Returns the index of the internal playing board cellArray at given
// x,y coords (on 0..n-1 scale).  Very useful fn.
function arrayIndexOf(x, y) {
    return x + y * (maxX + 1);
}


// Returns the index of the documents image pointing to cell at given
// x,y coords (on 0..n-1 scale).  Very useful fn.
// Notes: topImages are the 3 bomb digits, the face, & the 3 time digits.
//        Uses maxX+2 (not maxX+1) to include borderRight images.
function imageIndexOf(x, y) {
    return x + (y + 2) * (maxX + 3) + topImages + 3;
} // This is the simplified version
// return x+y*(maxX+2)+topImages+(maxX+1)*2+(y+1)+6; }


// Makes sure x,y coords are within the board.  Returns true or false.
function checkBounds(x, y) {
    return ((0 <= x) && (x <= maxX) && (0 <= y) && (y <= maxY));
}

// Saves the current pointing location of the mouse.  Called w/ onMouseOver
// for each cell.
function cursorHoldLoc(x, y) {
    pointingAtX = x;
    pointingAtY = y;
}

// Clears the saved location.  Needed when user points outside the grid.
// Note: I check that I`m clearing the correct cell, just in case events
// occur out of order.
function cursorClearLoc(x, y) {
    if ((pointingAtX == x) && (pointingAtY == y)) {
        pointingAtX = -1;
        pointingAtY = -1;
    }
}


// Complete the Win process. Save the cookies, and call the winning window.
function winShowWindow() {
    win = true;
    //setCookie("gameTime", clockCurrent);
    //setCookie("numMoves", numMoves);
    //setCookie("openRemainingUsed", openRemainingUsed);
    document.face.src = faceWin.src;
    //window.open(`highscores/minewin.html`, `MinesweeperWin`, `toolbar=0,directories=0,menubar=0,scrollbars=1,resizable=0,width=400,height=420`);
}

//
// Associated w/ opening cells & cell clicking
//

// You`re dead.  Open the board of bombs.  Assumes death bomb is already
// displayed (and isExposed is set to true).
function deathShowBombs() {
}

// You`ve won.  Mark any remaining cells as flags.
function winShowFlags() {
    for (let i = 0; i <= maxX; i++) {
        for (let j = 0; j <= maxY; j++) {
            let el = cellArray[arrayIndexOf(i, j)];
            if ((!el.isExposed) && (!el.isFlagged)) {
                el.isFlagged = true;
                document.images[imageIndexOf(i, j)].src = bombFlagged.src;
            }
        }
    }
}

// Open all remaining cells. Returns True if the player has won.
function openAll() {
    let allOK = true;
    for (let i = 0; i <= maxX; i++) {
        for (let j = 0; j <= maxY; j++) {
            let el = cellArray[arrayIndexOf(i, j)];
            if (!el.isExposed) {
                if ((el.isBomb) && (!el.isFlagged)) {
                    allOK = false;
                } else if ((!el.isBomb) && (el.isFlagged)) {
                } else if (!el.isBomb) {
                }
            }
        }
    }
    return allOK;
}

// Actually opens the cell.  Works for bombs & free cells.  Can handle
// recursive calls (through markMatrixToOpen), death (if bomb), and win.
// (should probably be broken up a bit)
function openCell(x, y) {
    // Normal cell opening processing begins here
    let el = cellArray[arrayIndexOf(x, y)];
    if (el.isBomb) {
        // death
        clockStop();
        document.images[imageIndexOf(x, y)].src = bombDeath.src;
        document.face.src = faceDead.src;
        el.isExposed = true;
        dead = true;
        updateNumBombs();
        openAll();
        deathShowBombs();
        bombModule.sendStrike();
    } else {
        el.isExposed = true;
        el.isMarked = false;
        ++cellsOpen;
        if (cellsOpen + maxNumBombs - 1 == maxCells) {
            clockStop();
            winShowFlags();
            winShowWindow();
            bombModule.sendSolve();
            divBoard.style.display = "none";
            divBsodSuccess.style.display = "block";
        }
    }
}

// Cells on stack marked to be open.  Called on an as-needed baisis.
// See the markCellToOpen fn below.
function constructMarkedCell() {
    this.x = -1;
    this.y = -1;
}

// Although Netscapes JavaScript 1.1 documentation says JavaScript is
// recursive, it doesn`t actually maintain a stack of local vars!
// So these functions turned out to be a real pain to rewrite with my
// own stack structures.
// Adds an element to the manual stack.  Lengthens the stack if necessary.
function markCellToOpen(x, y) {
    ++markedCount;
    if (highestStackHeight < markedCount) {
        ++highestStackHeight;
        markedArray[markedCount] = new constructMarkedCell()
    }
    markedArray[markedCount].x = x;
    markedArray[markedCount].y = y;
    cellArray[arrayIndexOf(x, y)].isMarked = true;
}

// When you open a cell w/ 0 neighbors or click on a completely flagged
// cell, open all neighbors (not flagged).  Creates recursive calls through
// markCellToOpen
function markMatrixToOpen(x, y) {
    for (let i = x - 1; i <= x + 1; i++) {
        for (let j = y - 1; j <= y + 1; j++) {
            if (checkBounds(i, j)) {
                let el = cellArray[arrayIndexOf(i, j)];
                if ((!el.isExposed) && (!el.isMarked) && (!el.isFlagged)) {
                    markCellToOpen(i, j);
                }
            }
        }
    }
}

// Open all cells (usually one) marked for opening.  See markMatrixToOpen
// to see how multiple cells are marked.
function openAllMarked() {
    while (markedCount >= 0) {
        markedCount--; // Decrement first, in case a matrix is to be open
        let el = markedArray[markedCount + 1];
        openCell(el.x, el.y);
    }
}

// Returns 1 if a cell is flagged, and 0 otherwise.  Used in determining
// if a cell has complete surrounding cells flagged.  See below
function checkFlagged(x, y) {
    if (checkBounds(x, y))
        return (cellArray[arrayIndexOf(x, y)].isFlagged) ? (1) : (0);
    else
        return 0;
}

// Count the # of neighbors flagged.  Called for matrix opening.
function checkFlaggedMatrix(x, y) {
    count = 0;
    for (let i = x - 1; i <= x + 1; i++) {
        for (let j = y - 1; j <= y + 1; j++) {
            if ((i != x) || (j != y)) { //Don`t check center point
                count = count + checkFlagged(i, j);
            }
        }
    }
    return count;
}

// Main click function.  Called whenever a cell is clicked.  Based on mode,
// determines what to do about the click. Handles both left and right.
function cellClick(x, y, e) {
    //   alert("Clicked cell " + x + "," + y);  //Useful diagnostic line
    //   alert("Button pressed = " + e.button) //Useful diagnostic line
    //closeAllMenus();
    if ((!dead) && (!win)) {
        document.face.src = faceSmile.src;
        numMoves++;
        // Count the moves
        if ((e != null) && (e.button != 2)) {
            let el = cellArray[arrayIndexOf(x, y)];
            // Is it already open?  If so, we may need to do a matrix (macro) open
            if (el.isExposed) {
                if ((useMacroOpen) && (checkFlaggedMatrix(x, y) == el.neighborBombs)) {
                    markMatrixToOpen(x, y);
                    openAllMarked();
                }
            } else {
                if (!el.isFlagged) {
                    markCellToOpen(x, y);
                    openAllMarked();
                }
            }
            if (win) {
                bombsFlagged = maxNumBombs;
                updateNumBombs();
            }
        } else {
            if (x > -1) {
                let el = cellArray[arrayIndexOf(x, y)];
                if (!el.isExposed) {
                    // There are 3 possibilities: blank, flagged, and question
                    // First deal with flagged going to either blank or question
                    if (el.isFlagged) {
                        bombsFlagged--;
                        el.isFlagged = false;
                        if (!useQuestionMarks)
                            document.images[imageIndexOf(x, y)].src = blankCell.src;
                        else {
                            el.isQuestion = true;
                            document.images[imageIndexOf(x, y)].src = (bombQuestion.src);
                        }
                    }
                        // Now deal w/ question going to blank
                    else {
                        if (isQuestion) {
                            el.isQuestion = false;
                            document.images[imageIndexOf(x, y)].src = blankCell.src;
                        }
                            // Finally, blank going to flagged
                        else {
                            el.isFlagged = true;
                            ++bombsFlagged;
                            document.images[imageIndexOf(x, y)].src = bombFlagged.src;
                        }
                    }
                    updateNumBombs();
                }
            }
        }
    }
}

// Mark a bomb with the space bar (what would be the spacebar).  Called
// whenever the value of the check box is toggled.  (Replaces old fn which
// altered "mode").
function cellRightClick() {
    cellClick(pointingAtX, pointingAtY, null);
}

// Disable the right click button`s menu.
function pressRightClick() {
    return false;
}
document.oncontextmenu = pressRightClick;

// Special routine to ignore dragging starts.
// Allows the mouse to be in motion when the user clicks.
// Only works in IE because there is no onDrag handler in Mozilla
function ignoreDragging() {
    try {
        window.event.returnValue = false;
    } catch (e) { }
    return false;
}

// Show or remove the "Ooh" face when the mouse is clicked.
function showMouseDown(e) {
    if ((!dead) && (!win)) {
        //closeAllMenus();
        document.face.src = faceOoh.src;
    }
}

// Check for F2. If pressed, restart the game. Two versions: for FF & IE
document.onkeydown = checkKeyDown; // Uses global onkeypress.
function checkKeyDown(e) {
    try {
        if (e.keyCode == 113) {
            faceClick();
        }
    } catch (e) { }
    try {
        if (window.event.keyCode == 113) {
            faceClick();
        }
    } catch (e) { }
}

// When all bombs are marked, user can open all remaining cells.
function bombCountClick() {
    //closeAllMenus();
    if ((!dead) && (!win) && (openRemaining) && ((maxNumBombs - bombsFlagged) == 0)) {
        clockStop();
        numMoves++;
        openRemainingUsed = true;
        if (openAll()) {
            winShowWindow();
            updateNumBombs();
        } else {
            dead = true;
            updateNumBombs();
            document.face.src = faceDead.src;
        }
    }
    return false;
}

//
// Board creation, re-initialization, bomb placement, etc.
//

// Support function for makeBoard.  Adds 1 to the neighborBombs property.
// Does a bounds check and a check for not being a bomb. (no change if
// either condition fails)
function addNeighbor(x, y) {
    if (checkBounds(x, y)) {
        let el = cellArray[arrayIndexOf(x, y)];
        ++el.neighborBombs;
    }
}

// Called only w/ removal of bomb when 1st click is on a bomb.
function removeNeighbor(x, y) {
    if (checkBounds(x, y)) {
        let el = cellArray[arrayIndexOf(x, y)];
        --el.neighborBombs;
    }
}

// Support function for makeBoard, and also called externally if first
// click is on a bomb.  Places a bomb at x,y loc and updates neighbor
// counts.  returns true upon success, failure if bomb is already there
// or if the square is open. (note: isExposed is set temporarily to true
// during first click to avoid bombs being placed in bomb-free zone.)
function placeBomb(x, y) {
    let el = cellArray[arrayIndexOf(x, y)];
    if ((!el.isBomb) && (!el.isExposed)) {
        el.isBomb = true;
        for (let i = x - 1; i <= x + 1; i++) {
            for (let j = y - 1; j <= y + 1; j++) {
                addNeighbor(i, j);
            }
        }
        return true;
    } else
        return false;
}

// Only called when user`s 1st click is on a bomb.
// NOTE: This fn caused an "internal error: Stack underflow" for a while,
// and then stopped.  I still can`t find the cause, but if I split the
// cellArray reference out into a higher "with" statement, it comes back.
// It seems to work fine now, but be careful!
function removeBomb(x, y) {
    if (cellArray[arrayIndexOf(x, y)].isBomb) {
        for (let i = x - 1; i <= x + 1; i++) {
            for (let j = y - 1; j <= y + 1; j++) {
                removeNeighbor(i, j);
            }
        }
        cellArray[arrayIndexOf(x, y)].isBomb = false;
        return true;
    } else
        return false;
}

// Pixed a random stop w/o a bomb already there and places a bomb there.
// Since it works w/ random locs and tests compliance, this fn is only
// suitable for up to ~50% coverage. (I`ve limited the program to 33%).
function placeBombRandomLoc() {
    let bombPlaced = false;
    while (!bombPlaced) {
        let i = Math.floor(Math.random() * (maxX + 1));
        let j = Math.floor(Math.random() * (maxY + 1));
        bombPlaced = (placeBomb(i, j))
    }
}

// Does a complete clear of the internal board cell objects.
function clearBoard() {
    for (let i = 0; i <= maxX; i++) {
        for (let j = 0; j <= maxY; j++) {
            let el = cellArray[arrayIndexOf(i, j)];
            el.isExposed = false;
            el.isBomb = false;
            el.isFlagged = false;
            el.isMarked = false;
            el.isQuestion = false;
            el.neighborBombs = 0;
        }
    }
}

// Puts the original image on each image cell.
function clearBoardImages() {
    for (let j = 0; j <= maxY; j++) {
        for (let i = 0; i <= maxX; i++) {
            if (document.images[imageIndexOf(i, j)].src != blankCell.src) {
                document.images[imageIndexOf(i, j)].src = blankCell.src;
            }
        }
    }
}

// Core fn for creating a board.  Does not reset time or clear images.
function makeBoard() {
    clearBoard();
    bombsFlagged = 0;
    cellsOpen = 0;
    updateNumBombs();
    // Now place the bombs on the board
    for (let x = 0; x <= maxX; x++) {
        for (let y = 0; y <= maxY; y++) {
            if (!(x == goodX && y == goodY)) {
                placeBomb(x, y);
            }
        }
    }
}

// Resets clock, makes board, clears images, and prepares for next game.
// First time doesn`t do a parent reload.
function faceClick_first() {
    document.face.src = faceWait.src;
    numMoves = 0;
    //closeAllMenus();
    clockStop();
    clockClear();
    makeBoard();
    clearBoardImages();
    dead = false;
    win = false;
    openRemainingUsed = false;
    document.face.src = faceSmile.src;
    return false;
}

function faceClick() {
    faceClick_first();
    return false;
}

// Internal testing fns
function timetestStart() {
    timetestStartDt = new Date();
}
function timetestStop() {
    timetestEndDt = new Date();
    alert(`Diagnostic Timer: ` + (timetestEndDt - timetestStartDt) + `ms`);
}

//
// Numerical displays (clock and num bomb) updated here
//

// Set the clock images to the current time.  Called by ticClock
function updateClock() {
    tempClock = clockCurrent;
    if (tempClock == -1) {
        tempClock = 0;
    }
    let digit = tempClock % 10;
    document.time1s.src = timeDigits[digit].src;
    digit = Math.floor(tempClock / 10 % 10);
    document.time10s.src = timeDigits[digit].src;
    digit = Math.floor(tempClock / 100 % 10);
    document.time100s.src = timeDigits[digit].src;
}


// Updates the display w/ the current number of bombs left.
function updateNumBombs() {
    if ((!dead) && (!win) && (openRemaining) && ((maxNumBombs - bombsFlagged) == 0)) {
        document.bomb1s.src = movesDigits0.src;
        document.bomb10s.src = movesDigits0.src;
        document.bomb100s.src = movesDigits0.src;
    } else {
        digit = Math.abs(maxNumBombs - bombsFlagged) % 10;
        document.bomb1s.src = timeDigits[digit].src;
        digit = Math.floor(Math.abs(maxNumBombs - bombsFlagged) / 10 % 10);
        document.bomb10s.src = timeDigits[digit].src;
        digit = Math.floor(Math.abs(maxNumBombs - bombsFlagged) / 100 % 10);
        document.bomb100s.src = timeDigits[digit].src;
        if (maxNumBombs < bombsFlagged)
            document.bomb100s.src = timeNeg.src;
    }
}

//
// Time
//

// Clock tic.  Called once, then it repeats every 1 second.
function ticClock() {
    if (!killLastClock) {
        if (clockMoving) {
            ++clockCurrent;
        }
        if ((clockMoving) && (clockCurrent < 1000)) // Max out display at 999
            updateClock();
        clockActive = clockMoving;
        if (clockActive) { // Always do the recursive call last
            id = setTimeout("ticClock()", 1000)
        }
    }
    killLastClock = false;
}

// Stops the clock
//   SPECIAL NOTE: This function doesn`t actually stop the clock: it
//   directs the ticClock fn to stop ticking upon its next recusrive call.
function clockStop() {
    clockMoving = false;
}

// Stop and clear the clock.  See specal note in clockStop above.
function clockClear() {
    // If we`re currently moving, we need to first stop it
    if ((!clockMoving) && (clockCurrent != 0)) {
        clockCurrent = 0;
        updateClock();
    }
    clockCurrent = -1;
    clockMoving = false;
}


// Starts the clock.  Able to start a clear clock or restart a paused
// clock (a feature I`m not using here).
function clockStart() {
    // Stop the clock (sets a temp variable for later interigation)
    clockWasActive = clockActive;
    clockMoving = true;
    ticClock();
    // harder part: We`re still running.  Tells ticClock to kill old clock.
    if (clockWasActive) {
        killLastClock = true;
    }
}

//
// Main
//

function init() {
    console.info("Init called");
    divBoard = document.getElementById("minesweeper");
    divBsodFailed = document.getElementById("bsod-failed");
    divBsodSuccess = document.getElementById("bsod-success");

    //divBoard.style.display = "auto";
    divBsodFailed.style.display = "none";
    divBsodSuccess.style.display = "none";

    initGame();

    let serial = bombModule.getSerialNumber();
    for (let i = 0; i < serial.length; i++) {
        let c = serial.charCodeAt(i);
        if (65 <= c && c <= 90) {
            goodX += c - 65;
        }
    }
    goodX = goodX % 13;
    for (let i = 0; i < serial.length; i++) {
        let c = serial.charCodeAt(i);
        if (48 <= c && c <= 57) {
            goodY += c - 48;
        }
    }
    goodY = goodY % 10;
    console.info(goodX);
    console.info(goodY);

    var html = '';

    // Build the top line
    html += '<img src="images/bordertl.gif" alt="" />';
    for (j = 0; j <= maxX; j++) {
        html += '<img src="images/bordertb.gif" height="10" width="16" alt="" />';
    }
    html += '<img src="images/bordertr.gif" alt="" /><br />';

    // Build the top display (# bombs, face, clock)
    html += '<img src="images/borderlr.gif" height="25" width="10" alt="" />';
    html += '<a id="cntBombs" onclick="return bombCountClick()"><img src="images/time0.gif" border="0" name="bomb100s" width="13" height="23" alt="" /><img src="images/time0.gif" border="0" name="bomb10s" width="13" height="23" alt="" /><img src="images/time0.gif" border="0" name="bomb1s" width="13" height="23" alt="" /></a>';
    html += '<a id="face" onclick="return faceClick()"><img src="images/faceclock.gif" name="face" hspace="' + smileMargin + '" border="0" width="26" height="25" alt="" /></a>';
    html += '<span id="cntTime"><img src="images/time0.gif" border="0" name="time100s" width="13" height="23" alt="" /><img src="images/time0.gif" border="0" name="time10s" width="13" height="23" alt="" /><img src="images/time0.gif" border="0" name="time1s" width="13" height="23" alt="" /></span>';
    html += '<img src="images/borderlr.gif" height="25" width="10" alt="" /><br />';

    // Line between title stuff and the board
    html += '<img src="images/borderjointl.gif" alt="" />';
    for (j = 0; j <= maxX; j++) {
        html += '<img src="images/bordertb.gif" height="10" width="16" alt="" />';
    }
    html += '<img src="images/borderjointr.gif" alt="" /><br />';

    // Build the main grid itself, placing it on-screen.  Note the l/r edge
    // Also, using a temp string to build line before display.  Speeds up display.
    for (i = 0; i <= maxY; i++) {
        html += '<img src="images/borderlr.gif" height="16" width="10" alt="" />';
        for (j = 0; j <= maxX; j++) {
            // IE requires onDragStart, Netscape requires onDrag. Click is handled via onmouseup.
            html += '<a onclick="" onmouseover="cursorHoldLoc(' + j + ',' + i + ')" onmouseout="cursorClearLoc(' + j + ',' + i + ')" ondragstart="ignoreDragging()" ondrag="ignoreDragging()" onmousedown="showMouseDown(event);" onmouseup="cellClick(' + j + ',' + i + ', event)">';
            html += '<img src="images/blank.gif" name="cellIm' + j + '_' + i + '" border="0" alt="" /></a>';
        }
        html += '<img src="images/borderlr.gif" border="0" height="16" width="10" alt="" /><br />';
    }

    // Build the bottom line, including corners
    html += '<img src="images/borderbl.gif" alt="" />';
    for (j = 0; j <= maxX; j++) {
        html += '<img src="images/bordertb.gif" height="10" width="16" alt="" />';
    }
    html += '<img src="images/borderbr.gif" alt="" /><br />';

    // Final settings - populate the board, focus, make the smile face, and create the menus
    divBoard.innerHTML = html;
    faceClick_first();

    divBoard.style = `transform: scale(${self.innerHeight / 228}); transform-origin: top left;`;
}

addEventListener("resize", () => {
    divBoard.style = `transform: scale(${self.innerHeight / 228}); transform-origin: top left;`;
});

addEventListener("yubog:start", init);
