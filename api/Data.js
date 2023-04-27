import { pool } from "../server.js";

class Data {
	async getOrder(order_id) {
		const { rows } = await pool.query(
			"SELECT * FROM orders WHERE order_id = $1;",
			[order_id]
		);
		return rows[0];
	}

	async getOrdersByCustomerId(customer_id) {
		const { rows } = await pool.query(
			"SELECT * FROM orders WHERE customer_id = $1;",
			[customer_id]
		);
		return rows;
	}

	async getOrdersByDate(date) {
		const { rows } = await pool.query(
			"SELECT * FROM orders WHERE date = $1;",
			[date]
		);
		return rows;
	}

	async getOrdersSinceDate(date) {
		const { rows } = await pool.query(
			"SELECT * FROM orders WHERE date >= $1;",
			[date]
		);
		return rows;
	}

	async getAllOrders() {
		const { rows } = await pool.query("SELECT * FROM orders;");
		return rows;
	}

	async getRecentOrders() {
		const { rows } = await pool.query(
			"SELECT * FROM orders ORDER BY order_id DESC LIMIT 50;"
		);
		return rows;
	}

	async getMenu(menu_id) {
		const { rows } = await pool.query(
			"SELECT * FROM menu WHERE menu_id = $1;",
			[menu_id]
		);
		return rows[0];
	}

	async getMenuName(menu_id) {
		const { rows } = await pool.query(
			"SELECT * FROM menu WHERE menu_id = $1;",
			[menu_id]
		);
		return rows[0].name;
	}

	async getInventoryItemsByMenuId(menu_id) {
		try {
			const { rows } = await pool.query(
				"SELECT * FROM inventory_to_menu WHERE menu_id = $1;",
				[menu_id]
			);
			return rows;
		} catch (err) {
			console.error(err);
			return null;
		}
	}

	async getMenuByName(name) {
		const { rows } = await pool.query(
			"SELECT * FROM menu WHERE name = $1;",
			[name]
		);
		const inventory_items = await getInventoryItemsByMenuId(
			rows[0].menu_id
		);
		const menu = {
			menu_id: rows[0].menu_id,
			name: rows[0].name,
			price: rows[0].price,
			type: rows[0].type,
			inventory_items,
		};
		return menu;
	}

	async getAllMenuItems() {
		const { rows } = await pool.query("SELECT * FROM menu;");
		// const menuItems = [];
		// for (const row of rows) {
		// 	const inventory_items = await this.getInventoryItemsByMenuId(
		// 		row.menu_id
		// 	);
		// 	const item = {
		// 		menu_id: row.menu_id,
		// 		name: row.name,
		// 		price: row.price,
		// 		type: row.type,
		// 		inventory_items,
		// 	};
		// 	menuItems.push(item);
		// }
		return rows;
	}

	async getMenuByType(foodType) {
		const { rows } = await pool.query(
			"SELECT * FROM menu WHERE type = $1;",
			[foodType]
		);
		const menuItems = [];
		for (const row of rows) {
			const inventory_items = await this.getInventoryItemsByMenuId(
				row.menu_id
			);
			const item = {
				menu_id: row.menu_id,
				name: row.name,
				price: row.price,
				type: row.type,
				inventory_items,
			};
			menuItems.push(item);
		}
		return menuItems;
	}

	async getInventory(inventory_id) {
		const { rows } = await pool.query(
			"SELECT * FROM inventory WHERE inventory_id = " + inventory_id + ";"
		);
		return rows;
	}

	async getInventoryByName(name) {
		const { rows } = await pool.query(
			"SELECT * FROM inventory WHERE name = $1;",
			[name]
		);
		return rows[0];
	}

	async getAllInventoryItems() {
		const { rows } = await pool.query("SELECT * FROM inventory;");
		return rows;
	}

	async getRestaurant() {
		const { rows } = await pool.query("SELECT * FROM restaurant;");
		return rows;
	}

	async getMenuItemsByInventoryId(inventory_id) {
		const { rows } = await pool.query(
			"SELECT * FROM inventory_to_menu WHERE inventory_id = $1;",
			[inventory_id]
		);
		const menuItems = [];
		for (const row of rows) {
			const menu_item = await getMenu(row.menu_id);
			menuItems.push(menu_item);
		}
		return menuItems;
	}

