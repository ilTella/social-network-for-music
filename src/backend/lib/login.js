import { hash, isValidEmail, isValidPassword } from "./utils.js";
import { getCollection } from "./database.js";
import jwt from "jsonwebtoken";

const collectionUsers = () => getCollection("users");

export async function login(res, email, password) {
    if (!isValidEmail(email)) {
        res.status(400).send("Invalid or missing email");
        return;
    }
    if (!isValidPassword(password)) {
        res.status(400).send("Invalid or missing password");
        return;
    }

    password = hash(password);

    try {
        var collection = await collectionUsers();

        var filter = {
            $and: [
                { "email": email},
                { "password": password}
            ]
        }
        var loggedUser = await collection
        .findOne(filter);

        if (loggedUser == null) {
            res.status(401).send("Unauthorized");
        } else {
            var token = jwt.sign(
                { username: loggedUser.username, id: loggedUser._id },
                process.env.SECRET,
                { expiresIn: "1h" }
            );

            loggedUser.password = undefined;
            var user = loggedUser;

            res.status(200).json({
                token,
                expires: new Date(Date.now() + 3600000),
                user
            });
        }
    } catch (e) {
        res.status(500).send(`Internal error: ${e}`);
    }
}