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
	try {
		res.send(await Database.getRestockReport());
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

export default restaurantRouter;
