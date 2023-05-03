import express from "express";
import { pool } from "../server.js";
const authRouter = express.Router();

import { OAuth2Client } from "google-auth-library";

const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

/**
 * Authenticates user by email in the database
 */
authRouter.post("/google-login", async (req, res) => {
	try {
		const credential = req.body.credential;
		const ticket = await client.verifyIdToken({
			idToken: credential,
			audience: CLIENT_ID,
		});
		const payload = ticket.getPayload();

		// Use payload information to find or create a user in your database
		// and return the user information as you do in your regular login route
		// Find or create a user with the Google email
		const googleEmail = payload.email;
		let user = await pool.query("SELECT * FROM staff WHERE email = $1", [
			googleEmail,
		]);

		if (user.rowCount === 0) {
			// respond with error
			res.json({ message: 420, user: user.rows[0] });
		}

		res.json({ message: 69, user: user.rows[0] });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

/**
 * Adds staff to the database
 */
authRouter.post("/add", async (req, res) => {
	try {
		const restaurant_id = req.body.restaurant_id;
		const is_manager = req.body.is_manager;
		const name = req.body.name;
		const email = req.body.email;

		const user = await pool.query(
			"INSERT INTO staff (restaurant_id, is_manager, name, email) VALUES ($1, $2, $3, $4) RETURNING *",
			[restaurant_id, is_manager, name, email]
		);

		res.status(201).json(user.rows[0]);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

export default authRouter;
