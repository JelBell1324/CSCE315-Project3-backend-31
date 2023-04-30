import express from "express";
import { Database } from "../server.js";
const restaurantRouter = express.Router();

restaurantRouter.get("/", async (req, res) => {
	try {
		res.send(await Database.getRestaurant());
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

restaurantRouter.get("/restockreport", async (req, res) => {
	const minimumQty = req.query.minimumQty;
	try {
		res.send(await Database.getRestockReport(minimumQty));
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

restaurantRouter.get("/excessreport", async (req, res) => {
	const timestamp = req.query.timestamp;
	try {
		res.send(await Database.getExcessReport(timestamp));
		console.log("Excess Report generated successfully");
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

restaurantRouter.get("/salesreport", async (req, res) => {
	try {
		res.send(await Database.getSalesReport());
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

restaurantRouter.get("/xreport", async (req, res) => {
	try {
		res.send(await Database.getXReport(1));
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

restaurantRouter.get("/zreport", async (req, res) => {
	try {
		res.send(await Database.getZReport(1));
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});
export default restaurantRouter;
