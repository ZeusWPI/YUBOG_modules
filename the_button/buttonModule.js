
import BombModule from "./YUBOG/ModuleLib.js"


const module = new BombModule();


const randomNum = Math.floor(Math.random() * 4);
//returns array numbers in timer
export function timer(module) {
     ms = module.getTimeRemainingMs();
     let minutes = Math.floor(ms / 60000);
     let seconds = Math.floor((ms - minutes * 60000) / 1000);
     if (seconds < 10) {
         seconds = "0" + seconds;
     }
     return minutes + seconds;
}
        
export function clicked() {
     const fillColors = ["yellow","blue","white","red"];
     document.querySelector('#indicator rect').setAttribute("fill", fillColors[randomNum]);
}

export function buttonReleased() {
    document.querySelector('#indicator rect').setAttribute("fill", "grey")
}
// Function to change the button color
function changeButtonColor() {
     const bgcolors = ["yellow","red","white","blue", "black"];
     const colors = ["black", "white","black", "white", "white"];

     let randomNumber = Math.floor(Math.random() * bgcolors.length) 
     const button = document.getElementById("Knop");

     if (button){
          button.style.backgroundColor = bgcolors[randomNumber];
          button.style.color = colors[randomNumber];
          button.style.border = "2px solid " + bgcolors[randomNumber];
     
          const arr = ["Press", "Hold", "Abort", "Detonate"];
          const randomValue = arr[Math.floor(Math.random() * arr.length)];
          button.textContent = randomValue;
     }
}


document.addEventListener("DOMContentLoaded", function() {
    changeButtonColor();

    const button = document.getElementById("Knop");
    if (button) {
        button.addEventListener("mousedown", clicked);
        button.addEventListener("mouseup", buttonReleased);
        button.addEventListener("mouseout", buttonReleased);
    }
});
  
