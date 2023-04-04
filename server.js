import express from "express";
import { corsOptions, allowedOrigins } from "./config/origins.js";
import { sleep } from "./utils/helpers/sleep.js";
import cors from "cors";
import orderRouter from "./routes/orderRouter.js";
import menuRouter from "./routes/menuRouter.js";
import postgres from "pg";
const { Pool } = postgres;
const app = express();
import dotenv from "dotenv";
dotenv.config();

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

app.get("/user", (req, res) => {
	let teammembers = [];
	pool.query("SELECT * FROM teammembers;").then((query_res) => {
		for (let i = 0; i < query_res.rowCount; i++) {
			teammembers.push(query_res.rows[i]);
		}
		const data = { teammembers: teammembers };
		console.log(teammembers);
		res.render("user", data);
	});
});

// app.get("/orders", (req, res) => {
// 	let orders = [];
// 	pool.query("SELECT * FROM orders;").then((query_res) => {
// 		for (let i = 0; i < query_res.rowCount; i++) {
// 			orders.push(query_res.rows[i]);
// 		}
// 		// const data = { orders: orders };
// 		// console.log(orders);
// 		res.send(orders);
// 		// res.render("orders", data);
// 	});
// });

// app.use(cors(corsOptions));
const PORT = process.env.PORT || 8080;
// const DATABASE_URL = process.env.MONGO_URL;

// mongoose.connect(DATABASE_URL);
// const db = mongoose.connection;
// db.on("error", (err) => console.log(err));
// db.once("open", async () => console.log("Connected to database."));
// while (mongoose.connection.readyState != 1) {
// 	await sleep(1000);
// }

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/orders", orderRouter);
app.use("/menu", menuRouter);
// app.use("/duels", duelsRouter);
// app.use("/cfproblems", cfproblemsRouter);
// app.use("/lcproblems", lcproblemsRouter);
// app.use("/submissions", submissionsRouter);
// app.use("/messages", messagesRouter);
// app.use("/general", genInfoRouter);
// const server = app.listen(PORT, () =>
// 	console.log(`Server is started on port ${PORT}.`)
// );
// const io = new Server(
// 	server,
// 	cors({
// 		origin: allowedOrigins,
// 	})
// );

app.listen(PORT, () => {
	console.log(`Example app listening at http://localhost:${PORT}`);
});

export default pool;

// const socketManager = new SocketManager(io);
// await socketManager.init();

// const api = new LeetcodeAPI();
// await api.init();

// await leetcodeLogin();
// await leetcodeSubmit();

// await api.updateProblemsInDatabase();
// console.log(await api.getProblem("reverse-odd-levels-of-binary-tree"));
// let problems = await api.getProblemList();
// console.log(problems);

// await api.updateProblemsInDatabase();
// console.log(await leetcode.user("username"));
// const api = new CodeforcesAPI();
// await api.updateProblemsInDatabase();

// const api = new CodeforcesAPI();
// await api.updateProblemsInDatabase();
// setInterval(async () => {
// 	await api.updateSubmissions();
// }, 10000);
// let i = 0;
// while (true) {
// 	console.log(`attempt ${i}`);
// 	await api.puppeteerSubmitProblem(
// 		1729,
// 		"f",
// 		"Bullshit name",
// 		3,
// 		`Random code: ${Date.now()}`,
// 		73,
// 		"123",
// 		"321"
// 	);
// 	i++;
// }
