
chrome.runtime.onInstalled.addListener(() => {
  console.log('JIRA Tool Extension installed');
});

chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['src/content.js']
  });
});

async function fetchJiraData(apiUrl, apiKey) {
  const response = await fetch(apiUrl, {
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  });
  return response.json();
}

async function executeSQL(query) {
  // const db = new duckdb.Database();
  // const connection = db.connect();
  // const result = await connection.query(query);
  // return result;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchJiraData') {
    fetchJiraData(request.apiUrl, request.apiKey).then(data => {
      sendResponse({ data });
    });
  } else if (request.action === 'executeSQL') {
    executeSQL(request.query).then(result => {
      sendResponse({ result });
    });
  }
  return true;
});