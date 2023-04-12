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

menuRouter.get("/name/:name", async (req, res) => {
	const { name } = req.params;
	try {
		res.send(await Database.getMenuByName());
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

export default menuRouter;
