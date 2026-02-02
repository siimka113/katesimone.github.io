let wordIndex = 0;
const words = ["PEOPLE", "TECHNICIANS", "DOCTORS", "EDUCATORS", "VOLUNTEERS", "OPERATORS"];

function changeText() {
  const paragraphElement = document.getElementById("rotating-text");

  paragraphElement.classList.remove('animate-swap');
  void paragraphElement.offsetWidth; 
  paragraphElement.classList.add('animate-swap');

  setTimeout(() => {
    wordIndex = (wordIndex + 1) % words.length; 
    paragraphElement.textContent = words[wordIndex];
  }, 250);
}

setInterval(changeText, 1200); 

function updateTime() {
  const timeElement = document.querySelector('.time');
  const options = { 
    timeZone: 'America/Vancouver', 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false 
  };
  const formatter = new Intl.DateTimeFormat('en-CA', options); 
  const currentTime = formatter.format(new Date());
  
  timeElement.textContent = currentTime;
}
updateTime(); 
setInterval(updateTime, 1000);

