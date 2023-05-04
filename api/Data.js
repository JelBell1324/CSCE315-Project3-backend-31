import { pool } from "../server.js";

/**
 * Database management class for communicating with PostgreSQL backend database server.
 */
class Data {
	/**
	 * Gets order with order_id
	 * @param order_id {number}
	 * @return order {Object}
	 */
	async getOrder(order_id) {
		const { rows } = await pool.query(
			"SELECT * FROM orders WHERE order_id = $1;",
			[order_id]
		);
		return rows[0];
	}
	
	/**
	 * Gets list of orders with customer id
	 * @param customer_id {number}
	 * @return order {array}
	 */
	async getOrdersByCustomerId(customer_id) {
		const { rows } = await pool.query(
			"SELECT * FROM orders WHERE customer_id = $1;",
			[customer_id]
		);
		return rows;
	}

	/**
	 * Gets list of orders with date
	 * @param date {date}
	 * @return order {array}
	 */
	async getOrdersByDate(date) {
		const { rows } = await pool.query(
			"SELECT * FROM orders WHERE date = $1;",
			[date]
		);
		return rows;
	}

	/**
	 * Gets order since date
	 * @param date {date}
	 * @return order {object}
	 */
	async getOrdersSinceDate(date) {
		const { rows } = await pool.query(
			"SELECT * FROM orders WHERE date >= $1;",
			[date]
		);
		return rows;
	}

	/**
	 * Gets all orders
	 * @return order {array}
	 */
	async getAllOrders() {
		const { rows } = await pool.query("SELECT * FROM orders;");
		return rows;
	}

	/**
	 * Gets list of 10 most recent order
	 * @param date {date}
	 * @return order {array}
	 */
	async getRecentOrders() {
		const { rows } = await pool.query(
			"SELECT * FROM orders ORDER BY order_id DESC LIMIT 10;"
		);
		return rows;
	}

	/**
	 * Gets menu item with menu id
	 * @param menu_id {number}
	 * @return menu_item {object}
	 */
	async getMenu(menu_id) {
		const { rows } = await pool.query(
			"SELECT * FROM menu WHERE menu_id = $1;",
			[menu_id]
		);
		return rows[0];
	}

	/**
	 * Gets menu item name with menu id
	 * @param menu_id {number}
	 * @return name {string}
	 */
	async getMenuName(menu_id) {
		const { rows } = await pool.query(
			"SELECT * FROM menu WHERE menu_id = $1;",
			[menu_id]
		);
		return rows[0].name;
	}

	/**
	 * Gets inventory items with menu_id
	 * @param menu_id {number}
	 * @return array of inventory items
	 */
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
	
