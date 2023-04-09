import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

// When AI is responding, it displays ...
function loader(element){
  element.textContent = '';

  loadInterval = setInterval(() => {
    element.textContent += '.';

    if(element.textContent === '....'){
      element.textContent = '';
    }
  }, 300)
}

// To type the response character by character
function typeText(element, text){
  let index = 0;

  let interval = setInterval(() => {
    if(index < text.length){
      element.innerHTML += text.charAt(index);
      index++;
    }
    else{ 
      clearInterval(interval);
    }
  }, 20)
}

// Generate unique ID for each msg(AI) to map
function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`
}

// color difference between user question and AI response
function chatStripe (isAi, value, uniqueId) {
  return (
    `
    <div class="wrapper ${isAi && 'ai'}">
      <div class="chat">
        <div class="profile">
          <img
            src = "${isAi? bot : user}" 
            alt = "${isAi? 'bot' : 'user'}"
          />
        </div>
        <div class="message" id=${uniqueId}>
          ${value}  
        </div>
      </div>
    </div>
    `
  )
}

const handleSubmit = async(e) =>{
  // doesn't reload the browser on submit - preventDefault()
  e.preventDefault(); 

  // to get the data typed in the form (textarea)
  const data = new FormData(form);

  // user's chatStripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

  // clear textarea input
  form.reset();

  // bot's chatStripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  // to scrolldown to be able to see the msg
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  // fetch data from the server -> get bot's response
  const response = await fetch('http://localhost:5000',{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt') //data/msg coming from the textarea element on the screen
    })
  })

  // after response is received clear the interval
  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  if(response.ok){
    const data = await response.json(); // gives the actual response coming from the backend
    // to parse the data
    const parsedData = data.bot.trim();

    // console.log({parsedData})

    typeText(messageDiv, parsedData);
  } else{
    const err = await response.text();
    messageDiv.innerHTML = "Something went wrong";
    alert(err);
  }
}

form.addEventListener('submit', handleSubmit);

// to call the handleSubmit on enter key. 13 is the keycode for enter key
form.addEventListener('keyup',(e) => {
  if(e.keyCode === 13){
    handleSubmit(e);
  }
})