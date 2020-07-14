"""
 Flask REST application

"""
from flask import Flask, request, jsonify, make_response, render_template, session, redirect, url_for
from models import Database


# ==========
#  Settings
# ==========

app = Flask(__name__, template_folder='static')
app.config['STATIC_URL_PATH'] = '/static'
app.config['DEBUG'] = True
app.secret_key = 'secret_key'


# ==========
#  Database
# ==========

# Creates an sqlite database in memory
db = Database(filename=':memory:', schema='schema.sql')
db.recreate()

# ===========
#  Web views
# ===========


@app.route('/')
def index():
    user_info = session.get('user', None)

    if user_info:
        return redirect(url_for('user_projects_tasks'))

    return render_template('index.html')


@app.route('/register')
def register():
    user_info = session.get('user', None)

    if user_info:
        return redirect(url_for('user_projects_tasks'))

    return render_template('register.html')


@app.route('/user-projects-tasks')
def user_projects_tasks():
    user_info = session.get('user', None)

    if not user_info:
        return redirect(url_for('index'))

    return render_template('user_projects_tasks.html', user=user_info)


@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect(url_for('index'))


@app.route('/profile')
def profile():
    user_info = session.get('user', None)

    if not user_info:
        return redirect(url_for('index'))

    return render_template('user_profile.html', user=user_info)


# ===========
#  API views
# ===========


@app.route('/api/user/register/', methods=['POST'])
def user_register():
    """
    Registers a new user.
    Does not require authorization.

    """

    register_user = request.json

    user_id = db.execute_query(f'INSERT INTO user VALUES (null, ?, ?, ?, ?)', (
        register_user['name'],
        register_user['email'],
        register_user['username'],
        register_user['password'],
    )).lastrowid
    user = db.execute_query("select * from user where id = ?", (user_id, )).fetchone()

    if user:
        return make_response(jsonify(user), 201)
    else:
        return make_response(jsonify(), 404)


@app.route('/api/user/', methods=['GET', 'PUT'])
def user_detail():
    """
    Returns or updates current user.
    Requires authorization.

    """
    user = db.execute_query(f'SELECT * FROM user WHERE username=? AND password=?', (
        request.authorization.username,
        request.authorization.password,
    )).fetchone()

    if not user:
        return make_response(jsonify(), 403)

    if request.method == 'GET':
        # Returns user data
        session['user'] = user
        return make_response(jsonify(user), 200)

    else:
        # Updates user data
        update_user = request.json

        if int(update_user['id']) != int(user['id']):
            return make_response(jsonify(), 403)

        db.execute_query(f'UPDATE user SET name=?, email=?, username=?, password=? WHERE id=?',(
            update_user['name'],
            update_user['email'],
            update_user['username'],
            update_user['password'],
            update_user['id']
        ))
        updated_user = db.execute_query("SELECT * FROM user WHERE id = ?", (user['id'],)).fetchone()
        session['user'] = updated_user
        return make_response(jsonify(updated_user), 200)


@app.route('/api/projects/', methods=['GET', 'POST'])
def project_list():
    """
    Project list.
    Requires authorization.

    """
    user = db.execute_query(f'SELECT * FROM user WHERE username=? AND password=?', (
        request.authorization.username,
        request.authorization.password,
    )).fetchone()

    if not user:
        return make_response(jsonify(), 403)

    if request.method == 'GET':
        # Returns the list of projects of a user
        projects = db.execute_query('SELECT * FROM project WHERE user_id = ?', (user['id'],)).fetchall()

        if projects:
            return make_response(jsonify(projects), 200)
        else:
            return make_response(jsonify(), 404)

    else:
        # Adds a project to the list
        new_project = request.json

        project_id = db.execute_query(f'INSERT INTO project VALUES (null, ?, ?, ?, ?)', (
            new_project['user_id'],
            new_project['title'],
            new_project['creation_date'],
            new_project['last_updated'],
        )).lastrowid

        project = db.execute_query("SELECT * FROM project WHERE id = ?", (project_id,)).fetchone()

        if project:
            return make_response(jsonify(project), 201)
        else:
            return make_response(jsonify(), 404)


