import BombModule from "https://hannes-dev.github.io/YUBOG/ModuleLib.js";

const bombModule = new BombModule();
window.addEventListener("yubog:start", e => init());

const debugLog = (msg) => {
    console.log(`%c[ManualParser]%c${msg}`, "color: gold;");
}

const PROGRESS_DISPLAY = document.getElementById("progress")
const DISPLAY = document.getElementById("display");
const BUTTONS = [
    document.getElementById("button1"),
    document.getElementById("button2"),
    document.getElementById("button3"),
    document.getElementById("button4"),
]

for (let button of BUTTONS) {
    button.addEventListener("click", () => submitAnswer(button.innerText));
}

const POSSIBILITIES = {
    "Clair": "./assets/color/clair.png",
    "Danseuse": "./assets/color/danseuse.png",
    "Greatsword Cultist": "./assets/color/greatsword_cultist.png",
    "Grosse Tète": "./assets/color/grosse_tete.png",
    "Jar": "./assets/color/jar.png",
    "Luster": "./assets/color/luster.png",
    "Mime": "./assets/color/mime.webp",
    "Moissoneusse": "./assets/color/moissoneusse.png",
    "Noir": "./assets/color/noir.png",
    "Obscur": "./assets/color/obscur.png",
    "Pétank": "./assets/color/petank.png",
    "Reaper Cultist": "./assets/color/reaper_cultist.png",
    "Sakapatate": "./assets/color/sakapatate.png",
    "Stallact": "./assets/color/stallact.png",
    "Troubadour": "./assets/color/troubadour.png",
}
const poss_suffled = Object.keys(POSSIBILITIES).sort(() => 0.5 - Math.random());
let currentSolution;
let currentIteration = 0;

function init() {
    setup(currentIteration);
}


function setup(iteration) {
    currentIteration = iteration;
    updateProgress(iteration);
    if (iteration >=3) {
        bombModule.sendSolve();
        return;
    }
    const index = iteration*4;
    currentSolution = poss_suffled[index];
    DISPLAY.src = POSSIBILITIES[poss_suffled[index]];
    BUTTONS[0].innerText = poss_suffled[index];
    BUTTONS[1].innerText = poss_suffled[index+1];
    BUTTONS[2].innerText = poss_suffled[index+2];
    BUTTONS[3].innerText = poss_suffled[index+3];
    debugLog(`Setup Enemy: ${currentSolution}`)
}

function updateProgress(progress) {
    let progressString = "";
    for (let i=0; i<progress; i++) {
        progressString+="🟢"
    }
    for (let i = 0; i<3-progress; i++) {
        progressString+="🔴"
    }
    PROGRESS_DISPLAY.innerText = progressString;
}

function submitAnswer(answer) {
    if (currentIteration>=3) {
        return;
    }
    if (answer.toLowerCase() === currentSolution.toLowerCase()) {
        setup(currentIteration+1)
        debugLog("Solved Iteration")
    } else {
        bombModule.sendStrike();
        debugLog("Sent Strike!")
    }
}