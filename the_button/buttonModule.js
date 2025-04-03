
import BombModule from "https://hannes-dev.github.io/YUBOG/ModuleLib.js"


const bombModule = new BombModule();

const button = document.getElementById("Knop");

const randomNum = Math.floor(Math.random() * 4);

let indicatorColor;

let buttonColor;

let buttonText;

let pressed;
        
export function clicked() {
     const fillColors = ["yellow","blue","white","red"];
     indicatorColor = fillColors[randomNum]
     document.querySelector('#rect').setAttribute("fill", indicatorColor);
     pressed = new Date().getTime();
     button.addEventListener("mouseout", buttonReleased);
}

function vowelTest(s) {
    return (/^.*[aeiou].*$/i).test(s);
}


export function buttonReleased() {
    document.querySelector('#rect').setAttribute("fill", "grey")
    console.log(bombModule.getBombTimeString())
    ruleChecks((new Date().getTime()) - pressed, bombModule.getBombTimeString()) ? bombModule.sendSolve() : bombModule.sendStrike();

    button.removeEventListener("mouseout", buttonReleased);
}

function ruleChecks(holdTime, bombTime){
    const heldDown = ((new Date().getTime()) - pressed) > 150

    console.log(buttonColor);
    console.log(buttonText);
    console.log(bombModule.getSerialNumber())
    console.log(vowelTest(bombModule.getSerialNumber()))

    if(buttonColor === "blue" && buttonText === "Abort"){
        if(heldDown){
            return releasingHeldButton(bombTime);
        }
    }else if(bombModule.getTotalBatteries() && buttonText === "Detonate"){
        return !heldDown;
    }else if(buttonColor === "white" && vowelTest(bombModule.getSerialNumber())){
        if(heldDown){
            return releasingHeldButton(bombTime);
        }
    }else if(bombModule.getTotalBatteries() > 2 && bombModule.getTotalModuleAmount() >= 6) {
        return !heldDown;
    }else if(buttonColor === "yellow"){
        if(heldDown){
            return releasingHeldButton(bombTime);
        }
    }else if(buttonColor === "red" && buttonText === "Hold"){
        return !heldDown;
    }else{
        if(heldDown){
            return releasingHeldButton(bombTime);
        }
    }

    return false;

}

function releasingHeldButton(bombTime){
    const dict = {
        "blue": '4',
        "white": '1',
        "yellow": '5'
    }
    if (indicatorColor in dict){
        return bombTime.includes(dict[indicatorColor]);
    }
    //other color
    return bombTime.includes("3")
}


// Function to change the button color
function changeButtonColor() {
     const bgcolors = ["yellow","red","white","blue", "black"];
     const colors = ["black", "white","black", "white", "white"];

     let randomNumber = Math.floor(Math.random() * bgcolors.length) 
     const button = document.getElementById("Knop");

     if (button){
         buttonColor = bgcolors[randomNumber]
         button.style.backgroundColor = buttonColor;
         button.style.color = colors[randomNumber];
         button.style.border = "2px solid " + bgcolors[randomNumber];
     
         const arr = ["Press", "Hold", "Abort", "Detonate"];
         buttonText = arr[Math.floor(Math.random() * arr.length)];
         button.textContent = buttonText;
     }
}


document.addEventListener("DOMContentLoaded", function() {
    changeButtonColor();

    const button = document.getElementById("Knop");
    if (button) {
        button.addEventListener("mousedown", clicked);
        button.addEventListener("mouseup", buttonReleased);
    }
});
  