	async getOrdersByMenuId(menu_id) {
		const { rows } = await pool.query(
			"SELECT * FROM menu_to_order WHERE menu_id = $1;",
			[menu_id]
		);
		const orderItems = [];
		for (const row of rows) {
			const order_item = await getOrder(row.order_id);
			orderItems.push(order_item);
		}
		return orderItems;
	}

	async getMenuItemsByOrderId(order_id) {
		const { rows } = await pool.query(
			"SELECT * FROM menu_to_order WHERE order_id = $1;",
			[order_id]
		);
		const menuItems = [];
		for (const row of rows) {
			const menuItem = await this.getMenu(row.menu_id);
			menuItems.push({ quantity: row.quantity, menuItem });
		}
		return menuItems;
	}

	async makeOrder(cost_total, timestamp, customer_id, staff_id, menu_items) {
		try {
			const { rows } = await pool.query(
				"INSERT INTO orders (cost_total, date, customer_id, staff_id) VALUES ($1, $2, $3, $4) RETURNING order_id;",
				[cost_total, timestamp, customer_id, staff_id]
			);
			const order_id = rows[0].order_id;

			console.log(menu_items);

			for (const item of menu_items) {
				await pool.query(
					"INSERT INTO menu_to_order (menu_id, order_id, quantity) VALUES ($1, $2, $3);",
					[item.first, order_id, item.second]
				);
			}

			for (const item of menu_items) {
				const { rows: inventoryItems } = await pool.query(
					"SELECT * FROM inventory_to_menu WHERE menu_id = $1;",
					[item.first]
				);

				for (const inventoryItem of inventoryItems) {
					await pool.query(
						"UPDATE inventory SET quantity = quantity - $1 WHERE inventory_id = $2;",
						[
							inventoryItem.quantity * item.second,
							inventoryItem.inventory_id,
						]
					);
				}
			}

			return order_id;
		} catch (error) {
			console.error("Error while creating order:", error);
			return -1;
		}
	}

	/**
	 * Removes order and make all necessary changes to database and
	 * - removes all corresponding menu_to_order entries
	 * - removes order entry into orders table
	 *
	 * @param order_id a int for order_id to search by
	 * @return a boolean value for success (true) or failure (false)
	 */
	async removeOrder(order_id) {
		const sqlStatement1 = "DELETE FROM menu_to_order WHERE order_id = $1;";

		try {
			await pool.query(sqlStatement1, [order_id]);
		} catch (e) {
			console.error(
				"Above error happened while deleting menu_to_order entry (called from removeOrder)."
			);
			console.error(`${e.constructor.name}: ${e.message}`);
			return false; // ERROR
		}

		const sqlStatement2 = "DELETE FROM orders WHERE order_id = $1;";
		try {
			await pool.query(sqlStatement2, [order_id]);
		} catch (e) {
			console.error("Above error happened while deleting order entry.");
			console.error(`${e.constructor.name}: ${e.message}`);
			return false; // ERROR
		}

		return true;
	}

	/**
	 * Parses a string of inventory items and their quantities and returns an array
	 * of objects representing each item and its quantity.
	 *
	 * @param {string} inventoryItemsString - The string containing the inventory items and their quantities
	 * @return {Array} - An array of objects representing each inventory item and its quantity
	 */
	async parseInventoryItems(inventoryItemsString) {
		let inventoryItems = itemIngredients.split("\n").map((line) => {
<<<<<<< HEAD
			const [ingredientName, quantity] = line.split(" | ");
			return [ingredientName.trim(), quantity.trim()];
=======
		  const [inventoryItems, quantity] = line.split(" | ");
		  return [inventoryItems.trim(), quantity.trim()];
>>>>>>> f2ae7cbaa4c0a37cc055685249b5cfbc40e4a204
		});
		return inventoryItems;
	}

