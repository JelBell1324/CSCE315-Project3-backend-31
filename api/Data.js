import { pool } from "../server.js";

class Data {


	/**
	Returns an order object given an order id
	@param {number} order_id - The id of the order
	@returns {Object} The order object
	*/
	async getOrder(order_id) {
		const { rows } = await pool.query(
			"SELECT * FROM orders WHERE order_id = $1;",
			[order_id]
		);
		return rows[0];
	}


	/**
	Returns an array of all orders associated with a given customer id
	@param {number} customer_id - The id of the customer
	@returns {Array} An array of order objects
	*/
	async getOrdersByCustomerId(customer_id) {
		const { rows } = await pool.query(
			"SELECT * FROM orders WHERE customer_id = $1;",
			[customer_id]
		);
		return rows;
	}

	/**
	Retrieves all orders placed on a specific date.
	@param {string} date - The date in 'YYYY-MM-DD' format to retrieve orders for.
	@returns {Promise<Array>} - A promise that resolves to an array of orders placed on the given date, or an empty array if no orders are found.
	*/
	async getOrdersByDate(date) {
		const { rows } = await pool.query(
			"SELECT * FROM orders WHERE date = $1;",
			[date]
		);
		return rows;
	}

	/**
	Returns an array of all orders placed on or after a given date
	@param {string} date - The date in string format "YYYY-MM-DD"
	@returns {Array} An array of order objects
	*/
	async getOrdersSinceDate(date) {
		const { rows } = await pool.query(
			"SELECT * FROM orders WHERE date >= $1;",
			[date]
		);
		return rows;
	}

	/**
	Returns an array of all orders
	@returns {Array} An array of order objects
	*/
	async getAllOrders() {
		const { rows } = await pool.query("SELECT * FROM orders;");
		return rows;
	}

	/**
	Returns an array of the 50 most recent orders
	@returns {Array} An array of order objects
	*/
	async getRecentOrders() {
		const { rows } = await pool.query(
			"SELECT * FROM orders ORDER BY order_id DESC LIMIT 50;"
		);
		return rows;
	}


	/**
	Returns a menu object given a menu id
	@param {number} menu_id - The id of the menu item
	@returns {Object} The menu object
	*/
	async getMenu(menu_id) {
		const { rows } = await pool.query(
			"SELECT * FROM menu WHERE menu_id = $1;",
			[menu_id]
		);
		return rows[0];
	}

	/**
	Returns the name of a menu item given a menu id
	@param {number} menu_id - The id of the menu item
	@returns {string} The name of the menu item
	*/
	async getMenuName(menu_id) {
		const { rows } = await pool.query(
			"SELECT * FROM menu WHERE menu_id = $1;",
			[menu_id]
		);
		return rows[0].name;
	}

	/**
	Returns an array of inventory items associated with a given menu id
	@param {number} menu_id - The id of the menu item
	@returns {Array} An array of inventory items
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
	Returns a menu object given a menu name
	@param {string} name - The name of the menu item
	@returns {Object} The menu object
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
	Returns an array of all menu items
	@returns {Array} An array of menu objects
	*/
	async getAllMenuItems() {
		const { rows } = await pool.query(
			"SELECT * FROM menu ORDER BY menu_id;"
		);
		return rows;
	}

	/**
	Returns an array of all menu items of a given food type
	@param {string} foodType - The type of food
	@returns {Array} An array of menu objects
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
	Returns an array of inventory items associated with a given inventory id
	@param {number} inventory_id - The id of the inventory item
	@returns {Array} An array of inventory items
	*/
	async getInventory(inventory_id) {
		const { rows } = await pool.query(
			"SELECT * FROM inventory WHERE inventory_id = " + inventory_id + ";"
		);
		return rows;
	}

	/**
	Returns an inventory item object given an inventory name
	@param {string} name - The name of the inventory item
	@returns {Object} The inventory item object
	*/
	async getInventoryByName(name) {
		const { rows } = await pool.query(
			"SELECT * FROM inventory WHERE name = $1;",
			[name]
		);
		return rows[0];
	}

	/**
	Returns an array of all inventory items
	@returns {Array} An array of inventory item objects
	*/
	async getAllInventoryItems() {
		const { rows } = await pool.query("SELECT * FROM inventory;");
		return rows;
	}


	/**
	 * Retrieves all rows from the 'restaurant' table in the database.
	 * @return An array of objects representing each row in the 'restaurant' table.
	 */
	async getRestaurant() {
		const { rows } = await pool.query("SELECT * FROM restaurant;");
		return rows;
	}

	/**
	 * Returns an array of menu items that correspond to a given inventory ID.
	 * @param inventory_id An integer representing the inventory ID.
	 * @return An array of menu items.
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
	 * Returns an array of orders that correspond to a given menu ID.
	 * @param menu_id An integer representing the menu ID.
	 * @return An array of orders.
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
	 * Retrieves an array of menu items associated with a given order ID.
	 * @param order_id The ID of the order to retrieve menu items for.
	 * @return An array of objects, where each object contains a menu item and the quantity of that item ordered for the given order ID.
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
	 * Creates a new order in the database with the given information, and updates inventory quantities based on the menu items in the order.
	 * @param cost_total The total cost of the order.
	 * @param timestamp The timestamp of when the order was made.
	 * @param customer_id The ID of the customer placing the order.
	 * @param staff_id The ID of the staff member who took the order.
	 * @param menu_items An array of arrays, where each inner array contains a menu item ID and the quantity ordered for that item.
	 * @return The ID of the newly created order if successful, or -1 if there was an error.
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
	 * @param quantity new stock of the Inventory
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
	 * @param name name of the Inventory item to be restocked
	 * @param quantity new stock of the Inventory
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

	/**
	 * Retrieves a report of menu items sold within a given date range.
	 * @param sDate The start date of the date range to check sales for, in the format 'YYYY-MM-DD'.
	 * @param eDate The end date of the date range to check sales for, in the format 'YYYY-MM-DD'.
	 * @return An array of objects representing menu items sold within the given date range, sorted in descending order by quantity.
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
	 * Retrieves a list of inventory items with a quantity below a given threshold, sorted in ascending order by quantity.
	 * @param minimumQty The minimum quantity threshold for items to include in the restock report.
	 * @return An array of objects representing inventory items that need to be restocked.
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
	 * Retrieves the sales percentages for each inventory item since a given timestamp.
	 * @param timestamp A timestamp representing the time to check sales since.
	 * @return An array of objects representing inventory items and their sales percentages since the given timestamp.
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
	 * Generates an excess inventory report for items that have sold less than 10% of their inventory since a given timestamp.
	 * @param timestamp A timestamp representing the time to check sales since.
	 * @return An array of inventory items that have sold less than 10% of their inventory since the given timestamp.
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
	 * Generates an X report for a given restaurant ID, either for sales since the last Z report or for sales for the current day.
	 * @param restaurant_id An integer representing the restaurant ID.
	 * @return An object representing the X report.
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
	 * Generates a Z report for a given restaurant ID and saves it to the database.
	 * @param restaurant_id An integer representing the restaurant ID.
	 * @return An object representing the Z report.
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
