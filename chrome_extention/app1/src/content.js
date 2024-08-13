chrome.runtime.sendMessage({ action: 'fetchJiraData', apiUrl: 'https://your-jira-instance/api', apiKey: 'your-api-key' }, (response) => {
    console.log('JIRA Data:', response.data);
  });
  
  chrome.runtime.sendMessage({ action: 'executeSQL', query: 'SELECT * FROM your_table' }, (response) => {
    console.log('SQL Result:', response.result);
  });