'use strict';

function setAlarm(event) {
    const minutes = 1;
    chrome.action.setBadgeText({ text: 'ON' });
    window.close();
  }

let button = document.getElementById('clickMeButton')
button.addEventListener('click', setAlarm);
// document.getElementById('sampleMinute').addEventListener('click', setAlarm);