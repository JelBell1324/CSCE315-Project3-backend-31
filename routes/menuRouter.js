import express from "express";
import pool from "../server.js";
const menuRouter = express.Router();

const getInventoryItemsByMenuId = async (menu_id) => {
	try {
		const { rows } = await pool.query(
			"SELECT * FROM inventory_to_menu WHERE menu_id = $1;",
			[menu_id]
		);
		return rows.map((row) => ({
			inventory_id: row.inventory_id,
			quantity: row.quantity,
		}));
	} catch (err) {
		console.error(err);
		return null;
	}
};

menuRouter.get("/", async (req, res) => {
	try {
		const { rows } = await pool.query("SELECT * FROM menu;");
		const menuItems = [];

		for (const row of rows) {
			const inventory_items = await getInventoryItemsByMenuId(
				row.menu_id
			);
			menuItems.push({
				menu_id: row.menu_id,
				name: row.name,
				price: row.price,
				type: row.type,
				inventory_items,
			});
		}

		res.send(menuItems);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

menuRouter.get("/:menu_id", async (req, res) => {
	const { menu_id } = req.params;
	try {
		const { rows } = await pool.query(
			"SELECT * FROM menu WHERE menu_id = $1;",
			[menu_id]
		);

		if (rows.length === 0) {
			res.status(404).json({ message: "Menu item not found" });
			return;
		}

		const row = rows[0];
		const inventory_items = await getInventoryItemsByMenuId(row.menu_id);

		res.send({
			menu_id: row.menu_id,
			name: row.name,
			price: row.price,
			type: row.type,
			inventory_items,
		});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

menuRouter.get("/name/:name", async (req, res) => {
	const { name } = req.params;
	try {
		const { rows } = await pool.query(
			"SELECT * FROM menu WHERE name = $1;",
			[name]
		);

		if (rows.length === 0) {
			res.status(404).json({ message: "Menu item not found" });
			return;
		}

		const row = rows[0];
		const inventory_items = await getInventoryItemsByMenuId(row.menu_id);

		res.send({
			menu_id: row.menu_id,
			name: row.name,
			price: row.price,
			type: row.type,
			inventory_items,
		});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

menuRouter.get("/type/:type", async (req, res) => {
	const { type } = req.params;
	try {
		const { rows } = await pool.query(
			"SELECT * FROM menu WHERE type = $1;",
			[type]
		);
		const menuItems = [];

		for (const row of rows) {
			const inventory_items = await getInventoryItemsByMenuId(
				row.menu_id
			);
			menuItems.push({
				menu_id: row.menu_id,
				name: row.name,
				price: row.price,
				type: row.type,
				inventory_items,
			});
		}

		res.send(menuItems);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

export default menuRouter;
