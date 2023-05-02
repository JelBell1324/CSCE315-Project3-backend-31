import express from "express";
import { Database } from "../server.js";
const menuRouter = express.Router();

menuRouter.get("/", async (req, res) => {
	try {
		res.send(await Database.getAllMenuItems());
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

menuRouter.get("/:menu_id", async (req, res) => {
	const { menu_id } = req.params;
	try {
		res.send(await Database.getMenu(menu_id));
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

menuRouter.get("/order/:order_id", async (req, res) => {
	const { order_id } = req.params;
	try {
		res.send(await Database.getMenuItemsByOrderId(order_id));
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

menuRouter.get("/name/:name", async (req, res) => {
	const { name } = req.params;
	try {
		res.send(await Database.getMenuByName(name));
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

menuRouter.get("/type/:type", async (req, res) => {
	const { type } = req.params;
	try {
		res.send(await Database.getMenuByType(type));
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

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
