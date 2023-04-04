import express from "express";
import pool from "../server.js";
const orderRouter = express.Router();

// GET all orders
orderRouter.get("/", async (req, res) => {
	try {
		const query_res = await pool.query("SELECT * FROM orders;");
		res.send(query_res.rows);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// GET recent orders
orderRouter.get("/recent", async (req, res) => {
	try {
		const query_res = await pool.query(
			"SELECT * FROM orders ORDER BY date DESC LIMIT 50;"
		);
		res.send(query_res.rows);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// GET order by order_id
orderRouter.get("/:order_id", async (req, res) => {
	const { order_id } = req.params;
	try {
		const query_res = await pool.query(
			"SELECT * FROM orders WHERE order_id = $1;",
			[order_id]
		);
		res.send(query_res.rows[0]);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// GET orders by customer_id
orderRouter.get("/customer/:customer_id", async (req, res) => {
	const { customer_id } = req.params;
	try {
		const query_res = await pool.query(
			"SELECT * FROM orders WHERE customer_id = $1;",
			[customer_id]
		);
		res.send(query_res.rows);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// GET orders by date
orderRouter.get("/date/:date", async (req, res) => {
	const { date } = req.params;
	try {
		const query_res = await pool.query(
			"SELECT * FROM orders WHERE date = $1;",
			[date]
		);
		res.send(query_res.rows);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// GET orders since date
orderRouter.get("/since/:date", async (req, res) => {
	const { date } = req.params;
	try {
		const query_res = await pool.query(
			"SELECT * FROM orders WHERE date >= $1;",
			[date]
		);
		res.send(query_res.rows);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

export default orderRouter;