	/**
	 * Adds a menu item and make all necessary changes to database and
	 * - adds new menu entry into menu table
	 * - adds all inventory_to_menu entries
	 *
	 * @param name            a name for the new menu item
	 * @param price           a double for price of the menu item
	 * @param type            a string for type of the menu item
	 * @param inventory_items an Array of pairs {inventoryId: Integer, quantity: Integer}
	 *                        for inventory_items in the menu item
	 * @return a boolean value for success (true) or failure (false)
	 */
	async addMenuItem(name, price, type, inventory_items) {
		// Make Menu Entry
		const sqlStatement1 =
			"INSERT INTO menu (name, price, type) VALUES ($1, $2, $3) RETURNING menu_id;";

		let menu_id = -1;
		try {
			const { rows } = await pool.query(sqlStatement1, [
				name,
				price,
				type,
			]);
			if (rows.length > 0) {
				menu_id = rows[0].menu_id;
				console.log("new menuItem with menuid: " + menu_id);
			}
		} catch (e) {
			console.error("Above error happened while creating order entry.");
			console.error(`${e.constructor.name}: ${e.message}`);
			return false;
		}

		let inventory = await this.parseInventoryItems(inventory_items);

		// Make inventory_to_menu Entry(ies)
		for (let i = 0; i < inventory.length; i++) {
			const sqlStatement2 =
				"INSERT INTO inventory_to_menu (inventory_id, menu_id, quantity) VALUES ($1, $2, $3);";
			try {
				await pool.query(sqlStatement2, [
					inventory[i].inventoryId,
					menu_id,
					inventory[i].quantity,
				]);
			} catch (e) {
				console.error(
					"Above error happened while creating inventory_to_menu entry."
				);
				console.error(`${e.constructor.name}: ${e.message}`);
				return false;
			}
		}

		return true;
	}

	/**
	 * Removes a menu item and make all necessary changes to database and
	 * - removes all corresponding inventory_to_menu entries
	 * - removes all corresponding menu_to_order entries
	 * - removes menu entry from menu table
	 *
	 * @param menu_id a menu_id to search by
	 * @return a boolean value for success (true) or failure (false)
	 */
	async removeMenuItem(menu_id) {
		const sqlStatement1 =
			"DELETE FROM inventory_to_menu WHERE menu_id = $1;";

		try {
			await pool.query(sqlStatement1, [menu_id]);
		} catch (e) {
			console.error(
				"Above error happened while deleting inventory_to_menu entry (called from removeMenuItem)."
			);
			console.error(`${e.constructor.name}: ${e.message}`);
			return false; // ERROR
		}

		const sqlStatement2 = "DELETE FROM menu_to_order WHERE menu_id = $1;";
		try {
			await pool.query(sqlStatement2, [menu_id]);
		} catch (e) {
			console.error(
				"Above error happened while deleting menu_to_order entry (called from removeMenuItem)."
			);
			console.error(`${e.constructor.name}: ${e.message}`);
			return false; // ERROR
		}

		const sqlStatement3 = "DELETE FROM menu WHERE menu_id = $1;";
		try {
			await pool.query(sqlStatement3, [menu_id]);
		} catch (e) {
			console.error("Above error happened while deleting menu entry.");
			console.error(`${e.constructor.name}: ${e.message}`);
			return false; // ERROR
		}

		return true;
	}

	/**
	 * Updates a menu item and sets its price.
	 *
	 * @param menu_id  a menu_id to search by
	 * @param newPrice a new price to set
	 * @return a boolean value for success (true) or failure (false)
	 */
	async updateMenuPriceById(menu_id, newPrice) {
		const query = "UPDATE menu SET price = $1 WHERE menu_id = $2;";

		try {
			await pool.query(query, [newPrice, menu_id]);
			return true; // SUCCESS
		} catch (e) {
			console.error(`${e.constructor.name}: ${e.message}`);
		}
		return false; // ERROR
	}

	/**
	 * Updates a menu item and sets its price.
	 *
	 * @param name     a name to search by
	 * @param newPrice a new price to set
	 * @return a boolean value for success (true) or failure (false)
	 */
	async updateMenuPriceByName(name, newPrice) {
		const query = "UPDATE menu SET price = $1 WHERE name = $2;";

		try {
			await pool.query(query, [newPrice, name]);
			return true; // SUCCESS
		} catch (e) {
			console.error(`${e.constructor.name}: ${e.message}`);
		}
		return false; // ERROR
	}

