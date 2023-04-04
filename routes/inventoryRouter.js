import express from "express";
import pool from "../server.js";
const inventoryRouter = express.Router();

inventoryRouter.get("/inventory/:inventory_id", async (req, res) => {
  const { inventory_id } = req.params;

  try {
    const { rows } = await pool.query(
      `SELECT * FROM inventory WHERE inventory_id = $1;`,
      [inventory_id]
    );

    if (rows.length > 0) {
      res.status(200).json(rows[0]);
    } else {
      res.status(404).json({ message: "Inventory item not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

inventoryRouter.get("/inventory/name/:name", async (req, res) => {
  const { name } = req.params;

  try {
    const { rows } = await pool.query(
      `SELECT * FROM inventory WHERE name = $1;`,
      [name]
    );

    if (rows.length > 0) {
      res.status(200).json(rows[0]);
    } else {
      res.status(404).json({ message: "Inventory item not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

inventoryRouter.get("/inventory", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM inventory;");

    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default inventoryRouter;
