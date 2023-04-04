import express from "express";
import cors from "cors";
import orderRouter from "./routes/orderRouter.js";
import menuRouter from "./routes/menuRouter.js";
import postgres from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = postgres;
const app = express();
// using cors here
app.use(cors());


const pool = new Pool({
	host: process.env.PSQL_HOST,
	port: process.env.PSQL_PORT,
	database: process.env.PSQL_DATABASE,
	user: process.env.PSQL_USER,
	password: process.env.PSQL_PASSWORD,
	ssl: { rejectUnauthorized: false },
});

process.on("SIGINT", function () {
	pool.end();
	console.log("Application successfully shutdown");
	process.exit(0);
});

app.set("view engine", "ejs");

// app.get("/user", (req, res) => {
// 	let teammembers = [];
// 	pool.query("SELECT * FROM teammembers;").then((query_res) => {
// 		for (let i = 0; i < query_res.rowCount; i++) {
// 			teammembers.push(query_res.rows[i]);
// 		}
// 		const data = { teammembers: teammembers };
// 		console.log(teammembers);
// 		res.render("user", data);
// 	});
// });

const PORT = process.env.PORT || 8080;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/orders", orderRouter);
app.use("/menu", menuRouter);

app.listen(PORT, () => {
	console.log(`Example app listening at http://localhost:${PORT}`);
});

export default pool;