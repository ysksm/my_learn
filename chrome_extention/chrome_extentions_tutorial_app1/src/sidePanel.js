

let btnRequestAPI = document.getElementById('btnRequestAPI');
btnRequestAPI.addEventListener('click', function() {
  console.log('btnRequestAPI clicked');

  

  let organization = document.getElementById('organization').value;

  console.log(organization);
  const host= `https://${organization}.atlassian.net/`;
  const apipath = 'rest/api/3/search';
  const jql = 'project = todo AND status = "To Do"';
  let startAt = 0;
  let maxResults = 10;
  const fields = 'summary,description';
  const expand = 'changelog,names'
  let request_path = `?jql=${jql}&startAt=${startAt}&maxResults=${maxResults}&fields=${fields}&expand=${expand}`

  let url = `${host}${apipath}${request_path}`

  fetch(url)
  .then(response => response.json())
  .then(json => {
    console.log(json);
    const logArea = document.getElementById('logArea');
    const issues = json.issues;
    for (let issue of issues) {
      console.log(issue.key);
      console.log(issue.fields.summary);
      console.log(issue.fields.description);
      logArea.innerHTML += `<div>${issue.key}: ${issue.fields.summary}</div>`;
    }

  });
});

let btnLocalRequestAPI = document.getElementById('btnLocalRequestAPI');
btnLocalRequestAPI.addEventListener('click', function() {
  console.log('btnLocalRequestAPI clicked');
  const url = 'http://localhost/data.json';

  fetch(url)
  .then(response => response.json())
  .then(json => {
    console.log(json);
    const logArea2 = document.getElementById('logArea2');
    logArea2.innerHTML = JSON.stringify(json);
  });
});


