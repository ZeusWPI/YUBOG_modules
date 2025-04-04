import BombModule from "https://hannes-dev.github.io/YUBOG/ModuleLib.js";

const bombModule = new BombModule();
window.addEventListener("yubog:init", e => init());
window.addEventListener("yubog:start", e => start());
let edgework;

const wait = (time => new Promise(r => setTimeout(r, time)));

for (let button of document.getElementsByClassName("action")) {
    button.addEventListener("click", function () {
        if (!cooking) {
            executeStep(button.innerHTML);
        }
    })
}

const clickAudio = new Audio('assets/button_click.wav');
clickAudio.volume = 0.1;
const fryingAudio = new Audio('assets/pan_frying.wav')
fryingAudio.volume = 0.1;
fryingAudio.loop = true;
const customerEnterAudio = new Audio('assets/customer_enter.wav');
customerEnterAudio.volume = 0.1;
const customerDoneAudio = new Audio('assets/finish_customer.wav')
customerDoneAudio.volume = 0.3;

const customerSeat = document.getElementById("customer_seat");

const statusBar = document.getElementById("status-bar")
const progress = document.getElementById("progress-img")
statusBar.style.opacity = "0";

const DISHES = {
    burger: ["MEAT", "HOB", "BUNS", "PLATE"],
    steak_1: ["MEAT", "HOB", "PLATE"],
    steak_2: ["MEAT", "HOB", "HOB", "PLATE"],
    steak_3: ["MEAT", "HOB", "HOB", "HOB", "PLATE"],
    pizza: ["FLOUR", "CHOP", "OIL", "TOMATO", "CHOP", "CHOP", "CHEESE", "CHOP", "HOB", "PLATE"]
};

let customersToCome = [];
let waitingCustomers = [];

let cooking = false;
let burning = false;

let stepIndex = 0;

function init() {
    edgework = bombModule.getEdgework();
    customersToCome.push(newCustomer());
    customersToCome.push(newCustomer());
}

async function start() {
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
    clickAudio.play()
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
            console.log("customer served")
            console.log("customers still waiting:" + waitingCustomers)
        }
        if (customersToCome.length <= 0 && waitingCustomers.length <= 0) {
            bombModule.sendSolve();
        }
    } else {
        console.log("sent " + action + " instead of " + waitingCustomers[0][stepIndex])
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
        bombModule.sendStrike()
        statusBar.style.opacity = "0";
        stepIndex = 0;
        fryingAudio.pause();
    }

}

function newCustomer() {
    return DISHES["pizza"];
}

function chooseDish() {
    let edgework = bombModule.getEdgework();
    let serial = edgework.serial;
    let ports = edgework.ports;
    let batteries = edgework.batteries;

    if (serial.charCodeAt(0) - "A".charCodeAt(0) >= 13 && serial[serial.length - 1] % 3 === 1) {
        return DISHES[0];
    } else if (batteries.length >= 2 && batteries.filter(e => e >= 2).length >= 2) {
        return DISHES[1];
    } else if (ports.length === 3) {
        return DISHES[2];
    } else if (ports.includes("Parallel")) {
        return DISHES[3];
    } else {
        return DISHES[4];
    }
}

function updateCustomerSeat() {
    if (waitingCustomers.length <= 0) {
        customerSeat.src = "assets/no_customer.png";
    } else {
        customerSeat.src = "assets/customer.png";
    }
}