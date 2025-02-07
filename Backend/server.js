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
			console.error("Error adding task");
			return callback(false);
		}

		else {
			console.log("Task added successfully");
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
			console.error("Error toggling task");
			return callback(false);
		}
		else {
			console.log("Task toggled successfully");
			return callback(true);
		}
	});
}


function removeTaskfromDB(taskuuid, callback) {
	const query = `DELETE FROM tasks WHERE uuid = ?`;

	db.run(query, taskuuid, (err) => {
		if (err) {
			console.error("Error removing task");
			return callback(false);
		}
		else {
			console.log(`Removed:  ${taskuuid} ✔️`);
			return callback(true);
		}
	});
}


// Routes
app.post("/api/add-task", async (req, res) => {
	const task = req.body.task;

	console.log(task);

	addTasktoDB(task, (added, task_uuid) => {
		if (added) {
			res.json({uuid: task_uuid});
			return;
		}
		res.sendStatus(400);
	});
});


// Marking a Task
app.put("/api/toggle-task", async (req, res) => {
	const taskid = req.body.id;
	const marked = req.body.marked;

	toggleTaskinDB(taskid, marked, toggled => {
		if (toggled) {
			res.sendStatus(200);
			return;
		}
		else {
			res.sendStatus(400);
		}
	});
});

// Fetching Tasks
app.get("/api/tasks", (req, resp) => {
	getTasksFromDB(tasks => {
		if (!tasks) {
			resp.sendStatus(400);
			return;
		}
		else {
			resp.json(tasks);
		}
	});
})

app.delete("/api/remove-task", (req, res) => {
	const taskuuid = req.body.uuid;

	removeTaskfromDB(taskuuid, removed => {
		if (removed) {
			res.sendStatus(200);
			return;
		}

		res.sendStatus(400);
	});
});

app.listen(PORT, () => {
	console.log(`Backend Running @ http://${HOST}:${PORT}`);
});
