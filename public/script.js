const socket = io();

const id_speech_recognition = document.querySelector('#speech_recognition');
const id_copy_messages = document.querySelector('#copy_messages');
const id_messages = document.querySelector('#messages');
const id_form_message = document.querySelector('#form_message');
const id_input_message = document.querySelector('#input_message');

let button_hover = false;
let messages_hover = false;
let recognizing;
let recognition;

const userAgent = window.navigator.userAgent.toLowerCase();

const toggleStartStop = () => {
  if (recognizing) {
    recognition.stop();
    reset();
  } else {
    recognition.start();
    recognizing = true;
    id_speech_recognition.innerHTML = '&#x23f9; Click to Stop (Only works in Google Chrome for Desktop)';
    id_speech_recognition.removeAttribute('class', 'playable');
    id_speech_recognition.setAttribute('class', 'rec');
  }
}

const reset = () => {
  recognizing = false;
  id_speech_recognition.innerHTML = '&#x23fa; Click to Speak (Only works in Google Chrome for Desktop)';
  id_speech_recognition.removeAttribute('class', 'rec');
  id_speech_recognition.setAttribute('class', 'playable');
}

// Web Speech API initialization only for Google Chrome for Desktop
if (userAgent.indexOf('chrome') !== -1) {
  if (userAgent.indexOf('edge') === -1) {
    if (userAgent.indexOf('edg') === -1) {
      id_speech_recognition.disabled = false;
      recognition = new webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      reset();
      recognition.onend = reset;
    }
  }
}

id_speech_recognition.addEventListener('mouseenter', (event) => {
  event.preventDefault();
  button_hover = true;
})

id_speech_recognition.addEventListener('mouseleave', (event) => {
  event.preventDefault();
  button_hover = false;
})

id_copy_messages.addEventListener('click', (event) => {
  event.preventDefault();
  setCopyButtonStyle();
  window.setTimeout(clearCopyButtonStyle, 500);
})

id_copy_messages.addEventListener('mouseenter', (event) => {
  event.preventDefault();
  button_hover = true;
})

id_copy_messages.addEventListener('mouseleave', (event) => {
  event.preventDefault();
  button_hover = false;
})

id_messages.addEventListener('mouseenter', (event) => {
  event.preventDefault();
  messages_hover = true;
})

id_messages.addEventListener('mouseleave', (event) => {
  event.preventDefault();
  messages_hover = false;
})

id_form_message.addEventListener('submit', (event) => {
  event.preventDefault();
  if (id_input_message.value !== ''){
    const now_id = Date.now();
    socket.emit('chat message', {
      from: 'text',
      msg: id_input_message.value,
      nowid: now_id,
    });
    id_input_message.value = '';
  }
});

// chat message received
socket.on('chat message', (data) => {
  const message_now = new Date();
  let from = '';
  let li_style = '';
  if ( data.from === 'voice') {
    from = '&#x1f399;';
    li_style = '<li>';
  } else {
    from = '&#x1f4dd;';
    li_style = '<li class="li_text">';
  }
  // HTML formatting
  const chat_message_html = li_style + '(<span class="date">' + message_now.toLocaleDateString() + '&nbsp;' + message_now.toLocaleTimeString() + '</span>)&nbsp;<span class="from">' + from + '</span>&nbsp;<span class="message">' + data.msg + '</span>&nbsp;' + '<span class="thumbs"><button class="thumbs_up_style thumbs_up_button" thumbsup-id="' + data.nowid + '" title="Thumbs Up Button">&#x1f44d;</button><span class="tu_number_zero thumbsup_count" id="thumbsup_' + data.nowid + '">0</span></span>' + '<span class="question"><button class="question_style question_button" question-id="' + data.nowid + '" title="Question Button">&#x2753;</button><span class="qu_number_zero question_count" id="question_' + data.nowid + '">0</span></span></li>';
  id_messages.innerHTML += chat_message_html;

  // add Event Listner on thumbs up and question buttons on each message
  const thumbs_up_button_list = document.querySelectorAll('.thumbs_up_button');
  const question_button_list = document.querySelectorAll('.question_button');

  thumbs_up_button_list.forEach( (thumbs_up_button) => {
    thumbs_up_button.addEventListener('click', (event) => {
      event.preventDefault();
      const thumbsupid = thumbs_up_button.getAttribute('thumbsup-id');
      socket.emit('thumbs up', thumbsupid);
    })
  })

  question_button_list.forEach( (question_button) => {
    question_button.addEventListener('click', (event) => {
      event.preventDefault();
      const questionid = question_button.getAttribute('question-id');
      socket.emit('question', questionid);
    })
  })

  if (button_hover === false && messages_hover === false) {
    window.scrollTo(0, document.body.scrollHeight);
  }
})

