import { spotify } from '../../config/config.js';
import { generateSpotifyToken } from './token.js';

export async function spotifyGet(url) {
    var token = process.env.SPOTIFY_TOKEN;
    if (token == null) {
        token = await generateSpotifyToken();
    }
 
    try {
        var response = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
 
        if (!response.ok) {
            console.log(response);
        }
 
       var data = await response.json();
       return data;
    } catch (e) {
       console.log('Error: ', e);
    }
}

export async function searchTracks(res, query) {
    var url = `${spotify.base_url}/search?type=track&limit=50&q=${query}`;
    var result = await spotifyGet(url);
    res.json(result);
}

export async function getGenres(res) {
    var url = `${spotify.base_url}/recommendations/available-genre-seeds`;
    var result = await spotifyGet(url);
    res.json(result);
}

export async function searchArtists(res, query) {
    var url = `${spotify.base_url}/search?type=artist&limit=10&q=${query}`;
    var result = await spotifyGet(url);
    res.json(result);
}

export async function getTracks(res, ids) {
    var url = `${spotify.base_url}/tracks?ids=${ids}`;
    var result = await spotifyGet(url);
    res.json(result);
}

export async function getArtistTracks(res, artistId) {
    var url = `${spotify.base_url}/artists/${artistId}/top-tracks?market=US`;
    var result = await spotifyGet(url);
    res.json(result);
}

export async function getAlbumTracks(res, albumId) {
    var url = `${spotify.base_url}/albums/${albumId}/tracks?market=US`;
    var tracks = await spotifyGet(url);

    var ids = "";
    for (var i = 0; i < tracks.items.length; i++) {
        ids += tracks.items[i].id;
        if (i != tracks.items.length - 1) {
            ids += ",";
        }
    }

    url = `${spotify.base_url}/tracks?ids=${ids}`;
    var result = await spotifyGet(url);

    res.json(result);
}

export async function getRecommendations(res, artists, genres) {
    var url = `${spotify.base_url}/recommendations?market=US`;
    if (artists != "") {
        url += `&seed_artists=${artists}`;
    }
    if (genres != "") {
        url += `&seed_genres=${genres}`;
    }

    var result = await spotifyGet(url);
    res.json(result);
}