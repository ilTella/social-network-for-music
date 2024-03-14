import 'dotenv/config'

export const secret = process.env.SECRET;

export const spotify = {
    base_url: process.env.BASE_URL,
    token_url: process.env.TOKEN_URL,
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET
};

export const mongodb = {
    dbName: process.env.DB_NAME,
    uri: process.env.DB_URI
};