import BombModule from "https://hannes-dev.github.io/YUBOG/ModuleLib.js";

const bombModule = new BombModule();
window.addEventListener("yubog:start", e => start());
let edgework;

const wait = (time => new Promise(r => setTimeout(r, time)));


for (let button of document.getElementsByClassName("action")) {
    button.addEventListener("click", function () {
        if (!cooking) {
            executeStep(button.innerHTML);
        }
    });
}

const clickAudio = new Audio('assets/button_click.wav');
clickAudio.volume = 0.1;
const fryingAudio = new Audio('assets/pan_frying.wav');
fryingAudio.volume = 0.1;
fryingAudio.loop = true;
const customerEnterAudio = new Audio('assets/customer_enter.wav');
customerEnterAudio.volume = 0.1;
const customerDoneAudio = new Audio('assets/finish_customer.wav');
customerDoneAudio.volume = 0.3;

const customerSeat = document.getElementById("customer_seat");

const statusBar = document.getElementById("status-bar");
const progress = document.getElementById("progress-img");
statusBar.style.opacity = "0";

const DISHES = {
    burger: ["MEAT", "HOB", "BUNS", "PLATE"],
    steak1: ["MEAT", "HOB", "PLATE"],
    steak2: ["MEAT", "HOB", "HOB", "PLATE"],
    steak3: ["MEAT", "HOB", "HOB", "HOB", "PLATE"],
    pizza: ["FLOUR", "CHOP", "OIL", "TOMATO", "CHOP", "CHOP", "CHEESE", "CHOP", "HOB", "PLATE"]
};

const STEAKS = [
    DISHES["steak1"],
    DISHES["steak2"],
    DISHES["steak3"]
];

let customersToCome = [];
let waitingCustomers = [];

let customerHistory = []; // Keeps all the customer orders (to calculate the next)

let cooking = false;
let burning = false;

let stepIndex = 0;

async function start() {
    customersToCome.push(getCustomer(1));
    customerHistory.push(getCustomer(1));
    customersToCome.push(getCustomer(2));
    customerHistory.push(getCustomer(2));

    // actual Start
    await wait(3000);
    waitingCustomers.push(customersToCome.shift());
    updateCustomerSeat();
    customerEnterAudio.play();
    await wait(20000);
    waitingCustomers.push(customersToCome.shift());
    updateCustomerSeat();
    customerEnterAudio.play();
}

function executeStep(action) {
    clickAudio.play();
    if (!burning) {
        statusBar.style.opacity = "0";
        fryingAudio.pause();
    }
    if (waitingCustomers.length <= 0) {
        return;
    }
    if (action === waitingCustomers[0][stepIndex]) {
        burning = false;
        statusBar.style.opacity = "0";
        fryingAudio.pause();
        if (waitingCustomers[0][stepIndex] === "HOB") {
            process(8000);
        }
        stepIndex += 1;
        if (stepIndex === waitingCustomers[0].length) {
            waitingCustomers.shift();
            updateCustomerSeat();
            customerDoneAudio.play();
            stepIndex = 0;
        }
        if (customersToCome.length <= 0 && waitingCustomers.length <= 0) {
            bombModule.sendSolve();
        }
    } else {
        console.log("sent " + action + " instead of " + waitingCustomers[0][stepIndex]);
        bombModule.sendStrike();
    }
}

async function process(time) {
    statusBar.style.opacity = "1";
    progress.style.backgroundImage = "url('assets/progress.png')";
    cooking = true;
    fryingAudio.volume = 0.1;
    fryingAudio.play();
    await wait(time);
    cooking = false;
    fryingAudio.volume = 0.4;
    progress.style.backgroundImage = "url('assets/progress_warning.png')";
    burning = true;
    await wait(3000);
    if (burning) {
        bombModule.sendStrike();
        statusBar.style.opacity = "0";
        stepIndex = 0;
        fryingAudio.pause();
    }

}

function getCustomer(customerNr) {
    const getSeason = d => Math.floor((d.getMonth() / 12 * 4)) % 4;

    let edgework = bombModule.getEdgework();
    let serial = bombModule.getEdgework().serial.toLowerCase();
    let ports = bombModule.getEdgework().ports;
    let batteries = bombModule.getEdgework().batteries;
    bombModule.getTotalBatteries();

    if (customerNr === 1) {
        if (ports.includes("Parallel") && /[aeiou]/.test(serial)) {
            return DISHES["steak1"];
        } else if (bombModule.getTotalBatteries() > 6) {
            return DISHES["steak2"];
        } else if (/[0-9].*[0-9].*[0-9]/.test(serial)) {
            return DISHES["steak3"];
        } else {
            return DISHES["pizza"];
        }
    } else if (customerNr === 2) {
        if (STEAKS.includes(customerHistory[0]) && ports.includes("DVI-D")) {
            return DISHES["pizza"];
        } else if (calculateDigitsMod6(serial) > 3) {
            return DISHES["steak2"];
        } else if (ports.includes("PS/2")) {
            return DISHES["steak3"];
        } else {
            return DISHES["burger"];
        }
    } else { // customerNr === 3
        if (/[a-m]/.test(serial[0]) && serial[5] % 3 === 1) {
            return DISHES["burger"];
        } else if (getSeason(new Date()) === 2 && ports.length % 2 === 0) {
            return DISHES["steak2"];
        } else {
            return DISHES["pizza"];
        }
    }
}

function updateCustomerSeat() {
    if (waitingCustomers.length <= 0) {
        customerSeat.src = "assets/no_customer.png";
    } else {
        customerSeat.src = "assets/customer.png";
    }
}

function calculateDigitsMod6(serial) {
    let digits = serial.split("").filter(e => /[0-9]/.test(e));
    let product = digits.reduce((a, b) => a * b);
    return product % 6;
}