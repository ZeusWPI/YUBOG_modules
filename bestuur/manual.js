import BombModule from "../../ModuleLib.js";

const bombModule = new BombModule();

let i = 0;
let solved = false;

const options = [
    [[0, 2, 3, 1], [0, 3, 1, 2]], //
    [[1, 6, 9, 7], [3, 1, 2, 0]], //
    [[2, 8, 5, 4], [1, 2, 0, 3]], //
    [[3, 5, 4, 6], [2, 0, 3, 1]], //
    [[4, 9, 6, 5], [0, 3, 1, 2]], //
    [[5, 1, 7, 8], [3, 1, 2, 0]], //
    [[6, 0, 4, 9], [1, 2, 0, 3]], //
    [[7, 8, 9, 0], [2, 0, 3, 1]], //
    [[8, 9, 7, 1], [0, 3, 1, 2]], //
]

const images = [
    ["pics/hannes.jpg", "Hannes"], // 0
    ["pics/xander.jpg", "Xander"], // 1
    ["pics/vincent.jpg", "Vincent"], // 2
    ["pics/lander.jpg", "Lander"], // 3
    ["pics/axel.jpg", "Axel"], // 4
    ["pics/francis.jpg", "Francis"], // 5
    ["pics/jan.jpg", "Jan"], // 6
    ["pics/mathieu.jpg", "Mathieu"], // 7
    ["pics/rune.jpg", "Rune"], // 8
    ["pics/tybo.jpg", "Tybo"] // 9
]

const random = Math.floor(Math.random() * options.length);

const img_index = ["img_1", "img_2", "img_3", "img_4"];
const txt_index = ["1", "2", "3", "4"];

function assignImages() {
    for (let i = 0; i < 4; i++) {
        const img = document.getElementById(img_index[i]);
        img.src = images[options[random][0][i]][0];
        img.alt = images[options[random][0][i]][1];

        const button = document.getElementById(txt_index[i]);
        button.insertAdjacentText("beforeend", images[options[random][0][i]][1]);
    }
}

function checkfirst() {
    if (options[random][1][i] === 0) {
        i++;
        document.getElementById("1").style.backgroundColor = "green";
        if (i === 4) {
            document.getElementById("grid").style.backgroundColor = "green";
            solved = true;
        }
    } else if (!solved) {
        bombModule.sendStrike();
    }
}

function checkSecond() {
    if (options[random][1][i] === 1) {
        i++;
        document.getElementById("2").style.backgroundColor = "green";
        if (i === 4) {
            document.getElementById("grid").style.backgroundColor = "green";
            solved = true;
        }
    } else if (!solved) {
        bombModule.sendStrike();
    }
}

function checkThird() {
    if (options[random][1][i] === 2) {
        i++;
        document.getElementById("3").style.backgroundColor = "green";
        if (i === 4) {
            document.getElementById("grid").style.backgroundColor = "green";
            solved = true;
        }
    } else if (!solved) {
        bombModule.sendStrike();
    }
}

function checkFourth() {
    if (options[random][1][i] === 3) {
        i++;
        document.getElementById("4").style.backgroundColor = "green";
        console.log(i);
        if (i === 4) {
            document.getElementById("grid").style.backgroundColor = "green";
            solved = true;
        }
    } else if (!solved) {
        bombModule.sendStrike();
    }
}

document.getElementById("1").addEventListener("click", checkfirst);
document.getElementById("2").addEventListener("click", checkSecond);
document.getElementById("3").addEventListener("click", checkThird);
document.getElementById("4").addEventListener("click", checkFourth);

window.onload = assignImages;