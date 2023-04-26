import express from "express";
import { pool } from "../server.js";
import bcrypt from "bcrypt";
const authRouter = express.Router();

import { OAuth2Client } from "google-auth-library";

const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

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
			// Create a new user with Google user information
			user = await pool.query(
				"INSERT INTO staff (restaurant_id, is_manager, name, username, email) VALUES ($1, $2, $3, $4, $5) RETURNING *",
				[1, false, payload.name, payload.name, googleEmail] // You may want to adjust these values based on your application requirements
			);
		}

		res.json({ message: "Logged in successfully.", user: user.rows[0] });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Login route
authRouter.post("/login", async (req, res) => {
	try {
		const username = req.body.username;
		const password = req.body.password;
		// Check if any of the required fields are missing
		if (username == null || password == null) {
			return res
				.status(400)
				.json({ message: "All fields are required." });
		}
		const user = await pool.query(
			"SELECT * FROM staff WHERE username = $1",
			[username]
		);
		if (user.rowCount === 0) {
			return res
				.status(400)
				.json({ message: "Invalid username or password." });
		}

		const validPassword = await bcrypt.compare(
			password,
			user.rows[0].hashed_password
		);
		if (!validPassword) {
			return res
				.status(400)
				.json({ message: "Invalid username or password." });
		}

		res.json({ message: "Logged in successfully.", user: user.rows[0] });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Registration route
authRouter.post("/register", async (req, res) => {
	try {
		// console.log(req.body);
		const restaurant_id = req.body.restaurant_id;
		const is_manager = req.body.is_manager;
		const name = req.body.name;
		const username = req.body.username;
		const password = req.body.password;

		// Check if any of the required fields are missing
		if (
			restaurant_id == null ||
			is_manager == null ||
			name == null ||
			username == null ||
			password == null
		) {
			return res
				.status(400)
				.json({ message: "All fields are required." });
		}

		// Check if username already exists
		const existingUser = await pool.query(
			"SELECT * FROM staff WHERE username = $1",
			[username]
		);
		if (existingUser.rowCount > 0) {
			return res
				.status(400)
				.json({ message: "Username already exists." });
		}

		// Hash the password before storing it
		const salt = await bcrypt.genSalt(10);
		const hashed_password = await bcrypt.hash(password, salt);

		const newUser = await pool.query(
			"INSERT INTO staff (restaurant_id, is_manager, name, username, hashed_password) VALUES ($1, $2, $3, $4, $5) RETURNING *",
			[restaurant_id, is_manager, name, username, hashed_password]
		);

		res.status(201).json({
			message: "User registered successfully.",
			user: newUser.rows[0],
		});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

export default authRouter;
