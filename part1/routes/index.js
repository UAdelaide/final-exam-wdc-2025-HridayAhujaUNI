const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const { initializeDatabase, getDb } = require('./db');

initializeDatabase();

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/api/dogs', async (req, res) => {
	try {
		const db = getDb();
		const [dogs] = await db.query(`
			SELECT d.name AS dog_name, d.size, u.username AS owner_username
			FROM Dogs d
			JOIN Users u ON d.owner_id = u.user_id
		`);
		res.json(dogs);
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch' });
	}
});

app.get('/api/walkrequests/open', async (req, res) => {
	try {
		const db = getDb();
		const [requests] = await db.query(`
			SELECT wr.request_id, d.name AS dog_name, wr.requested_time, wr.duration_minutes, wr.location, u.username AS owner_username
			FROM WalkRequests wr
			JOIN Dogs d ON wr.dog_id = d.dog_id
			JOIN Users u ON d.owner_id = u.user_id
			WHERE wr.status = 'open'
		`);
		res.json(requests);
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch' });
	}
});

app.get('/api/walkers/summary', async (req, res) => {
	try {
		const db = getDb();
		const [summary] = await db.query(`
			SELECT
				u.username AS walker_username,
				COUNT(r.rating_id) AS total_ratings,
				ROUND(AVG(r.rating), 1) AS average_rating,
				(
					SELECT COUNT(*)
					FROM WalkRequests wr
					JOIN WalkRatings rr ON wr.request_id = rr.request_id
					WHERE rr.walker_id = u.user_id
				) AS completed_walks
			FROM Users u
			LEFT JOIN WalkRatings r ON u.user_id = r.walker_id
			WHERE u.role = 'walker'
			GROUP BY u.user_id
		`);
		res.json(summary);
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch' });
	}
});

module.exports = app;