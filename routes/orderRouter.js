import express from "express";
import { Database } from "../server.js";
const orderRouter = express.Router();

/**
 * Makes order
 */
orderRouter.post("/makeorder", async (req, res) => {
	try {
		const cost_total = req.body.cost_total;
		const timestamp = req.body.timestamp;
		const customer_id = req.body.customer_id;
		const staff_id = req.body.staff_id;
		const menu_items = req.body.menu_items;
		const order_id = await Database.makeOrder(
			cost_total,
			timestamp,
			customer_id,
			staff_id,
			menu_items
		);
		res.json({ order_id });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

/**
 * Gets array of all orders
 */
orderRouter.get("/", async (req, res) => {
	try {
		res.send(await Database.getAllOrders());
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

/**
 * Gets array of 50 most recent orders
 */
orderRouter.get("/recent", async (req, res) => {
	try {
		res.send(await Database.getRecentOrders());
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

/**
 * Gets order by order id
 */
orderRouter.get("/:order_id", async (req, res) => {
	const { order_id } = req.params;
	try {
		res.send(await Database.getOrder(order_id));
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

/**
 * Gets array of orders by customer id
 */
orderRouter.get("/customer/:customer_id", async (req, res) => {
	const { customer_id } = req.params;
	try {
		res.send(await Database.getOrdersByCustomerId(customer_id));
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

/**
 * Gets array of orders on given date
 */
orderRouter.get("/date/:date", async (req, res) => {
	const { date } = req.params;
	try {
		res.send(await Database.getOrdersByDate(date));
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

/**
 * Gets array of orders since a given date
 */
orderRouter.get("/since/:date", async (req, res) => {
	const { date } = req.params;
	try {
		res.send(await Database.getOrdersSinceDate(date));
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

export default orderRouter;
