let button_hover = false;
let messages_hover = false;
const userAgent = window.navigator.userAgent.toLowerCase();
if (userAgent.indexOf("chrome") != -1) {
  let recognizing;
  const recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  reset();
  recognition.onend = reset;
}

$(function () {
  const socket = io();

  // like button is clicked
  $(document).on("click", ".thumbs_up_button", function () {
    socket.emit("thumbs up", $(this).data("id"));
  });

  // question button is clicked
  $(document).on("click", ".question_button", function () {
    socket.emit("question", $(this).data("id"));
  });

  // copy messages to clipboard button is clicked
  $(document).on("click", "#copy", function () {
    let timeoutID;
    setCopyButtonStyle();
    timeoutID = window.setTimeout(clearCopyButtonStyle, 500);
  });

  // copy reactions to clipboard button is clicked
  $(document).on("click", "#copy_reaction", function () {
    let timeoutID;
    setCopyReactionButtonStyle();
    timeoutID = window.setTimeout(clearCopyReactionButtonStyle, 500);
  });

  // caputre hovering state of #button
  $("#button").hover(
    () => {
      button_hover = true;
    },
    () => {
      button_hover = false;
    }
  );

  // caputre hovering state of #messages
  $("#messages").hover(
    () => {
      messages_hover = true;
    },
    () => {
      messages_hover = false;
    }
  );

  // chat messge is submitted
  $("form").submit(function () {
    if ($("#m").val() != "") {
      const now_id = Date.now();
      socket.emit("chat message", {
        from: "text",
        msg: $("#m").val(),
        nowid: now_id,
      });
      $("#m").val("");
    }
    return false;
  });

  // chat message is received
  socket.on("chat message", function (data) {
    const now = new Date();
    let from = "";
    let li_style = "";
    if (data.from == "voice") {
      from = "&#x1f399;";
      li_style = "<li>";
    } else {
      from = "&#x1f4dd;";
      li_style = "<li class='li_text'>";
    }
    $("#messages").append(
      li_style +
        "(<span class='date'>" +
        now.toLocaleDateString() +
        " " +
        now.toLocaleTimeString() +
        "</span>) <span class='from'>" +
        from +
        "</span> <span class='message'>" +
        data.msg +
        "</span> " +
        "<span class='thumbs'><button class='thumbs_up_style thumbs_up_button' data-id='" +
        data.nowid +
        "' title='Thumbs Up Button'>&#x1f44d;</button><span class='tu_number_zero thumbsup_count' id='thumbsup_" +
        data.nowid +
        "'>0</span></span>" +
        "<span class='question'><button class='question_style question_button' data-id='" +
        data.nowid +
        "' title='Question Button'>&#x2753;</button><span class='qu_number_zero question_count' id='question_" +
        data.nowid +
        "'>0</span></span></li>"
    );
    if (button_hover == false && messages_hover == false) {
      window.scrollTo(0, document.body.scrollHeight);
    }
  });

  // thumbs up is clicked
  socket.on("thumbs up", function (id) {
    const thumbsid = "thumbsup_" + id;
    console.log(document);
    let counter = parseInt(document.getElementById(thumbsid).textContent);
    counter = counter + 1;
    document.getElementById(thumbsid).textContent = counter.toString();
    document
      .getElementById(thumbsid)
      .setAttribute("style", "color:red;font-weight:bold;");

    if (button_hover == false && messages_hover == false) {
      window.scrollTo(0, document.body.scrollHeight);
    }
  });
  // question is clicked
  socket.on("question", function (id) {
    const questionid = "question_" + id;
    console.log(document);
    var counter = parseInt(
      document.getElementById(questionid).textContent
    );
    counter = counter + 1;
    document.getElementById(questionid).textContent = counter.toString();
    document
      .getElementById(questionid)
      .setAttribute("style", "color:red;font-weight:bold;");
    if (button_hover == false && messages_hover == false) {
      window.scrollTo(0, document.body.scrollHeight);
    }
  });

  if (userAgent.indexOf("chrome") != -1) {
    recognition.onresult = function (event) {
      let final = "";
      const last_result = event.results.length - 1;
      for (var i = 0; i < event.results.length; ++i) {
        if (event.results[last_result].isFinal) {
          final = event.results[last_result][0].transcript;
        }
      }
      final = final.trim();
      if (final != "") {
        final = final.charAt(0).toUpperCase() + final.slice(1);
        const now_id = Date.now();
        socket.emit("chat message", {
          from: "voice",
          msg: final,
          nowid: now_id,
        });
        final = "";
      }
    };

    recognition.onend = function (event) {
      // Once Click to Speak is fired, keep microphone working until manually stopping
      if (recognizing) {
        recognition.start();
      }
    };
  }
});

const reset = () => {
  recognizing = false;
  button.innerHTML =
    "&#x23fa; Click to Speak (Only works in Google Chrome for Desktop)";
  button.setAttribute("style", "color:black;background-color:white;");
  button.removeAttribute("class", "rec");
}

const toggleStartStop = () => {
  if (recognizing) {
    recognition.stop();
    reset();
  } else {
    recognition.start();
    recognizing = true;
    button.innerHTML =
      "&#x23f9; Click to Stop (Only works in Google Chrome for Desktop)";
    button.setAttribute("style", "color:white;background-color:red;");
    button.setAttribute("class", "rec");
  }
}

// copy all messages to clipboard
const clipboardCopy = () => {
  // copy all messages with date data to a copytext variable
  let copytext = "";
  const datelist = document.querySelectorAll(".date");
  const fromlist = document.querySelectorAll(".from");
  const messagelist = document.querySelectorAll(".message");
  const thumbsuplist = document.querySelectorAll(".thumbsup_count");
  const questionlist = document.querySelectorAll(".question_count");
  datelist.forEach(function (item, index) {
    // CSV formatting
    copytext +=
      '"' +
      item.textContent +
      '","' +
      fromlist[index].textContent +
      '","' +
      messagelist[index].textContent +
      '","' +
      thumbsuplist[index].textContent +
      '","' +
      questionlist[index].textContent +
      '"\n';
  });
  // copy the value of the copytext variable to clipboard
  const ta = document.createElement("textarea");
  ta.value = copytext;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  ta.parentElement.removeChild(ta);
}

// copy button is click
const copybutton = document.querySelector("#copy");
const setCopyButtonStyle = () => {
  copybutton.disabled = true;
  copybutton.setAttribute("style", "color:white;background-color:red;");
}
const clearCopyButtonStyle = () => {
  copybutton.disabled = false;
  copybutton.setAttribute("style", "color:black;background-color:white;");
}