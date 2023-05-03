import express from "express";
import { Database } from "../server.js";
const menuRouter = express.Router();

/**
 * Gets array of all menu items
 */
menuRouter.get("/", async (req, res) => {
	try {
		res.send(await Database.getAllMenuItems());
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

/**
 * Gets menu item by menu id
 */
menuRouter.get("/:menu_id", async (req, res) => {
	const { menu_id } = req.params;
	try {
		res.send(await Database.getMenu(menu_id));
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

/**
 * Gets the menu item by order_id
 */
menuRouter.get("/order/:order_id", async (req, res) => {
	const { order_id } = req.params;
	try {
		res.send(await Database.getMenuItemsByOrderId(order_id));
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

/**
 * Gets menu item by menu item name
 */
menuRouter.get("/name/:name", async (req, res) => {
	const { name } = req.params;
	try {
		res.send(await Database.getMenuByName(name));
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

/**
 * Gets array of menu items by menu item type
 */
menuRouter.get("/type/:type", async (req, res) => {
	const { type } = req.params;
	try {
		res.send(await Database.getMenuByType(type));
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

/**
 * Adds menu item to menu
 */
menuRouter.post("/add", async (req, res) => {
	try {
		const name = req.body.name;
		const price = req.body.price;
		const type = req.body.type;
		const inventory_items = req.body.inventory_items;
		res.send(
			await Database.addMenuItem(name, price, type, inventory_items)
		);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

/**
 * Removes menu item from menu
 */
menuRouter.post("/remove", async (req, res) => {
	try {
		const menu_id = req.body.menu_id;
		res.send(
			await Database.removeMenuItem(menu_id)
		);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

/**
 * Edits the price of menu item by name
 */
menuRouter.post("/edit/price", async (req, res) => {
	try {
		const name = req.body.name;
		const newPrice = req.body.newPrice;
		res.send(
			await Database.updateMenuPriceByName(name, newPrice)
		);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
}); 

export default menuRouter;
