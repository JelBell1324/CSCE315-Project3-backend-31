import express from "express";
import pool from "../server.js";
const orderRouter = express.Router();

orderRouter.post("/makeorder", async (req, res) => {
	const { cost_total, timestamp, customer_id, staff_id, menu_items } =
		req.body;

	try {
		const { rows } = await pool.query(
			`INSERT INTO orders (cost_total, date, customer_id, staff_id)
		 VALUES ($1, $2, $3, $4)
		 RETURNING order_id;`,
			[cost_total, timestamp, customer_id, staff_id]
		);

		const order_id = rows[0].order_id;

		for (const menuItem of menu_items) {
			await pool.query(
				`INSERT INTO menu_to_order (menu_id, order_id, quantity)
		   VALUES ($1, $2, $3);`,
				[menuItem.menu_id, order_id, menuItem.quantity]
			);
		}

		for (const menuItem of menu_items) {
			const { rows: inventoryItems } = await pool.query(
				`SELECT * FROM inventory_to_menu WHERE menu_id = $1;`,
				[menuItem.menu_id]
			);

			for (const inventoryItem of inventoryItems) {
				await pool.query(
					`UPDATE inventory
			 SET quantity = quantity - $1
			 WHERE inventory_id = $2;`,
					[
						inventoryItem.quantity * menuItem.quantity,
						inventoryItem.inventory_id,
					]
				);
			}
		}

		res.status(201).json({ order_id });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// GET all orders
orderRouter.get("/", async (req, res) => {
	try {
		const { rows } = await pool.query("SELECT * FROM orders;");
		res.send(rows);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// GET recent orders
orderRouter.get("/recent", async (req, res) => {
	try {
		const { rows } = await pool.query(
			"SELECT * FROM orders ORDER BY date DESC LIMIT 50;"
		);
		res.send(rows);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// GET order by order_id
orderRouter.get("/:order_id", async (req, res) => {
	const { order_id } = req.params;
	try {
		const { rows } = await pool.query(
			"SELECT * FROM orders WHERE order_id = $1;",
			[order_id]
		);
		res.send(rows[0]);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// GET orders by customer_id
orderRouter.get("/customer/:customer_id", async (req, res) => {
	const { customer_id } = req.params;
	try {
		const { rows } = await pool.query(
			"SELECT * FROM orders WHERE customer_id = $1;",
			[customer_id]
		);
		res.send(rows);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// GET orders by date
orderRouter.get("/date/:date", async (req, res) => {
	const { date } = req.params;
	try {
		const { rows } = await pool.query(
			"SELECT * FROM orders WHERE date = $1;",
			[date]
		);
		res.send(rows);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// GET orders since date
orderRouter.get("/since/:date", async (req, res) => {
	const { date } = req.params;
	try {
		const { rows } = await pool.query(
			"SELECT * FROM orders WHERE date >= $1;",
			[date]
		);
		res.send(rows);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

export default orderRouter;