// thumbs up click received
socket.on('thumbs up', (thumbsupid) => {
  const id_thumbsupid = document.querySelector('#thumbsup_' + thumbsupid);
  let counter = parseInt(id_thumbsupid.innerText);
  counter = counter + 1;
  id_thumbsupid.innerText = counter.toString();
  if (counter === 1) {
    id_thumbsupid.setAttribute('class', 'thumbs_up_mtone thumbsup_count');
  }
})

// question click received
socket.on('question', (questionid) => {
  const id_questionid = document.querySelector('#question_' + questionid);
  let counter = parseInt(id_questionid.innerText);
  counter = counter + 1;
  id_questionid.innerText = counter.toString();
  if (counter === 1) {
    id_questionid.setAttribute('class', 'question_mtone question_count');
  }
})

// speech recognition result received
if (userAgent.indexOf('chrome') !== -1) {
  if (userAgent.indexOf('edge') === -1) {
    if (userAgent.indexOf('edg') === -1) {
      recognition.onresult = (event) => {
        let final = '';
        const last_result = event.results.length - 1;
        for (let i = 0; i < event.results.length; ++i) {
          // if the result is final, compose transcript and emit the message
          if (event.results[last_result].isFinal) {
            final = event.results[last_result][0].transcript;
          }
        }
        final = final.trim();
        if (final !== '') {
          final = final.charAt(0).toUpperCase() + final.slice(1);
          const now_id = Date.now();
          socket.emit('chat message', {
            from: 'voice',
            msg: final,
            nowid: now_id,
          });
          final = '';
        }
      };
      
      recognition.onend = (event) => {
        // Once Click to Speak is clicked, keep microphone working until manually stopping
        if (recognizing) {
          recognition.start();
        }
      };
    }
  }
}

const clipboardCopy = () => {
  // copy all messages with date data to a copytext variable
  let copytext = '';
  const datelist = document.querySelectorAll('.date');
  const fromlist = document.querySelectorAll('.from');
  const messagelist = document.querySelectorAll('.message');
  const thumbsuplist = document.querySelectorAll('.thumbsup_count');
  const questionlist = document.querySelectorAll('.question_count');
  datelist.forEach((item, index) => {
    // CSV formatting
    copytext += '"' + item.textContent + '","' + fromlist[index].textContent + '","' + messagelist[index].textContent + '","' + thumbsuplist[index].textContent + '","' + questionlist[index].textContent + '"\n';
  });
  // copy the value of the copytext variable to clipboard
  const invisible_textarea = document.createElement('textarea');
  invisible_textarea.value = copytext;
  document.body.appendChild(invisible_textarea);
  invisible_textarea.select();
  document.execCommand('copy');
  invisible_textarea.parentElement.removeChild(invisible_textarea);
}

const setCopyButtonStyle = () => {
  id_copy_messages.disabled = true;
  id_copy_messages.setAttribute('class', 'copy_button_clicked');
}

const clearCopyButtonStyle = () => {
  id_copy_messages.disabled = false;
  id_copy_messages.setAttribute('class', 'copy_button_default');
}