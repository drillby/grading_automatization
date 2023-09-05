import express from 'express';
import { authorizationToken } from '../exports';

export function requireAuthMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
    const token = req.headers.authorization

    if (!token) {
        res.status(401).send({
            status: "error",
            message: "Unauthorized"
        });
        return;
    }

    if (token !== authorizationToken) {
        res.status(401).send({
            status: "error",
            message: "Unauthorized"
        });
        return;
    }

    next();
}