import express from "express";
import { pool } from "../server.js";
const staffRouter = express.Router();

/**
 * Gets all staff from the database
 */
staffRouter.get("/", async (req, res) => {
	try {
		const staff = await pool.query("SELECT * FROM staff;");
		res.status(201).json(staff.rows);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

/**
 * Adds staff to the database
 */
staffRouter.post("/add", async (req, res) => {
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

export default staffRouter;
