import { spotify } from "../../config/config.js";

var scheduled = false;

export async function generateSpotifyToken() {
    try {
        var response = await fetch(spotify.token_url, {
            method: "POST",
            headers: {
                "Authorization": "Basic " + btoa(`${spotify.client_id}:${spotify.client_secret}`),
                "Content-Type": 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials'
        });
        var data = await response.json();
        process.env.SPOTIFY_TOKEN = data.access_token;

        if (!scheduled) {
            scheduleRenewSpotifyToken();
            scheduled = true;
        }

        return data.access_token;
    } catch (error) {
        console.log(`Error: ${error}`);
        scheduled = false;
    };
}

async function scheduleRenewSpotifyToken() {
    var anHourInMilliseconds = 3600000;
    setInterval(generateSpotifyToken, anHourInMilliseconds);
}