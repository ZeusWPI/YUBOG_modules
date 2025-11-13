
import BombModule from "https://hannes-dev.github.io/YUBOG/ModuleLib.js";
const bombModule = new BombModule();

const colors = [
  "red", "orange", "yellow", "blue", "green", "purple", "pink"
]

const sentences = [
  "Speed matters when the bomb is ticking. Type fast but do not make any mistakes.",
  "A second too slow and you might get a strike. But be aware! Accurracy is just important as speed.",
];

let currentSentenceIndex = 0;
let startTime = null;
let speedRequirement;
let speedMode;
let firstKeypress = false;
let solved = false;

const typingInput = document.getElementById("typing-input");
const sentenceDisplay = document.getElementById("line1");
const speedText = document.getElementById("speed-requirement");
const messageBox = document.getElementById("message");
const circles = document.querySelectorAll(".circle");
const progressText = document.getElementById("progress-text");

function setupModule() {
  currentSentenceIndex = 0;
  startTime = null;

  resetLights();
  generateSpeedRequirement();
  displaySentence();
}

function resetLights() {
  circles.forEach(circle => {
    circle.style.background = "white";
  });
}
function generateSpeedRequirement() {
  speedRequirement = Math.floor(Math.random() * (80 - 20) + 20);
  speedText.textContent = `${speedRequirement} WPM`;

  const chosenColors = []

  circles.forEach(circle => {
    const chosenColor = colors[Math.floor(Math.random() * colors.length)];
    chosenColors.push(chosenColor);
    let color = chosenColor;
    circle.style.background = color;
  });

  setSpeedMode(chosenColors);
}

function updateProgress() {
  progressText.textContent = `${currentSentenceIndex + 1} / ${sentences.length}`;
}

function displaySentence() {
  sentenceDisplay.textContent = sentences[currentSentenceIndex]; typingInput.value = "";
  typingInput.focus();
  firstKeypress = false;
  updateProgress();
}

typingInput.addEventListener("keydown", function (event) {
  if (!firstKeypress) {
    startTime = Date.now();
    firstKeypress = true;
  }

  if (event.key === "Enter") {
    event.preventDefault();
    checkSentence();
  }
});

function checkSentence() {
  if (solved) return;

  let userInput = typingInput.value.trim();
  let correctSentence = sentences[currentSentenceIndex];

  if (userInput !== correctSentence) {
    sendStrike("❌ Typing Error!")
    return;
  }

  let elapsedTime = (Date.now() - startTime) / 1000;
  let wpm = Math.round((correctSentence.split(" ").length / elapsedTime) * 60);

  if (wpm > 150) {
    sendStrike("❌ No copying!");
    return;
  }

  let passed = false;
  if (speedMode === "faster") {
    passed = wpm > speedRequirement;
  } else {
    passed = wpm < speedRequirement;
  }

  if (!passed) {
    sendStrike(`❌ Wrong Speed! You typed at ${wpm} WPM.`)
    return;
  }

  currentSentenceIndex++;
  if (currentSentenceIndex < sentences.length) {
    messageBox.textContent = `✅ Speed: ${wpm} WPM`;
    messageBox.style.color = "green";

    generateSpeedRequirement();
    displaySentence();
    return
  }

  bombModule.sendSolve();
  messageBox.textContent = "🎉 Module Solved!";
  messageBox.style.color = "gold";
  solved = true;
}

function sendStrike(msg) {
  bombModule.sendStrike()
  messageBox.textContent = msg;
  messageBox.style.color = "red";
  setupModule();
}

function setSpeedMode(colors) {
  speedMode = "faster"

  if (!colors.includes("yellow")) {
    speedMode = "slower";
  }
  if (colors.includes("purple")) {
    speedMode = "faster";
  }
  if (colors[2] === "blue") {
    speedMode = "slower";
  }
  if (colors[1] === "green" && !colors.includes("red")) {
    speedMode = "faster";
  }
  if (colors[2] === "pink" && colors[0] !== "blue" && colors[0] !== "green") {
    speedMode = "faster";
  }
  if (colors[2] === "orange" && colors[0] !== "green") {
    speedMode = "slower";
  }
  if (colors[0] === "blue" && colors[1] === "green") {
    speedMode = "faster";
  }

  if (colors[0] === "orange") {
    if (speedMode === "faster") {
      speedMode = "slower";
    } else {
      speedMode = "faster";
    }
  }

}

setupModule();

