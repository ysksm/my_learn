import './sw-omnibox.js';
import './sw-tips.js';


// function setupContextMenu() {
//     chrome.contextMenus.create({
//       id: 'define-word',
//       title: 'Define',
//       contexts: ['selection']
//     });
//   }
  
//   chrome.runtime.onInstalled.addListener(() => {
//     setupContextMenu();
//   });
  
//   chrome.contextMenus.onClicked.addListener((data, tab) => {
//     // Store the last word in chrome.storage.session.
//     chrome.storage.session.set({ lastWord: data.selectionText });
  
//     // Make sure the side panel is open.
//     chrome.sidePanel.open({ tabId: tab.id });
//   });
  