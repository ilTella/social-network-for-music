import jwt from "jsonwebtoken"
import { secret } from "../config/config.js";

export function auth(req, res, next) {

    if (!req.headers.authorization) {
        return res.status(401).send("Missing token");
    }

    try {
        var token = req.headers.authorization;
        jwt.verify(token, secret);
    } catch (e) {
        return res.status(401).send("Invalid token");
    }

    next();
}