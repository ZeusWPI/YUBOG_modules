import BombModule from "https://hannes-dev.github.io/YUBOG/ModuleLib.js";

const bombModule = new BombModule();
window.addEventListener("yubog:start", e => init());

for (let button of document.getElementsByClassName("action")) {
    button.addEventListener("click", function () {
        tryStep(button.innerHTML)
    })
}

const statusBar = document.getElementById("status-bar")
const progress = document.getElementById("progress-img")

const BURGER = ["MEAT", "HOB", "BUNS", "PLATE"];
const STEAK_3 = ["MEAT", "HOB", "HOB", "HOB", "PLATE"];
const STEAK_2 = ["MEAT", "HOB", "HOB", "PLATE"];
const STEAK_1 = ["MEAT", "HOB", "PLATE"];
const PIZZA = ["FLOUR", "CHOP", "OIL", "TOMATO", "CHOP", "CHOP", "CHEESE", "CHOP", "HOB", "PLATE"];

const DISHES = [BURGER, PIZZA, STEAK_1, STEAK_2, STEAK_3];

const dishToImage = [
    "borgor.png",
    "steak1.png",
    "steak2.png",
    "steak3.png",
    "pizza.png"
]

let processing = false

statusBar.style.opacity = 0;

let serial, ports, batteries, dish, dishIndex, stepIndex;


function init() {
    serial = bombModule.getEdgework().serial;
    ports = bombModule.getEdgework().ports;
    batteries = bombModule.getEdgework().batteries;

    dishIndex = 4
    chooseDish();
    dish = DISHES[dishIndex];
    console.log("[PlateUp] Dish: " + dish);
    stepIndex = 0;
    // document.getElementById("order").src = "assets/" + dishToImage[dishIndex]

}

function tryStep(action) {
    if (!processing) {

        if (action !== dish[stepIndex]) {
            bombModule.sendStrike();
            console.log("[PlateUp] Strike!")
        } else {
            statusBar.style.opacity = 0;
            if (dish[stepIndex] === "HOB") {
                process(8000);
            } else if (dish[stepIndex] === "OVEN") {
                process(5000);
            }
            stepIndex += 1;
            if (stepIndex === dish.length) {
                bombModule.sendSolve();
                console.log("[PlateUp] Served")
            }
        }
    }
}

async function process(time) {
    statusBar.style.opacity = 1;
    progress.style.backgroundImage = "url('assets/progress.png')";
    processing = true;
    let startStep = stepIndex + 1;
    await new Promise(r => setTimeout(r, time));
    processing = false;
    progress.style.backgroundImage = "url('assets/progress_warning.png')";
    await new Promise(r => setTimeout(r, 6000));
    if (stepIndex === startStep) {
        bombModule.sendStrike()
        console.log("[PlateUp] Strike!")
        statusBar.style.opacity = 0;
    }
}


function chooseDish() {
    if (serial.charCodeAt(0) - "A".charCodeAt(0) >= 13 && serial[serial.length - 1] % 3 === 1) {
        dishIndex = 0;
    } else if (batteries.length >= 2 && batteries.filter(e => e >= 2).length >= 2) {
        dishIndex = 1;
    } else if (ports.length === 3) {
        dishIndex = 2;
    } else if (ports.includes("Parallel")) {
        dishIndex = 3;
    } else {
        dishIndex = 4;
    }
}