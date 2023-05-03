const allowedOrigins = "https://csce-315-project3-31-final.vercel.app/";

/**
 * Configures cors options
 */
const corsOptions = {
	origin: function (origin, callback) {
		if (allowedOrigins.indexOf(origin) !== -1) {
			callback(null, true);
		} else {
			// Only send the error message, not the entire error object
			callback(new Error("Not allowed by CORS"), false);
		}
	},
	optionsSuccessStatus: 200,
};

export default corsOptions;
