import express from "express";
import { Database } from "../server.js";
const orderRouter = express.Router();

orderRouter.post("/makeorder", async (req, res) => {
	try {
		const cost_total = req.body.cost_total;
		const timestamp = req.body.timestamp;
		const customer_id = req.body.customer_id;
		const staff_id = req.body.staff_id;
		const menu_items = req.body.menu_items;
		await Database.makeOrder(
			cost_total,
			timestamp,
			customer_id,
			staff_id,
			menu_items
		);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Remove order
// orderRouter.delete("/delete/:order_id");

// GET all orders
orderRouter.get("/", async (req, res) => {
	try {
		res.send(await Database.getAllOrders());
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// GET recent orders
orderRouter.get("/recent", async (req, res) => {
	try {
		res.send(await Database.getRecentOrders());
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// GET order by order_id
orderRouter.get("/:order_id", async (req, res) => {
	const { order_id } = req.params;
	try {
		res.send(await Database.getOrder(order_id));
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// GET orders by customer_id
orderRouter.get("/customer/:customer_id", async (req, res) => {
	const { customer_id } = req.params;
	try {
		res.send(await Database.getOrdersByCustomerId(customer_id));
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// GET orders by date
orderRouter.get("/date/:date", async (req, res) => {
	const { date } = req.params;
	try {
		res.send(await Database.getOrdersByDate(date));
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// GET orders since date
orderRouter.get("/since/:date", async (req, res) => {
	const { date } = req.params;
	try {
		res.send(await Database.getOrdersSinceDate(date));
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

export default orderRouter;
