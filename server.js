import express from "express";
import cors from "cors";
import orderRouter from "./routes/orderRouter.js";
import menuRouter from "./routes/menuRouter.js";
import inventoryRouter from "./routes/inventoryRouter.js";
import restaurantRouter from "./routes/restaurantRouter.js";
import authRouter from "./routes/authRouter.js";
import postgres from "pg";
import dotenv from "dotenv";
import Data from "./api/Data.js";
import corsOptions from "./config/origins.js";
import helmet from "helmet";
const Database = new Data();

dotenv.config();

const { Pool } = postgres;
const app = express();
app.use(helmet());
// using cors here
// app.use(cors(corsOptions));
// Error handling middleware
app.use((err, req, res, next) => {
	if (err.message === "Not allowed by CORS") {
		res.status(403).send({ error: "Not allowed by CORS" });
	} else {
		next(err);
	}
});

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

const PORT = process.env.PORT || 8080;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/orders", orderRouter);
app.use("/menu", menuRouter);
app.use("/inventory", inventoryRouter);
app.use("/restaurant", restaurantRouter);
app.use("/auth", authRouter);

app.listen(PORT, () => {
	console.log(`Server is started on port ${PORT}`);
});

export { pool, Database };