	/**
	 * Adds a menu item to an order.
	 *
	 * @param order_id an order id to search by
	 * @param menu_id  a menu_id to add
	 * @param quantity a quantity for the menu item added
	 * @return a Promise that resolves to a boolean value for success (true) or failure (false)
	 */
	async addMenuItemToOrder(order_id, menu_id, quantity) {
		// Get order
		const original_order = await getOrder(order_id);
		if (original_order === null) {
			console.log("addMenuItemToOrder error: order not found");
			return false;
		}
		let original_quantity = 0;

		for (let i = 0; i < original_order.menu_items.length; i++) {
			const menu_item = original_order.menu_items[i];
			if (menu_item.first === menu_id) {
				original_quantity = menu_item.second;
				break;
			}
		}
		const new_quantity = original_quantity + quantity;

		let sqlStatement;
		// If menu item was present
		if (original_quantity > 0) {
			sqlStatement =
				`UPDATE menu_to_order SET quantity = ${new_quantity} WHERE ` +
				`(menu_id = ${menu_id} AND order_id = ${order_id});`;
		} else {
			sqlStatement =
				`INSERT INTO menu_to_order (menu_id, order_id, quantity) VALUES ` +
				`(${menu_id}, ${order_id}, ${new_quantity});`;
		}

		try {
			await pool.query(sqlStatement);
			console.log(`new (updated) menu_to_order for order: ${order_id}`);
		} catch (e) {
			console.error(e);
			console.log(
				"Above error happened while updating menu_to_order entry."
			);
			console.error(`${e.constructor.name}: ${e.message}`);
			return false;
		}

		return true;
	}
	/**
	 * Removes a menu item from an order.
	 *
	 * @param order_id an order_id to search by
	 * @param menu_id a menu_id to search by
	 * @return a Promise that resolves to a boolean value for success (true) or failure (false)
	 */
	async removeMenuItemFromOrder(order_id, menu_id) {
		// Get order
		const original_order = await getOrder(order_id);
		if (original_order === null) {
			console.log("removeMenuItemFromOrder error: order not found");
			return false;
		}
		let present = false;

		for (let i = 0; i < original_order.menu_items.length; i++) {
			const menu_item = original_order.menu_items[i];
			if (menu_item.first === menu_id) {
				present = true;
				break;
			}
		}
		if (!present) {
			console.log("Error deleting item not present in order.");
		}

		const sqlStatement =
			`DELETE FROM menu_to_order WHERE ` +
			`(menu_id = ${menu_id} AND order_id = ${order_id});`;

		try {
			await pool.query(sqlStatement);
			console.log(`deleted menu_to_order for order: ${order_id}`);
		} catch (e) {
			console.error(e);
			console.log(
				"Above error happened while deleting menu_to_order entry."
			);
			console.error(`${e.constructor.name}: ${e.message}`);
			return false;
		}

		return true;
	}
	/**
	 * Updates the price of an order to a new cost from the user
	 *
	 * @param order_id id of the order that is being updated
	 * @param newCostTotal the new price of the order to be set
	 * @return a Promise that resolves to a boolean value for success (true) or failure (false)
	 */
	async updateOrderPriceById(order_id, newCostTotal) {
		const sqlStatement = `UPDATE orders SET cost_total = ${newCostTotal} WHERE order_id = ${order_id};`;
		try {
			await pool.query(sqlStatement);
			return true; // SUCCESS
		} catch (e) {
			console.error(e);
			console.error(`${e.constructor.name}: ${e.message}`);
		}
		return false; // ERROR
	}
	/**
	 * Updates the revenue of a restaurant by the restaurant id and summing order totals
	 *
	 * @param restaurant_id id of the restaurant that is being updated
	 * @return a Promise that resolves to a boolean value for success (true) or failure (false)
	 */
	async updateRevenue(restaurant_id) {
		const sqlStatement1 =
			"SELECT SUM(cost_total) AS total_revenue FROM orders;";
		let revenue = -1;
		try {
			const res = await pool.query(sqlStatement1);
			revenue = res.rows[0].total_revenue;
		} catch (e) {
			console.error(e);
			console.error(`${e.constructor.name}: ${e.message}`);
			return false;
		}

		const sqlStatement2 = `UPDATE restaurant SET revenue = ${revenue} WHERE restaurant_id = ${restaurant_id};`;
		try {
			await pool.query(sqlStatement2);
		} catch (e) {
			console.error(e);
			console.error(`${e.constructor.name}: ${e.message}`);
			return false;
		}

		return true;
	}

