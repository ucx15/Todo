const express = require('express');
const cors = require('cors');


// Constants
const PORT = 5000;
const HOST = "localhost";

// App
const app = express();

app.use(
	cors({
		origin: '*', credentials: true
	})
);
app.use(express.json());


// Routes
// serve app.html
app.use(express.static('public'));
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/app.html');
});


// Server
app.listen(PORT, () => {
	console.log(`Frontend Running @ http://${HOST}:${PORT}`);
});
