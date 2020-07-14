"""
 Tests the application API

"""

import base64
import unittest
import json

from app import app, db


def auth_header(username, password):
    """Returns the authorization header."""
    credentials = f'{username}:{password}'
    b64credentials = base64.b64encode(credentials.encode()).decode('utf-8')
    return {'Authorization': f'Basic {b64credentials}'}


class TestBase(unittest.TestCase):
    """Base for all tests."""

    def setUp(self):
        app.config['TESTING'] = True
        self.client = app.test_client()
        self.db = db
        self.db.recreate()

    def tearDown(self):
        pass


class TestUsers(TestBase):
    """Tests for the user endpoints."""

    def setUp(self):
        super().setUp()

    def test_correct_credentials(self):
        """Tests the user with correct credentials."""
        credentials = auth_header('homer', '1234')
        res = self.client.get('/api/user/', headers=credentials)
        self.assertEqual(res.status_code, 200)

    def test_wrong_credentials(self):
        """Tests the user with incorrect credentials."""
        credentials = auth_header('no-user', 'no-password')
        res = self.client.get('/api/user/', headers=credentials)
        self.assertEqual(res.status_code, 403)

    def test_update_user(self):
        """Tests update of a user"""
        credentials = auth_header('homer', '1234')
        info = {"id": 1, "name": "Joao", "email": "joao@gmail.com", "username": "joao", "password": "1234"}
        res = self.client.put('/api/user/', data=json.dumps(dict(info)), content_type='application/json', headers=credentials)
        self.assertEqual(res.status_code, 200)

    def test_register_user(self):
        """Tests the register of a user"""
        info = {"name": "JoaoFrancisco", "email": "joaofrancisco@gmail.com", "username": "JoFr", "password": "1234"}
        res = self.client.post('/api/user/register/', data=json.dumps(dict(info)), content_type='application/json')
        self.assertEqual(res.status_code, 201)


class TestProjects(TestBase):
    """Tests for the project endpoints."""

    def setUp(self):
        super().setUp()

    def test_fetch_all_projects(self):
        """Tests if the user has projects"""
        credentials = auth_header('homer', '1234')
        res = self.client.get('/api/projects/', headers=credentials)
        self.assertEqual(res.status_code, 200)

    def test_insert_project(self):
        """Tests if the user has projects"""
        credentials = auth_header('homer', '1234')
        info = {'user_id': 1, "title": "New_Tp4", "creation_date": "2020-06-01", "last_updated": "2020-06-01"}
        res = self.client.post('/api/projects/', data=json.dumps(dict(info)), content_type='application/json', headers=credentials)
        self.assertEqual(res.status_code, 201)

    def test_update_project(self):
        """Tests the update of a project"""
        credentials = auth_header('homer', '1234')
        info = {"title": "Tp4", "creation_date": "2020-06-01", "last_updated": "2020-06-01"}
        res = self.client.put('/api/projects/1/', data=json.dumps(dict(info)), content_type='application/json', headers=credentials)
        self.assertEqual(res.status_code, 200)

    def test_update_project_from_wrong_user(self):
        """Tests the update of a project of a wrong user"""
        credentials = auth_header('homer', '1234')
        info = {"title": "Tp4", "creation_date": "2020-06-01", "last_updated": "2020-06-01"}
        res = self.client.put('/api/projects/3/', data=json.dumps(dict(info)), content_type='application/json', headers=credentials)
        self.assertEqual(res.status_code, 403)

    def test_not_found_project(self):
        """Tests a non existing project"""
        credentials = auth_header('homer', '1234')
        res = self.client.get('/api/projects/4/', headers=credentials)
        self.assertEqual(res.status_code, 404)

    def test_delete_project(self):
        """Tests the delete of a project"""
        credentials = auth_header('homer', '1234')
        res = self.client.delete('/api/projects/1/', headers=credentials)
        self.assertEqual(res.status_code, 200)


class TestTasks(TestBase):
    """Tests for the tasks endpoints."""

    def setUp(self):
        super().setUp()

    def test_get_project_tasks(self):
        """Tests if the project has tasks"""
        credentials = auth_header('homer', '1234')
        res = self.client.get('/api/projects/1/tasks/', headers=credentials)
        self.assertEqual(res.status_code, 200)

    def test_insert_task_into_project(self):
        """Tests the insert of a task"""
        credentials = auth_header('homer', '1234')
        info = {"title": "New_Task", "creation_date": "2020-06-01", "completed": "1"}
        res = self.client.post('/api/projects/1/tasks/', data=json.dumps(dict(info)), content_type='application/json',headers=credentials)
        self.assertEqual(res.status_code, 201)

    def test_get_task(self):
        """Tests if task belongs to project """
        credentials = auth_header('homer', '1234')
        res = self.client.get('/api/projects/1/tasks/2/', headers=credentials)
        self.assertEqual(res.status_code, 200)

    def test_not_task(self):
        """Tests if task belongs to project """
        credentials = auth_header('homer', '1234')
        res = self.client.get('/api/projects/1/tasks/3/', headers=credentials)
        self.assertEqual(res.status_code, 404)

    def test_update_task(self):
        """Tests the update of a task"""
        credentials = auth_header('homer', '1234')
        info = {"title": "New_Task_Updated", "creation_date": "2020-06-01", "project_id": "1", "completed": "0"}
        res = self.client.put('/api/projects/1/tasks/1/', data=json.dumps(dict(info)), content_type='application/json', headers=credentials)
        self.assertEqual(res.status_code, 200)

    def test_delete_task(self):
        """Tests the delete of a task"""
        credentials = auth_header('homer', '1234')
        res = self.client.delete('/api/projects/1/tasks/1/', headers=credentials)
        self.assertEqual(res.status_code, 200)