	/**
	 * Updates the quantity of an inventory item by the ID
	 *
	 * @param inventory_id id of the inventory item being updated
	 * @param quantity amount of Inventory being restocked/deleted
	 * @return a Promise that resolves to a boolean value for success (true) or failure (false)
	 */
	async addInventoryQuantityById(inventory_id, quantity) {
		const sqlStatement = `UPDATE inventory SET quantity = (quantity + ${quantity}) WHERE inventory_id = ${inventory_id};`;
		try {
			await pool.query(sqlStatement);
		} catch (e) {
			console.error(e);
			console.error(`${e.constructor.name}: ${e.message}`);
			return false;
		}

		return true;
	}
	/**
	 * Updates the quantity of an inventory item by name
	 *
	 * @param name name of the Inventory item to be restocked
	 * @param quantity amount of Inventory being restocked/deleted
	 * @return a Promise that resolves to a boolean value for success (true) or failure (false)
	 */
	async addInventoryQuantityByName(name, quantity) {
		const sqlStatement = `UPDATE inventory SET quantity = (quantity + ${quantity}) WHERE name = '${name}';`;
		try {
			await pool.query(sqlStatement);
		} catch (e) {
			console.error(e);
			console.error(`${e.constructor.name}: ${e.message}`);
			return false;
		}

		return true;
	}
	/**
	 * Updates and decreases the quantity of an inventory item by ID
	 *
	 * @param inventory_id id of the Inventory item to be updated
	 * @param quantity amount of Inventory being restocked/deleted
	 * @return a Promise that resolves to a boolean value for success (true) or failure (false)
	 */
	async deleteInventoryQuantityById(inventory_id, quantity) {
		const sqlStatement = `UPDATE inventory SET quantity = (quantity - ${quantity}) WHERE inventory_id = ${inventory_id};`;
		try {
			await pool.query(sqlStatement);
		} catch (e) {
			console.error(e);
			console.error(`${e.constructor.name}: ${e.message}`);
			return false;
		}

		return true;
	}
	/**
	 * Creates a new Inventory entry in the Database
	 *
	 * @param name name of the Inventory item to be created
	 * @param quantity amount of Inventory being created
	 * @return a Promise that resolves to a boolean value for success (true) or failure (false)
	 */
	async addNewInventoryItem(name, quantity) {
		const sqlStatement = `INSERT INTO inventory (name, quantity) VALUES ('${name}', ${quantity});`;
		try {
			await pool.query(sqlStatement);
		} catch (e) {
			console.error(e);
			console.error(`${e.constructor.name}: ${e.message}`);
			return false;
		}

		return true;
	}

	/*
	***************************************************
	PHASE 4 QUERIES - PHASE 4 QUERIES - PHASE 4 QUERIES
	***************************************************
	*/

	async getSalesReport(sDate, eDate) {
		const sqlStatement = `
			SELECT menu_id, SUM(quantity) AS total_qty 
			FROM menu_to_order 
			WHERE order_id IN (
				SELECT order_id FROM orders 
				WHERE date >= '${sDate}' AND date <= '${eDate}'
			)
			GROUP BY menu_id;`;

		const { rows } = await pool.query(sqlStatement);
		return rows;
	}

	async getRestockReport(minimumQty) {
		const sqlStatement = `SELECT * FROM inventory WHERE quantity <= ${minimumQty};`;
		console.log(minimumQty);
		try {
			console.log("Starting restock report generation...");
			const { rows } = await pool.query(sqlStatement);
			console.log("Report generated successfully.");
			return rows;
		} catch (err) {
			console.error(err);
		}
	}

	// TODO: Rest of phase 4 functions, XZ etc.

