const socket = io();

/*
const class_thumbs_up_button = document.querySelector('.thumbs_up_button');
const class_question_button = document.querySelector('.question_button');
*/
// variables: chat message submit
const id_form_message = document.querySelector('#form_message');
const id_input_message = document.querySelector('#input_message');
// variables: chat message received
const id_messages = document.querySelector('#messages');
// variables: 
const id_speech_recognition = document.querySelector('#speech_recognition');
const id_copy_messages = document.querySelector('#copy_messages');

let button_hover = false;
let messages_hover = false;

const userAgent = window.navigator.userAgent.toLowerCase();

if (userAgent.indexOf('chrome') != -1) {
  let recognizing = false;
  const recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  reset();
  recognition.onend = reset;
}

/**
class_thumbs_up_button.addEventListener('click', (event) => {
  event.preventDefault();
  const thumbsupid = class_thumbs_up_button.getAttribute('data-id');
  socket.emit('thumbs up', thumbsupid);
})

class_question_button.addEventListener('click', (event) => {
  event.preventDefault();
  const questionid = class_question_button.getAttribute('data-id');
  socket.emit('question', questionid);
})
*/

id_copy_messages.addEventListener('click', (event) => {
  event.preventDefault();
  setCopyButtonStyle();
  const timeoutID = window.setTimeout(clearCopyButtonStyle, 500);
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

// chat message submit event lister
id_form_message.addEventListener('submit', (event) => {
  event.preventDefault();
  const now_id = Date.now();
  socket.emit('chat message', {
    from: 'text',
    msg: id_input_message.value,
    nowid: now_id,
  });
  id_input_message.value = '';
});

// chat message received
socket.on('chat message', (data) => {
  const message_now = new Date();
  let from = '';
  let li_style = '';
  if ( data.form === 'voice') {
    from = '&#x1f399;';
    li_style = '<li>';
  } else {
    from = '&#x1f4dd;';
    li_style = '<li class="li_text">';
  }
  const chat_message_html = li_style + '(<span class="date">' + message_now.toLocaleDateString() + '&nbsp;' + message_now.toLocaleTimeString() + '</span>)&nbsp;<span class="from">' + from + '</span>&nbsp;<span class="message">' + data.msg + '</span>&nbsp;' + '<span class="thumbs"><button class="thumbs_up_style thumbs_up_button" data-id="' + data.nowid + '" title="Thumbs Up Button">&#x1f44d;</button><span class="tu_number_zero thumbsup_count" id="thumbsup_' + data.nowid + '">0</span></span>' + '<span class="question"><button class="question_style question_button" data-id="' + data.nowid + '" title="Question Button">&#x2753;</button><span class="qu_number_zero question_count" id="question_' + data.nowid + '">0</span></span></li>';
  id_messages.append(chat_message_html);
  if (button_hover == false && messages_hover == false) {
    window.scrollTo(0, document.body.scrollHeight);
  }
})

// thumbs up received
socket.on('thumbs up', (thumbsupid) => {
  const id_thumbsupid = document.querySelector('#' + thumbsupid);
  let counter = parseInt(id_thumbsupid.value);
  counter = counter + 1;
  id_thumbsupid.value = counter.toString();
  id_thumbsupid.setAttribute('class', 'thumbs_up_mtone');
})

// question received
socket.on('question', (questionid) => {
  const id_questionid = document.querySelector('#' + questionid);
  let counter = parseInt(id_questionid.value);
  counter = counter + 1;
  id_questionid.value = counter.toString();
  id_questionid.setAttribute('class', 'question_mtone');
})

// speech recognition result received
if (userAgent.indexOf("chrome") != -1) {
  recognition.onresult = (event) => {
    let final = '';
    const last_result = event.results.length - 1;
    if (event.results[last_result].isFinal) {
      final = event.results[last_result][0].transcript;
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
    // Once Click to Speak is fired, keep microphone working until manually stopping
    if (recognizing) {
      recognition.start();
    }
  };
}

const reset = () => {
  recognizing = false;
  id_speech_recognition.value = '&#x23fa; Click to Speak (Only works in Google Chrome for Desktop)';
  id_speech_recognition.removeAttribute('class', 'rec');
}

const toggleStartStop = () => {
  if (recognizing) {
    recognition.stop();
    reset();
  } else {
    recognition.start();
    recognizing = true;
    id_speech_recognition.value = '&#x23f9; Click to Stop (Only works in Google Chrome for Desktop)';
    id_speech_recognition.setAttribute('class', 'rec');
  }
}



// copy all messages to clipboard
const clipboardCopy = () => {
  // copy all messages with date data to a copytext variable
  let copytext = "";
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

// copy button is click
const copybutton = document.querySelector('#copy_messages');
const setCopyButtonStyle = () => {
  copybutton.disabled = true;
  copybutton.setAttribute('class', 'copy_button_clicked');
}

// clear copy button style
const clearCopyButtonStyle = () => {
  copybutton.disabled = false;
  copybutton.setAttribute('class', 'copy_button_default');
}