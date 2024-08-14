'use strict';

function setAlarm(event) {
    const minutes = 1;
    chrome.action.setBadgeText({ text: 'ON' });
    window.close();
  }

let button = document.getElementById('clickMeButton')
button.addEventListener('click', setAlarm);
// document.getElementById('sampleMinute').addEventListener('click', setAlarm);

let button1 = document.getElementById('button1');
button1.addEventListener('click', function() {
  console.log('button1 clicked');
});

let btnOpenSideBar = document.getElementById('btnOpenSideBar');
btnOpenSideBar.addEventListener('click', function() {
  console.log('btnOpenSideBar clicked');
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const tab = tabs[0];
    chrome.sidePanel.open({
      windowId: window.id,
      tabId: tab.id
    });
  });

});

let btnRequestAPI = document.getElementById('btnRequestAPI');
btnRequestAPI.addEventListener('click', function() {

  let organization = document.getElementById('organization').value;
  let url = `https://${organization}.atlassian.net/rest/api/3/field`;

  console.log('btnRequestAPI clicked');
  fetch(url)
  .then(response => response.json())
  .then(json => console.log(json));
});


