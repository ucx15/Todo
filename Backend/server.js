const utils   = require("node:util");
const express = require('express');
const sqlite3 = require('sqlite3');
const cors    = require('cors');
const uuid    = require('uuid');


// Constants
const PORT = 3000;
const HOST = "localhost"
const DB_NAME = "tasks.db";


// App
const db = new sqlite3.Database(DB_NAME);

const app = express();
app.use(
	cors({
		origin: '*', credentials: true
	})
);
app.use(express.json());


function generateTables() {
	const query = `CREATE TABLE IF NOT EXISTS tasks (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		uuid TEXT NOT NULL,
		value TEXT NOT NULL,
		timestamp TEXT NOT NULL,
		marked INTEGER DEFAULT 0
	)`;

	db.run(query, (err) => {
		if (err) {
			console.log("Error creating table");
			console.error(err);
		}
	});

}
generateTables();


function addTasktoDB(task, callback) {
	const query = `INSERT INTO tasks (uuid, value, timestamp, marked) VALUES (?, ?, ?, ?)`;
	const task_uuid = uuid.v4();

	db.run(query, task_uuid, task.value, task.timestamp, task.marked, (err) => {
		if (err) {
			return callback(false);
		}
		else {
			return callback(true, task_uuid);
		}
	});
}

function getTasksFromDB(callback) {
	const query = `SELECT * FROM tasks`;

	db.all(query, (err, rows) => {
		if (err) {
			console.error("Error fetching tasks");
			return callback([]);
		}

		else {
			console.log("Tasks fetched successfully");
			return callback(rows);
		}
	});
}

function toggleTaskinDB(taskid, marked, callback) {
	const query = `UPDATE tasks SET marked = ? WHERE id = ?`;

	db.run(query, marked, taskid, (err) => {
		if (err) {
			console.error(err);
			return callback(false);
		}
		else {
			return callback(true);
		}
	});
}

function removeTaskfromDB(taskuuid, callback) {
	const query = `DELETE FROM tasks WHERE uuid = ?`;

	db.run(query, taskuuid, (err) => {
		if (err) {
			console.error(err);
			return callback(false);
		}
		else {
			return callback(true);
		}
	});
}


// Routes

// Fetching Tasks
app.get("/favicon.ico", (req, resp) => {
	resp.sendStatus(404);
})

app.get("/api/tasks", (req, resp) => {

	getTasksFromDB(tasks => {

		if (tasks) {
			console.log(`FETCHED: All Tasks`);
			resp.status(200).json(tasks);
			return;
		}

		console.error(utils.styleText('red', `FAILED to FETCH: All Tasks`));
		resp.sendStatus(400);
	});
})

// Adding Tasks
app.post("/api/add-task", (req, res) => {
	const task = req.body.task;

	addTasktoDB(task, (added, task_uuid) => {
		if (added) {
			console.log(`ADDED:  "${task.value}"  uuid:${task_uuid}`);
			res.json({uuid: task_uuid});
			return;
		}

		console.error(utils.styleText(`FAILED to ADD:  "${task.value}"  uuid:?`));
		res.sendStatus(400);
	});
});

// Marking a Task
app.put("/api/toggle-task", (req, res) => {
	const task = req.body.task;

	// TODO: NOT reflecting in the database, Fix it!!!
	toggleTaskinDB(task.id, task.marked, toggled => {
		if (toggled) {
			if (task.marked){
				console.log(`MARKED:  "${task.value}"  uuid:${task.uuid}  marked:${task.marked}`);
			}
			else {
				console.log(`UNMARKED:  "${task.value}"  uuid:${task.uuid}  marked:${task.marked}`);
			}
			res.sendStatus(200);
			return;
		}
		else {

			console.error(utils.styleText(`FAILED to MARK:  "${task.value}"  uuid:?`));
			res.sendStatus(400);
		}
	});
});


// Deleting Tasks
app.delete("/api/remove-task", (req, res) => {
	// const taskuuid = req.body.uuid;
	const task = req.body.task;

	removeTaskfromDB(task.uuid, removed => {
		if (removed) {

			console.log(`REMOVED:  "${task.value}"  ${task.uuid}`);
			res.sendStatus(200);
			return;
		}

		console.error(utils.styleText('red', `FAILED to REMOVE:  ${task.value}  ${task.uuid}`));
		res.sendStatus(400);
	});
});


// Server
app.listen(PORT, () => {
	console.log(`Backend Running @ http://${HOST}:${PORT}`);
});
