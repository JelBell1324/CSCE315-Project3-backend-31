import express from "express";
import pool from "../server.js";
const restaurantRouter = express.Router();

restaurantRouter.get("/", async (req, res) => {
	try {
		const { rows } = await pool.query("SELECT * FROM restaurant;");
		res.send(rows);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

export default restaurantRouter;
