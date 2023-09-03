import rateLimiter from 'express-rate-limit';

const allowList = [
    "127.0.0.1",
    "192.168.132.103",
]
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
