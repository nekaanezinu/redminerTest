
// Saves options to chrome.storage.local.
function saveOptions() {
  var redmine_server = document.getElementById('redmine_server').value;
  var lastChar = redmine_server.substr(redmine_server.length - 1);

  if(lastChar != '/'){
    redmine_server = redmine_server + '/';
  };

  var token = document.getElementById('token').value;

  chrome.storage.local.set({
    redmine_server: redmine_server,
    token: token
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
};

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.local.get({
    redmine_server: 'http://your-redmine-server.com/',
    token: 'your redmine API token'
  }, function(items) {
    document.getElementById('redmine_server').value = items.redmine_server;
    document.getElementById('token').value = items.token;
  });
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