@app.route('/api/projects/<int:pk>/', methods=['GET', 'PUT', 'DELETE'])
def project_detail(pk):
    """
    Project detail.
    Requires authorization.

    """
    user = db.execute_query(f'SELECT * FROM user WHERE username=? AND password=?', (
        request.authorization.username,
        request.authorization.password,
    )).fetchone()

    project = db.execute_query('SELECT * FROM project WHERE id=?', (pk,)).fetchone()

    if not project:
        return make_response(jsonify(), 404)

    if not user or user['id'] != project['user_id']:
        return make_response(jsonify(), 403)

    if request.method == 'GET':
        # Returns a project
        return make_response(jsonify(project), 200)

    elif request.method == 'PUT':
        # Update a project
        update_project = request.json

        if int(project['user_id']) != int(user['id']):
            return make_response(jsonify(), 403)

        project_id = db.execute_query(f'UPDATE project SET title=?, creation_date=?, last_updated=? WHERE id=?', (
            update_project['title'],
            update_project['creation_date'],
            update_project['last_updated'],
            pk
        )).lastrowid
        updated_user = db.execute_query("SELECT * FROM project WHERE id = ?", (project_id,)).fetchone()
        return make_response(jsonify(updated_user), 200)

    else:
        # Deletes a project
        delete_project = db.execute_query("DELETE FROM project WHERE id=?",(pk, ))

        if delete_project:
            return make_response(jsonify(), 200)

        return make_response(jsonify(project), 404)


@app.route('/api/projects/<int:pk>/tasks/', methods=['GET', 'POST'])
def task_list(pk):
    """
    Task list.
    Requires authorization.

    """
    user = db.execute_query(f'SELECT * FROM user WHERE username=? AND password=?', (
        request.authorization.username,
        request.authorization.password,
    )).fetchone()

    project = db.execute_query('SELECT * FROM project WHERE id=?', (pk,)).fetchone()

    if not user or user['id'] != project['user_id']:
        return make_response(jsonify(), 403)

    if not project:
        return make_response(jsonify(), 404)

    if request.method == 'GET':
        # Returns the list of tasks of a project
        tasks = db.execute_query('SELECT * FROM task WHERE project_id=?', (pk,)).fetchall()

        if tasks:
            return make_response(jsonify(tasks), 200)
        else:
            return make_response(jsonify(), 404)

    else:
        # Add a Task to a project
        new_task = request.json

        task_id = db.execute_query(f'INSERT INTO task VALUES (null, ?, ?, ?, ?)', (
            pk,
            new_task['title'],
            new_task['creation_date'],
            new_task['completed'],
        )).lastrowid

        task = db.execute_query("SELECT * FROM task WHERE id = ?", (task_id,)).fetchone()

        if task:
            return make_response(jsonify(task), 201)
        else:
            return make_response(jsonify(), 404)


@app.route('/api/projects/<int:pk>/tasks/<int:task_pk>/', methods=['GET', 'PUT', 'DELETE'])
def task_detail(pk, task_pk):
    """
    Task detail.
    Requires authorization.

    """
    user = db.execute_query(f'SELECT * FROM user WHERE username=? AND password=?', (
        request.authorization.username,
        request.authorization.password,
    )).fetchone()

    task = db.execute_query('SELECT * FROM task WHERE project_id=? and id=?', (pk, task_pk,)).fetchone()

    if not user:
        return make_response(jsonify(), 403)

    if request.method == 'GET':
        # Returns a task

        if task:
            return make_response(jsonify(task), 200)
        else:
            return make_response(jsonify(), 404)

    elif request.method == 'PUT':
        # Updates a task
        update_task = request.json

        if int(update_task['project_id']) != int(pk):
            return make_response(jsonify(), 403)

        project_id = db.execute_query(f'UPDATE task SET title=?, creation_date=?, project_id=?, completed=? WHERE id=?', (
            update_task['title'],
            update_task['creation_date'],
            update_task['project_id'],
            update_task['completed'],
            task_pk
        )).lastrowid
        updated_task = db.execute_query("SELECT * FROM task WHERE id = ?", (project_id,)).fetchone()
        return make_response(jsonify(updated_task), 200)

    else:
        # Deletes a task
        delete_tasks = db.execute_query("DELETE FROM task WHERE project_id=? and id=?", (pk, task_pk))

        if delete_tasks:
            return make_response(jsonify(), 200)

        return make_response(jsonify(task), 404)


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8000)
