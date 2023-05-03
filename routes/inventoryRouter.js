import express from "express";
import { Database } from "../server.js";
const inventoryRouter = express.Router();

/**
 * Gets list of all inventory items
 */
inventoryRouter.get("/", async (req, res) => {
	try {
		res.send(await Database.getAllInventoryItems());
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

/**
 * Gets inventory by inventory_id
 */
inventoryRouter.get("/:inventory_id", async (req, res) => {
	const { inventory_id } = req.params;
	try {
		res.send(await Database.getInventory(inventory_id));
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

/**
 * Gets inventory by inventory name
 */
inventoryRouter.get("/name/:name", async (req, res) => {
	const { name } = req.params;
	try {
		res.send(await Database.getInventoryByName(name));
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});


/**
 * Edits the quantity of inventory by name
 */
inventoryRouter.post("/edit/quantity", async (req, res) => {
	try {
		const name = req.body.name;
		const quantity = req.body.quantity;
		res.send(
			await Database.updateInventoryQuantityByName(name, quantity)
		);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

export default inventoryRouter;