	/**
	 * Gets total sales for that day
	 *
	 * @param restaurant_id id of restaurant
	 * @return double representing the total sales for today
	 */
	async getTotalSalesForToday(restaurant_id) {
		let totalSales = 0;

		let sql =
			"SELECT SUM(o.cost_total) " +
			"FROM orders o " +
			"JOIN staff s ON o.staff_id = s.staff_id " +
			"WHERE s.restaurant_id = " +
			restaurant_id +
			" " +
			"AND o.date >= DATE_TRUNC('day', CURRENT_TIMESTAMP) " +
			"AND o.date < DATE_TRUNC('day', CURRENT_TIMESTAMP) + INTERVAL '1 day';";

		try {
			const { rows } = await pool.query(sql);
			if (rows[0].sum) {
				totalSales = rows[0].sum;
			}
		} catch (e) {
			console.error(e.name + ": " + e.message);
		}
		return totalSales;
	}

	/**
	 * Gets total sales since last Z report
	 *
	 * @param restaurant_id id of restaurant
	 * @return double representing total sales
	 */
	async getTotalSalesSinceLastZReport(restaurant_id) {
		let totalSales = 0;

		let sqlGetTotalSales =
			"SELECT SUM(o.cost_total) " +
			"FROM orders o " +
			"JOIN staff s ON o.staff_id = s.staff_id " +
			"WHERE (o.date > (SELECT MAX(z.report_date) FROM z_reports z WHERE z.restaurant_id = " +
			restaurant_id +
			" ) AND o.date < CURRENT_TIMESTAMP " +
			"AND s.restaurant_id = " +
			restaurant_id +
			");";

		try {
			let totalSalesSinceLastZReport = (
				await pool.query(sqlGetTotalSales)
			).rows;
			if (totalSalesSinceLastZReport[0].sum) {
				totalSales = totalSalesSinceLastZReport[0].sum;
			}
		} catch (e) {
			console.error(e.name + ": " + e.message);
		}
		return totalSales;
	}

	async getXReport(restaurant_id) {
		let report;

		const sqlCheckZReports = `SELECT COUNT(*) FROM z_reports WHERE restaurant_id = ${restaurant_id};`;
		const sqlGetLatestZReport = `SELECT MAX(z.report_date) FROM z_reports z WHERE z.restaurant_id = ${restaurant_id};`;

		let latestZReportDate = new Date(-1);

		try {
			let resCheckZReports = (await pool.query(sqlCheckZReports)).rows;
			const zReportsCount = resCheckZReports[0].count;

			if (zReportsCount === 0) {
				throw new Error(
					`No Z reports exist for restaurant ${restaurant_id} returned 0`
				);
			}

			let resGetLatestZReportDate = (
				await pool.query(sqlGetLatestZReport)
			).rows;
			if (resGetLatestZReportDate[0]) {
				latestZReportDate = new Date(resGetLatestZReportDate[0].max);
			} else {
				throw new Error(
					`No Z reports exist for restaurant ${restaurant_id}`
				);
			}

			report = {
				report_date: latestZReportDate,
				total_sales: await this.getTotalSalesSinceLastZReport(
					restaurant_id
				),
				restaurant_id: restaurant_id,
				type: "sinceLastZReport",
			};
		} catch (e) {
			console.error(e.name + ": " + e.message);
			report = {
				report_date: latestZReportDate,
				total_sales: await this.getTotalSalesForToday(restaurant_id),
				restaurant_id: restaurant_id,
				type: "salesToday",
			};
		}
		console.log("X Report - Total Sales: " + report.total_sales);
		return report;
	}

	async getZReport(restaurant_id) {
		const totalSales = await this.getTotalSalesForToday(restaurant_id);
		let report_id = -1;
		let report_date = new Date(-1);
		let report;

		console.log("Z Report - Total Sales: " + totalSales);

		const sql = `INSERT INTO z_reports (report_date, total_sales, restaurant_id) VALUES (CURRENT_TIMESTAMP, ${totalSales}, ${restaurant_id}) RETURNING report_id, report_date;`;

		try {
			const reportRes = (await pool.query(sql)).rows;
			if (reportRes[0]) {
				report_id = reportRes[0].report_id;
				report_date = new Date(reportRes[0].report_date);
			}
			console.log("Z Report saved successfully");

			report = {
				report_id: report_id,
				report_date: report_date,
				total_sales: totalSales,
				restaurant_id: restaurant_id,
			};
		} catch (e) {
			console.error(e.name + ": " + e.message);
			report = {
				report_id: restaurant_id,
				report_date: report_date,
				total_sales: -1,
				restaurant_id: restaurant_id,
			};
		}

		return report;
	}
}

export default Data;