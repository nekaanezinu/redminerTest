
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-75866057-1', 'auto');
ga('set', 'checkProtocolTask', function(){});
ga('require', 'displayfeatures');
ga('send', 'pageview', '/popup.html');


function setProjects(projects){
  chrome.storage.local.set({
    projects: projects
  });
};

function setPriorities(priorities){
  chrome.storage.local.set({
    priorities: priorities
  });
};


function loadProjects(projects){
  var $projects_select = $('#projects');
  $projects_select.empty();

  $projects_select.append('<option value="">Select project...</option>')

  $.each(projects, function(index, object)
  {
      $projects_select.append('<option value=' + object.id + '>' + object.name + '</option>');
  });

  $("#projects").select2();
  $("#projects").on("change", getAssignables);
};



function loadPriorities(priorities){
  var $priorities_select = $('#priorities');
  $priorities_select.empty();

  $priorities_select.append('<option value="">Select priority...</option>')

  $.each(priorities, function(index, object)
  {
      $priorities_select.append('<option value=' + object.id + '>' + object.name + '</option>');
  });

  $("#priorities").select2();
};



function loadMyPage(redmine_server){
  url = redmine_server + "my/page";
  var $my_page = $('#redmine-page');
  $my_page.attr("href", url);
};



function loadSavedData(){
  chrome.storage.local.get({
    projects: '',
    priorities: '',
    home: '',
    my_page: '',
    redmine_server: 'http://your-redmine-server.com',
    token: 'your redmine API token'
  }, function(items){

    if (items.projects == '') {
      startFromScratch();
    }
    else{
      projects = items.projects;
      priorities = items.priorities;
      home = items.home;
      my_page = items.my_page;
      redmine_server = items.redmine_server;
      token = items.token;


      loadProjects(projects);

      loadPriorities(priorities);

      loadMyPage(redmine_server);
      
      loadLinks();

      getTabUrl();

      clean();
    }
  });
};


function getProjectsForPage(page){
  var xhr = new XMLHttpRequest();

  server = "";
  token = "";

  chrome.storage.local.get({
    redmine_server: 'http://your-redmine-server.com',
    token: 'your redmine API token',
    projects: ''
  }, function(items) {
    server = items.redmine_server;
    token = items.token;
    projects = items.projects;

    url = server + "projects.json?key=" + token + "&page=" + page + "&limit=100";

    xhr.open("GET", url, true);


    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        var resp = JSON.parse(xhr.responseText);

        setProjects(projects.concat(resp.projects));
      }
    }
    xhr.send();

  });
};



function getProjects() {
  var xhr = new XMLHttpRequest();

  server = "";
  token = "";

  chrome.storage.local.get({
    redmine_server: 'http://your-redmine-server.com',
    token: 'your redmine API token'
  }, function(items) {
    server = items.redmine_server;
    token = items.token;

    url = server + "projects.json?key=" + token + "&limit=100";

    xhr.open("GET", url, true);


    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        var resp = JSON.parse(xhr.responseText);

        setProjects(resp.projects);
        getProjectsForPages(Math.ceil(resp.total_count/100));
      }
    }
    xhr.send();
  })
};

function getProjectsForPages(pages){
  for (i = 2; i <= pages; i++) {
    getProjectsForPage(i);
  }
};

function getPriorities(){
  var xhr = new XMLHttpRequest();

  server = "";
  token = "";

  chrome.storage.local.get({
    redmine_server: 'http://your-redmine-server.com',
    token: 'your redmine API token'
  }, function(items) {
    server = items.redmine_server;
    token = items.token;

    url = server + "enumerations/issue_priorities.json?key=" + token;

    xhr.open("GET", url, true);


    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        var resp = JSON.parse(xhr.responseText);

        setPriorities(resp.issue_priorities);
      }
    }
    xhr.send();

  });
};


function getAssignables(){
  var xhr = new XMLHttpRequest();

  server = "";
  token = "";

  chrome.storage.local.get({
    redmine_server: 'http://your-redmine-server.com',
    token: 'your redmine API token'
  }, function(items) {
    server = items.redmine_server;
    token = items.token;
    var project_id = $("#projects").val();

    if(project_id > 0){
      url = server + "projects/" + project_id + "/memberships.json?key=" + token;

      xhr.open("GET", url, true);


      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          // JSON.parse does not evaluate the attacker's scripts.
          var resp = JSON.parse(xhr.responseText);
          var $select = $('#assignables');
          $select.empty();

          $select.append('<option value="">Select user...</option>')

          $.each(resp.memberships,function(index, object)
          {
              $select.append('<option value=' + object.user['id'] + '>' + object.user['name'] + '</option>');
          });

          $("#assignables").select2();
        }
      }
      xhr.send();
    }
  });
};



function getTabUrl(){
  chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
    var $url_field = $('#tab_url');
    $url_field.val(tabs[0].url);
  })
};


function loadMyPageFromScratch(){
  chrome.storage.local.get({
    redmine_server: 'http://your-redmine-server.com',
    token: 'your redmine API token'
  }, function(items) {
    server = items.redmine_server;
    url = server + "my/page";
    var $my_page = $('#redmine-page');
    $my_page.attr("href", url);
  });
};

function loadLinks(){

  var links = document.getElementsByTagName("a");
  for (var i = 0; i < links.length; i++) {
      (function () {
          var ln = links[i];
          var location = ln.href;
          ln.onclick = function () {
            chrome.tabs.create({active: true, url: location});
          };
      })();
  }
};


function saveIssue(){
  server = "";
  token = "";

  chrome.storage.local.get({
    redmine_server: 'http://your-redmine-server.com',
    token: 'your redmine API token'
  }, function(items) {

    server = items.redmine_server;
    token = items.token;


    chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
      var url = server + "issues.json";
      var project_id = $("#projects").val();
      var priority_id = $("#priorities").val();
      var assigned_to_id = $("#assignables").val();
      var current_url = "";

      current_url = tabs[0].url;
      var subject = $("#subject").val().concat(" -> ").concat(current_url.toString());
      var description = "\"Click here to see origin webpage\":" + current_url + " \n " +  $("#description").val();


      $.ajax({
        url: url,
        type: 'POST',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('X-Redmine-API-Key', token);
        },
        data: {
          issue: {
            project_id: parseInt(project_id),
            subject: subject,
            priority_id: priority_id,
            description: description,
            assigned_to_id: assigned_to_id,
            custom_field_values:
              {
                1: url
              }
            }
          },
        success: function () {
          setMessage("Issue was created!!!");
          startFromScratch();
        },
        error: function (data) {
          setMessage("There was an error");
        },
      });
    });

  });
};


function setMessage(new_message) {
  var status = document.getElementById('save');
  status.textContent = new_message;
  setTimeout(function() {
    status.textContent = 'Save';
  }, 1500);
};

function clean(){
  var subject = document.getElementById('subject');
  subject.value = '';

  var description = document.getElementById('description');
  description.value = '';
};

function startFromScratch(){
  getProjects();
  getPriorities();
  getAssignables();
  getTabUrl();
  loadMyPage();
  loadLinks();
  clean();
};



document.addEventListener('DOMContentLoaded', loadSavedData);
document.getElementById('save').addEventListener('click', saveIssue);
document.getElementById('reload').addEventListener('click', startFromScratch);

$("#assignables").select2();
