import rateLimiter from 'express-rate-limit';
import { allowList } from '../exports';


export const rateLimiterMiddleware = rateLimiter({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // limit each IP to 60 requests per windowMs
    headers: true,
    message: {
        status: "error",
        message: "Too many requests"
    },
    statusCode: 429,
    skip: (req, res) => allowList.includes(req.ip),
});
