/**
 * REST Client
 *
 */
const url = new URL(window.location.href);
console.log(url.pathname);


if (url.pathname == '/')
{

    function loginUser()
    {
        var form = document.getElementById("form");
        var username = form.username.value;
        var password = form.password.value;
        console.log(username + " " + password);

        var credentials = window.btoa(username+":"+password);
        var auth = "Basic " + credentials;

        var req = new XMLHttpRequest();
        req.open("GET", "/api/user/");
        req.setRequestHeader("Content-Type", "application/json");
        req.setRequestHeader("Authorization", auth);
        req.send()

        req.onreadystatechange = function()
        {
            if (req.readyState != XMLHttpRequest.DONE)
            {
                return;
            }

            if (req.status == 200 && req.responseText != null)
            {
                window.location.replace("http://localhost:8000/user-projects-tasks");
            }
            else if(req.status == 403)
            {
                document.getElementById("collapsed").style.display = "block";
            }
        };
    }
}
else if (url.pathname == '/register')
{

    function userRegister()
    {
        var form = document.getElementById("register_form");
        var name = form.name.value;
        var email = form.email.value;
        var username = form.username.value;
        var password = form.password.value;
        console.log(name + " " + email + " " + username + " " + password);

        var values = {
            'name': name,
            'email': email,
            'username': username,
            'password': password
        }

        var req = new XMLHttpRequest();
        req.open("POST", "/api/user/register/");
        req.setRequestHeader("Content-Type", "application/json");
        req.send(JSON.stringify(values))

        req.onreadystatechange = function()
        {
            if (req.readyState != XMLHttpRequest.DONE)
            {
                return;
            }

            if (req.status == 201)
            {
                var style = document.createElement('style');
                style.innerHTML = "#register-success { display: block !important; }"
                document.head.appendChild(style);
                form.reset();
                setTimeout(() => { window.location.replace("http://localhost:8000");}, 2000);
            }
            else if(req.status == 404)
            {
                document.getElementById("register-danger").style.display = "block !important";
            }
        };
    }

}
else if (url.pathname == '/user-projects-tasks')
{
    function fetchProjects()
    {
        var username = document.getElementById("username-fetch-info").value;
        var password =  document.getElementById("password-fetch-info").value;

        var project_div = document.getElementById("dump_projects_info");

        console.log(username + ' ' + password)

        var credentials = window.btoa(username+":"+password);
        var auth = "Basic " + credentials;

        var req = new XMLHttpRequest();
        req.open("GET", "/api/projects/");
        req.setRequestHeader("Content-Type", "application/json");
        req.setRequestHeader("Authorization", auth);
        req.send()

        req.onreadystatechange = function()
        {
            if (req.readyState != XMLHttpRequest.DONE)
            {
                return;
            }

            if (req.status == 200 && req.responseText != null)
            {
                 var projects = JSON.parse(req.responseText);
                 project_div.innerHTML = '';
                 localStorage['projects'] = req.responseText;

                  for (var i in projects) {
                    var div = document.createElement('div');
                    div.className = 'col-lg-12';
                    div.style = 'margin-top: 10px';

                    var card_border = document.createElement('div');
                    card_border.className = 'card border-left-primary shadow h-100 py-2';
                    div.appendChild(card_border);

                    var card_body = document.createElement('div');
                    card_body.className = 'card-body';
                    card_border.appendChild(card_body);

                    var row = document.createElement('div');
                    row.className = 'row no-gutters align-items-center';
                    card_body.appendChild(row);

                    var col = document.createElement('div');
                    col.className = 'col-lg-7';
                    row.appendChild(col);

                    var h5_mb_1 = document.createElement('div');
                    h5_mb_1.className = 'h5  mb-1 project_title';
                    h5_mb_1.innerHTML = projects[i].title;
                    col.appendChild(h5_mb_1);

                    var h5_mb_2 = document.createElement('div');
                    h5_mb_2.className = 'project_info';
                    h5_mb_2.innerHTML = 'Creation date: '+projects[i].creation_date+'  Last Updated: '+projects[i].last_updated+'';
                    col.appendChild(h5_mb_2);

                    var col_auto = document.createElement('div');
                    col_auto.className = 'col-auto';
                    col_auto.innerHTML = '<button class="delete_button btn btn-danger btn-icon-split" onclick="deleteProject('+projects[i].id+')" style="margin-top: 20px;"><span class="icon text-white-50"><i class="fa fa-trash"></i></span><span class="text">Delete Project</span></button>';
                    col_auto.innerHTML += '<button class="load_tasks_button btn btn-primary btn-icon-split" onclick="getTasks('+projects[i].id+')" style="margin-top: 20px;"><span class="icon text-white-50"><i class="fa fa-trash"></i></span><span class="text">Load Tasks</span></button>';
                    col_auto.innerHTML += '<button class="load_info btn btn-primary btn-icon-split" onclick="getInfoProjectModal('+projects[i].id+'); delayModal2();" style="margin-top: 20px; margin-left:20px;"><span class="icon text-white-50"><i class="fa fa-pencil"></i></span><span class="text">Change Information</span></button>';
                    row.appendChild(col_auto);

                    var task_project_select = document.getElementById("project");
                    var option = document.createElement("option");
                    option.text = projects[i].title;
                    option.id = projects[i].title;
                    option.value = projects[i].id;
                    task_project_select.add(option);

                    project_div.appendChild(div);
                }
            }
            else if(req.status == 403)
            {
                window.location.replace("http://localhost:8000/logout");
            }
            else if(req.status == 404)
            {
               project_div.innerHTML = ''

               var col_lg_12 = document.createElement('div');
               col_lg_12.className = 'col-lg-12';

               var span = document.createElement('span');
               span.className = 'no-projects_found';
               span.innerHTML = 'You have no projects';
               col_lg_12.appendChild(span);

               project_div.appendChild(col_lg_12);
            }
        };
    }

    fetchProjects();

    function deleteProject(id)
    {
        var r = confirm("Are you sure you want to delete this project?");

        if (r == true)
        {
            var username = document.getElementById("username-fetch-info").value;
            var password =  document.getElementById("password-fetch-info").value;

            console.log(username + ' ' + password)

            var credentials = window.btoa(username+":"+password);
            var auth = "Basic " + credentials;

            var req = new XMLHttpRequest();
            req.open("DELETE", "/api/projects/" + id + "/");
            req.setRequestHeader("Content-Type", "application/json");
            req.setRequestHeader("Authorization", auth);
            req.send()

            req.onreadystatechange = function()
            {
                if (req.readyState != XMLHttpRequest.DONE)
                {
                    return;
                }

                if (req.status == 200 && req.responseText != null)
                {
                    fetchProjects();
                }
                else if(req.status == 403)
                {
                    window.location.replace("http://localhost:8000/logout");
                }
            };
        }
    }

    function getTasks(id)
    {
        var username = document.getElementById("username-fetch-info").value;
        var password =  document.getElementById("password-fetch-info").value;

        console.log(username + ' ' + password)

        var tasks_div = document.getElementById("dump_project_tasks_info");

        var credentials = window.btoa(username+":"+password);
        var auth = "Basic " + credentials;

        var req = new XMLHttpRequest();
        req.open("GET", "/api/projects/" + id + "/tasks/");
        req.setRequestHeader("Content-Type", "application/json");
        req.setRequestHeader("Authorization", auth);
        req.send()

        req.onreadystatechange = function()
        {
            if (req.readyState != XMLHttpRequest.DONE)
            {
                return;
            }

            if (req.status == 200 && req.responseText != null)
            {

                var tasks = JSON.parse(req.responseText);
                tasks_div.innerHTML = '';
                document.getElementById("no_tasks_found").innerHTML = "";

                 for (var i in tasks)
                 {
                    var div = document.createElement('div');
                    div.className = 'col-lg-12';
                    div.style = 'margin-top: 10px';


                    var card_border = document.createElement('div');
                    card_border.className = 'card danger shadow h-100 py-2';


                    div.appendChild(card_border);

                    var card_body = document.createElement('div');
                    card_body.className = 'card-body';
                    card_border.appendChild(card_body);

                    var row = document.createElement('div');
                    row.className = 'row no-gutters align-items-center';
                    card_body.appendChild(row);

                    var col = document.createElement('div');
                    col.className = 'col-lg-6';
                    row.appendChild(col);

                    var h5_mb_1 = document.createElement('div');
                    h5_mb_1.className = 'h5  mb-1 project_title';
                    h5_mb_1.innerHTML = tasks[i].title;
                    col.appendChild(h5_mb_1);

                    var h5_mb_2 = document.createElement('div');
                    h5_mb_2.className = 'project_info';
                    h5_mb_2.innerHTML = 'Creation date: ' + tasks[i].creation_date + ' Task: Uncompleted';

                    if (tasks[i].completed == 1)
                    {
                            card_border.className = 'card success shadow h-100 py-2';
                            h5_mb_2.innerHTML = 'Creation date: ' + tasks[i].creation_date + ' Task: Completed';
                    }

                    col.appendChild(h5_mb_2);


                    var col_auto = document.createElement('div');
                    col_auto.className = 'col-auto';
                    col_auto.innerHTML = '<button class="delete_button btn btn-light btn-icon-split" onclick="deleteTask('+ tasks[i].id +', '+ tasks[i].project_id + ')"><span class="icon text-white-50"><i class="fa fa-trash"></i></span><span class="text">Delete Task</span></button>';
                    col_auto.innerHTML += '<button id="loadTask" class="load_tasks_button btn btn-light btn-icon-split" style="margin-left: 10px;" onclick="getInfoTaskModal('+ tasks[i].id +', '+ tasks[i].project_id + '); delayModal();"><span class="icon text-white-50"><i class="fa fa-pencil"></i></span><span class="text">Change Information</span></button>';

                    row.appendChild(col_auto);


                    tasks_div.appendChild(div)
                 }

                console.log(req.responseText)
            }
            else if(req.status == 403)
            {
                window.location.replace("http://localhost:8000/logout");
            }
            else if(req.status == 404)
            {
                 document.getElementById("no_tasks_found").innerHTML = "This Project has no tasks";
                 tasks_div.innerHTML = '';
            }

        };


    }

    function deleteTask(id, project_id)
    {
        var r = confirm("Are you sure you want to delete this task?");

        if (r == true)
        {
            var username = document.getElementById("username-fetch-info").value;
            var password =  document.getElementById("password-fetch-info").value;

            console.log(username + ' ' + password)

            var credentials = window.btoa(username+":"+password);
            var auth = "Basic " + credentials;

            var req = new XMLHttpRequest();
            req.open("DELETE", "/api/projects/"+ project_id + "/tasks/"+ id + "/");
            req.setRequestHeader("Content-Type", "application/json");
            req.setRequestHeader("Authorization", auth);
            req.send()

            req.onreadystatechange = function()
            {
                if (req.readyState != XMLHttpRequest.DONE)
                {
                    return;
                }

                if (req.status == 200 && req.responseText != null)
                {
                    getTasks(project_id);
                }
                else if(req.status == 403)
                {
                    window.location.replace("http://localhost:8000/logout");
                }
            };
        }
    }

    function getInfoTaskModal(id, project_id)
    {
        var username = document.getElementById("username-fetch-info").value;
        var password =  document.getElementById("password-fetch-info").value;

        console.log(username + ' ' + password)

        var credentials = window.btoa(username+":"+password);
        var auth = "Basic " + credentials;

        var req = new XMLHttpRequest();
        req.open("GET", "/api/projects/"+ project_id + "/tasks/"+ id + "/");
        req.setRequestHeader("Content-Type", "application/json");
        req.setRequestHeader("Authorization", auth);
        req.send()

        req.onreadystatechange = function()
        {
            if (req.readyState != XMLHttpRequest.DONE)
            {
                return;
            }

            if (req.status == 200 && req.responseText != null)
            {
                var task = JSON.parse(req.responseText);

                document.getElementById("task_id").value = task['id'];
                document.getElementById("task_title").value = task['title'];
                document.getElementById("title_one").innerHTML = task['title'];
                document.getElementById("creation_date").value = task['creation_date'];

                document.getElementById("creation_date").value = task['creation_date'];

                if(task['completed'] == 1)
                {
                    document.getElementById("completed").options.item(0).setAttribute('selected', true);
                }
                else
                {
                    document.getElementById("completed").options.item(1).setAttribute('selected', true);
                }

                var projects = JSON.parse(localStorage['projects']);

                for (var i in projects){
                       if(projects[i].id == task['project_id'])
                           document.getElementById("project").options.namedItem(''+projects[i].title+'').setAttribute('selected', true);
                }

            }
            else if(req.status == 403)
            {
                window.location.replace("http://localhost:8000/logout");
            }
        };

    }

    function updateTask()
    {
        var username = document.getElementById("username-fetch-info").value;
        var password =  document.getElementById("password-fetch-info").value;
        var id = document.getElementById("task_id").value;

        var form = document.getElementById("form_updateTask");
        var title = form.title.value;
        var creation_date = form.creation_date.value;
        var project = form.project.value;
        var completed = form.completed.value;
        console.log(id +" "+ title + " " + creation_date + " " + project + " " + completed);

        var credentials = window.btoa(username+":"+password);
        var auth = "Basic " + credentials;

        var values = {
            'title': title,
            'creation_date': creation_date,
            'project_id': project,
            'completed': completed
        }
        console.log(values);

        var req = new XMLHttpRequest();
        req.open("PUT", "/api/projects/" + project + "/tasks/"+ id +"/");
         req.setRequestHeader("Content-Type", "application/json");
        req.setRequestHeader("Authorization", auth);
        req.send(JSON.stringify(values))

        req.onreadystatechange = function()
        {
            if (req.readyState != XMLHttpRequest.DONE)
            {
                return;
            }

            if (req.status == 200 && req.responseText != null)
            {
               getTasks(project);
               getInfoTaskModal(id, project)

            }
            else if(req.status == 404)
            {
                document.getElementById("register-danger").style.display = "block !important";
            }
        };

    }

    function addProject()
    {
        var username = document.getElementById("username-fetch-info").value;
        var password =  document.getElementById("password-fetch-info").value;

        var form = document.getElementById("insert_project");
        var user = document.getElementById("project_user_id").value;
        var title = form.title.value;
        var creation_date = form.creation_date.value;
        var last_updated = form.last_updated.value;
        console.log(user +" "+ title + " " + creation_date + " " + last_updated);

        var credentials = window.btoa(username+":"+password);
        var auth = "Basic " + credentials;

        var values = {
            'user_id': user,
            'title': title,
            'creation_date': creation_date,
            'last_updated': last_updated
        }
        console.log(values);

        var req = new XMLHttpRequest();
        req.open("POST", "/api/projects/");
        req.setRequestHeader("Content-Type", "application/json");
        req.setRequestHeader("Authorization", auth);
        req.send(JSON.stringify(values))

        req.onreadystatechange = function()
        {
            if (req.readyState != XMLHttpRequest.DONE)
            {
                return;
            }

            if (req.status == 201)
            {
               location.reload();
            }

        };


    }

    function loadInfoForInsertTask()
    {
        var projects = JSON.parse(localStorage['projects']);
        var select = document.getElementById("add_task_project");

        for (var i in projects){
            var option = document.createElement("option");
            option.text = projects[i].title;
            option.value = projects[i].id;
            select.add(option);
        }
    }

    function addTask()
    {

        var username = document.getElementById("username-fetch-info").value;
        var password =  document.getElementById("password-fetch-info").value;

        var form = document.getElementById("insert_task");
        var title = form.title.value;
        var project = form.project.value;
        var creation_date = form.creation_date.value;
        var completed = form.completed.value;
        console.log(project +" "+ title + " " + creation_date + " " + completed);

        var credentials = window.btoa(username+":"+password);
        var auth = "Basic " + credentials;

        var values = {
            'project_id': project,
            'title': title,
            'creation_date': creation_date,
            'completed': completed
        }
        console.log(values);

        var req = new XMLHttpRequest();
        req.open("POST", "/api/projects/" + project +"/tasks/");
        req.setRequestHeader("Content-Type", "application/json");
        req.setRequestHeader("Authorization", auth);
        req.send(JSON.stringify(values))

        req.onreadystatechange = function()
        {
            if (req.readyState != XMLHttpRequest.DONE)
            {
                return;
            }

            if (req.status == 201)
            {
               location.reload();
            }

        };


    }

    function getInfoProjectModal(project_id)
    {


        var projects = JSON.parse(localStorage['projects']);
        fetchProjects();

        var project_title = document.getElementById("info_project_title");
        var form_id = document.getElementById("infoo_project_id");
        var form_title = document.getElementById("infoo_project_title");
        var form_creation_date = document.getElementById("infoo_creation_date");
        var form_last_updated = document.getElementById("infoo_last_updated");

        for (var i in projects)
        {
               if(projects[i].id == project_id)
               {
                    project_title.innerHTML =  projects[i].title;
                    form_id.value = projects[i].id;
                    form_title.value = projects[i].title;
                    form_creation_date.value =  projects[i].creation_date;
                    form_last_updated.value = projects[i].last_updated;
               }

        }
    }

    function updateProject()
    {
        var username = document.getElementById("username-fetch-info").value;
        var password =  document.getElementById("password-fetch-info").value;

        var form = document.getElementById("form_updateProject");
        var id = document.getElementById("infoo_project_id").value;
        var title = form.title.value;
        var creation_date = form.creation_date.value;
        var last_updated = form.last_updated.value;
        console.log(id +" "+ title + " " + creation_date + " " + last_updated);

        var credentials = window.btoa(username+":"+password);
        var auth = "Basic " + credentials;

        var values = {
            'title': title,
            'creation_date': creation_date,
            'last_updated': last_updated
        }
        console.log(values);

        var req = new XMLHttpRequest();
        req.open("PUT", "/api/projects/"+ id +"/");
        req.setRequestHeader("Content-Type", "application/json");
        req.setRequestHeader("Authorization", auth);
        req.send(JSON.stringify(values));

        req.onreadystatechange = function()
        {
            if (req.readyState != XMLHttpRequest.DONE)
            {
                return;
            }

            if (req.status == 200 && req.responseText != null)
            {
               location.reload();
            }

        };

    }

}
else if (url.pathname == '/profile')
{
    function updateUser()
    {
        var form = document.getElementById("form_update_user_information");
        var id = form.id.value;
        var name = form.name.value;
        var email = form.email.value;
        var username = form.username.value;
        var password = form.password.value;
        console.log(id + " " + name + " " + email + " " + username + " " + password);

        var values = {
            'id': id,
            'name': name,
            'email': email,
            'username': username,
            'password': password
        }


        var credentials = window.btoa(username+":"+password);
        var auth = "Basic " + credentials;

        var req = new XMLHttpRequest();
        req.open("PUT", "/api/user/");
        req.setRequestHeader("Content-Type", "application/json");
        req.setRequestHeader("Authorization", auth);
        req.send(JSON.stringify(values));

        req.onreadystatechange = function()
        {
            if (req.readyState != XMLHttpRequest.DONE)
            {
                return;
            }

            if (req.status == 200 && req.responseText != null)
            {
                 location.reload();
                 console.log(req.responseText);
            }
            else if(req.status == 403)
            {

            }
            else if(req.status == 404)
            {

            }
            else if(req.status == 500)
            {
                console.log(req.responseText);
            }
        }
    }
}