	/**
	 * Gets menu item with menu item name
	 * @param name {string}
	 * @return menu item
	 */
	async getMenuByName(name) {
		const { rows } = await pool.query(
			"SELECT * FROM menu WHERE name = $1;",
			[name]
		);
		const inventory_items = await this.getInventoryItemsByMenuId(
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

	/**
	 * Gets list of all menu items
	 * @return array of menu items
	 */
	async getAllMenuItems() {
		const { rows } = await pool.query(
			"SELECT * FROM menu ORDER BY menu_id;"
		);
		return rows;
	}

	/**
	 * Gets menu items with foodType
	 * @param foodType {string}
	 */
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

	/**
	 * Gets inventory item with inventory id
	 * @param inventory_id {number}
	 * @return inventory item
	 */
	async getInventory(inventory_id) {
		const { rows } = await pool.query(
			"SELECT * FROM inventory WHERE inventory_id = " + inventory_id + ";"
		);
		return rows;
	}
	
	/**
	 * Gets inventory item with inventory item name
	 * @param name {string}
	 * @return inventory item
	 */
	async getInventoryByName(name) {
		const { rows } = await pool.query(
			"SELECT * FROM inventory WHERE name = $1;",
			[name]
		);
		return rows[0];
	}

	/**
	 * Gets all inventory items
	 * @return array of inventory items
	 */
	async getAllInventoryItems() {
		const { rows } = await pool.query("SELECT * FROM inventory;");
		return rows;
	}

	/**
	 * Gets all restaurants
	 * @return array of restaurants
	 */
	async getRestaurant() {
		const { rows } = await pool.query("SELECT * FROM restaurant;");
		return rows;
	}

	/**
	 * Gets menu items with inventory_id
	 * @param inventory_id {number}
	 * @return array of menu items
	 */
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
	
	/**
	 * Gets list of orders that contain a menu item with menu id
	 * @param menu_id {number}
	 * @return array of orders
	 */
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

	/**
	 * Gets menu items with order_id
	 * @param order_id {number}
	 * @return array of menu items
	 */
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

	/**
	 * Makes new order and makes all necessary changes to database and
	 * - adds all corresponding menu_to_order entries
	 * - adds order entry into orders table
	 * @param menu_id {number}
	 * @param timestamp {date}
	 * @param customer_id {number}
	 * @param staff_id {number}
	 * @param menu_items {array}
	 * @return order id of order that was created and -1 if unsuccessful
	 */
	async makeOrder(cost_total, timestamp, customer_id, staff_id, menu_items) {
		// console.log("Data.js[line 189] cost_total:", cost_total);
		// console.log("Data.js[line 190] timestamp:", timestamp);
		// console.log("Data.js[line 191] customer_id:", customer_id);
		// console.log("Data.js[line 192] staff_id:", staff_id);
		// console.log("Data.js[line 193] menu_items:", menu_items);
		try {
			const { rows } = await pool.query(
				"INSERT INTO orders (cost_total, date, customer_id, staff_id) VALUES ($1, $2, $3, $4) RETURNING order_id;",
				[cost_total, timestamp, customer_id, staff_id]
			);
			const order_id = rows[0].order_id;

			for (const item of menu_items) {
				// console.log("Data.js[line 202] item1:", item);
				await pool.query(
					"INSERT INTO menu_to_order (menu_id, order_id, quantity) VALUES ($1, $2, $3);",
					[item[0], order_id, item[1]]
				);
			}

			for (const item of menu_items) {
				// console.log("Data.js[line 210] item2:", item);
				const { rows: inventoryItems } = await pool.query(
					"SELECT * FROM inventory_to_menu WHERE menu_id = $1;",
					[item[0]]
				);

				for (const inventoryItem of inventoryItems) {
					await pool.query(
						"UPDATE inventory SET quantity = quantity - $1 WHERE inventory_id = $2;",
						[
							inventoryItem.quantity * item[1],
							inventoryItem.inventory_id,
						]
					);
				}
			}
			console.log("Order " + order_id + " Created Successfully.")
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
	 * @param order_id {number} a int for order_id to search by
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
	 * @param inventoryItemsString {string} - The string containing the inventory items and their quantities
	 * @return {Array} - An array of objects representing each inventory item and its quantity
	 */
	async parseInventoryItems(inventoryItemsString) {
		let inventoryItems = [];

		let items = inventoryItemsString.split("\n");
		for (let item of items) {
			let parts = item.trim().split("|");
			let name = parts[0].trim();
			let quantity = parseInt(parts[1].trim());

			let inventoryId = (await this.getInventoryByName(name))
				.inventory_id;
			inventoryItems.push({
				inventoryId: inventoryId,
				quantity: quantity,
			});
		}

		return inventoryItems;
	}
	/**
	 * Adds a menu item and make all necessary changes to database and
	 * - adds new menu entry into menu table
	 * - adds all inventory_to_menu entries
	 *
	 * @param name {string}            a name for the new menu item
	 * @param price {number}           a double for price of the menu item
	 * @param type {string}          a string for type of the menu item
	 * @param inventory_items {array} an Array of pairs {inventoryId: Integer, quantity: Integer}
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
	 * @param menu_id {number} a menu_id to search by
	 * @return a boolean value for success (true) or failure (false)
	 */
	async removeMenuItem(menu_id) {
		console.log("Attempting to delete", menu_id, "from Menu");
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
		console.log("Deleted", menu_id, "from Menu");
		return true;
	}

	/**
	 * Updates a menu item and sets its price.
	 *
	 * @param menu_id {number}  a menu_id to search by
	 * @param newPrice {number} a new price to set
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
	 * @param name {string}    a name to search by
	 * @param newPrice {number} a new price to set
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
	 * @param order_id {number} an order id to search by
	 * @param menu_id {number}  a menu_id to add
	 * @param quantity {number} a quantity for the menu item added
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
	 * @param order_id {number} an order_id to search by
	 * @param menu_id {number} a menu_id to search by
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
	 * @param order_id {number} id of the order that is being updated
	 * @param newCostTotal {number} the new price of the order to be set
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
	 * @param restaurant_id {number} id of the restaurant that is being updated
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
	 * @param inventory_id {number} id of the inventory item being updated
	 * @param quantity {number} new stock of the Inventory
	 * @return a Promise that resolves to a boolean value for success (true) or failure (false)
	 */
	async updateInventoryQuantityById(inventory_id, quantity) {
		const sqlStatement = `UPDATE inventory SET quantity = (${quantity}) WHERE inventory_id = ${inventory_id};`;
		console.log("here");
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
	 * @param name {string} name of the Inventory item to be restocked
	 * @param quantity {number} new stock of the Inventory
	 * @return a Promise that resolves to a boolean value for success (true) or failure (false)
	 */
	async updateInventoryQuantityByName(name, quantity) {
		const sqlStatement = `UPDATE inventory SET quantity = (${quantity}) WHERE name = '${name}';`;
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
	 * @param inventory_id {number} id of the Inventory item to be updated
	 * @param quantity {number} amount of Inventory being restocked/deleted
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
	 * @param name {string} name of the Inventory item to be created
	 * @param quantity {number} amount of Inventory being created
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

	
	/**
	 * Gets sales report between sDate and eDate
	 * @param sDate {date}
	 * @param eDate {date}
	 */
	async getSalesReport(sDate, eDate) {
		const sqlStatement = `
			SELECT m.menu_id, m.name, SUM(mto.quantity) AS total_qty 
			FROM menu_to_order mto
			INNER JOIN menu m ON m.menu_id = mto.menu_id
			WHERE mto.order_id IN (
				SELECT order_id FROM orders 
				WHERE date >= '${sDate}' AND date <= '${eDate}'
			)
			GROUP BY m.menu_id, m.name
			ORDER BY total_qty DESC;`;
		try {
			console.log("Starting sales report generation...");
			const { rows } = await pool.query(sqlStatement);
			console.log(rows);
			return rows;
		} catch (err) {
			console.error(err);
		}
	}

	/**
	 * Gets restock report with minimumQty
	 * @param minimumQty {number}
	 */
	async getRestockReport(minimumQty) {
		const sqlStatement = `SELECT * FROM inventory WHERE quantity <= ${minimumQty} ORDER by quantity ASC;`;
		try {
			console.log("Starting restock report generation...");
			const { rows } = await pool.query(sqlStatement);
			return rows;
		} catch (err) {
			console.error(err);
		}
	}

	/**
	 * Gets inventory sales since date
	 * @param timestamp {date}
	 */
	async getInventorySalesSinceTimestamp(timestamp) {
		if (!(timestamp instanceof Date)) {
			timestamp = new Date(timestamp);
		}

		const query = `
		  SELECT i.inventory_id, i.name, i.quantity,
			COALESCE(SUM(im.quantity * mo.quantity), 0) AS total_sold
		  FROM inventory i
		  LEFT JOIN inventory_to_menu im ON i.inventory_id = im.inventory_id
		  LEFT JOIN menu m ON m.menu_id = im.menu_id
		  LEFT JOIN menu_to_order mo ON m.menu_id = mo.menu_id
		  LEFT JOIN orders o ON o.order_id = mo.order_id
		  WHERE o.date >= $1
		  GROUP BY i.inventory_id, i.name, i.quantity
		`;

		try {
			const res = await pool.query(query, [timestamp]);
			const inventorySalesPercentages = res.rows.map((row) => {
				const totalQuantitySold = parseInt(row.total_sold, 10);
				const percentageSold =
					(totalQuantitySold / (totalQuantitySold + row.quantity)) *
					100;
				return {
					inventory_id: row.inventory_id,
					name: row.name,
					quantity: row.quantity,
					percentage_sold: percentageSold,
				};
			});

			return inventorySalesPercentages;
		} catch (e) {
			console.error(e);
			return null;
		}
	}

	/**
	 * Gets report of excess inventory items
	 * @return array of inventory items and their percent sold
	 */
	async getExcessReport(timestamp) {
		const inventorySalesPercentages =
			await this.getInventorySalesSinceTimestamp(timestamp);
		let sold = {};
		let out = [];

		if (inventorySalesPercentages === null) {
			return null;
		}

		for (const percentage of inventorySalesPercentages) {
			const key = percentage.inventory_id;
			sold[key] = true;
			if (percentage.percentage_sold < 10) {
				out.push(percentage);
			}
		}

		const inventoryItems = await this.getAllInventoryItems();

		for (const item of inventoryItems) {
			if (!sold.hasOwnProperty(item.inventory_id)) {
				const percentage_sold = 0.0;
				const mergedItemObject = { ...item, percentage_sold };
				out.push(mergedItemObject);
			}
		}
		console.log(out);
		return out;
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

	/**
	 * Gets x report
	 * @param restaurant_id {number}
	 */
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

	/**
	 * Gets z report
	 * @param restaurant_id {number}
	 */
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
