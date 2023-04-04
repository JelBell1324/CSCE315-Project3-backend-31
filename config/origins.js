const allowedOrigins = 'http://localhost:3000/';

const corsOptions = {
    origin: allowedOrigins,
    optionsSuccessStatus: 200,
};

export { corsOptions, allowedOrigins };