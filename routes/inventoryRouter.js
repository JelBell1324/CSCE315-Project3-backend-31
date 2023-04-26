import express from "express";
import { Database } from "../server.js";
const inventoryRouter = express.Router();

inventoryRouter.get("/", async (req, res) => {
	try {
		res.send(await Database.getAllInventoryItems());
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

inventoryRouter.get("/:inventory_id", async (req, res) => {
	const { inventory_id } = req.params;
	try {
		res.send(await Database.getInventory(inventory_id));
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

inventoryRouter.get("/name/:name", async (req, res) => {
	const { name } = req.params;
	try {
		res.send(await Database.getInventoryByName(name));
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

export default inventoryRouter;
