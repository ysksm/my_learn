

let btnRequestAPI = document.getElementById('btnRequestAPI');
btnRequestAPI.addEventListener('click', function() {
  console.log('btnRequestAPI clicked');
  fetch('https://**.atlassian.net/rest/api/3/field')
  .then(response => response.json())
  .then(json => {
    console.log(json);
    document.getElementById('logArea').innerHTML = JSON.stringify(json);

  });
});