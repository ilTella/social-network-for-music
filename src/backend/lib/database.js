import { MongoClient } from "mongodb";
import { mongodb } from "../config/config.js";

const Db = await new MongoClient(mongodb.uri).connect();

export async function getCollection(collection) {
    try {
        return Db.db(mongodb.dbName).collection(collection);
    } catch (e) {
        console.log(`Connection error with MongoDB: ${e}`);
    }
}