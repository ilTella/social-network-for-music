// DEPENDENCIES & SETUP

import cors from "cors";
import express from "express";

import { getUsers, getUser, addUser, updateUser, deleteUser, addPlaylistToUser, removePlaylistFromUser } from "./lib/users.js";
import { getPlaylists, getPlaylist, addPlaylist, updatePlaylist, deletePlaylist, addTrackToPlaylist, removeTrackFromPlaylist } from "./lib/playlists.js";
import { searchPlaylists } from "./lib/search.js";
import { login } from "./lib/login.js";
import { searchTracks, getGenres, searchArtists, getTracks, getArtistTracks, getAlbumTracks, getRecommendations } from "./lib/spotify/fetch.js";
import { auth } from "./lib/auth.js";

const app = express();
app.use(express.json());
app.use(cors());

// API

// USERS

app.get("/users", auth, async function (req, res) {
    getUsers(res);
});

app.get("/users/:id", auth, async function (req, res) {
    getUser(res, req.params.id);
});

app.post("/users", async function (req, res) {
    addUser(res, req.body);
});

app.post("/users/:id/playlists", auth, async function (req, res) {
    var playlistId = req.body.id;
    var playlistName = req.body.name;
    addPlaylistToUser(res, req.params.id, playlistId, playlistName);
});

app.put("/users/:id", auth, async function (req, res) {
    updateUser(res, req.body, req.params.id);
});

app.delete("/users/:id", auth, async function (req, res) {
    deleteUser(res, req.params.id);
});

app.delete("/users/:uid/playlists/:plid", auth, async function (req, res) {
    removePlaylistFromUser(res, req.params.uid, req.params.plid);
});

// PLAYLISTS

app.get("/playlists", async function (req, res) {
    getPlaylists(res, req.query);
});

app.get("/playlists/:id", auth, async function (req, res) {
    getPlaylist(res, req.params.id)
});

app.post("/playlists", auth, async function (req, res) {
    addPlaylist(res, req.body);
});

app.post("/playlists/:id/tracks", auth, async function (req, res) {
    var trackId = req.body.id;
    var trackName = req.body.name;
    addTrackToPlaylist(res, req.params.id, trackId, trackName);
});

app.put("/playlists/:id", auth, async function (req, res) {
    updatePlaylist(res, req.body, req.params.id);
});

app.delete("/playlists/:id", auth, async function (req, res) {
    deletePlaylist(res, req.params.id);
});

app.delete("/playlists/:plid/tracks/:trid", auth, async function (req, res) {
    removeTrackFromPlaylist(res, req.params.plid, req.params.trid);
});

// SPOTIFY

app.get("/search/tracks", auth, async function (req, res) {
    searchTracks(res, req.query.q);
});

app.get("/genres", async function (req, res) {
    getGenres(res);
});

app.get("/search/artists", async function (req, res) {
    searchArtists(res, req.query.q);
});

app.get("/tracks", auth, async function (req, res) {
    getTracks(res, req.query.ids)
});

app.get("/artist/:id/tracks", auth, async function (req, res) {
    getArtistTracks(res, req.params.id)
});

app.get("/album/:id/tracks", auth, async function (req, res) {
    getAlbumTracks(res, req.params.id)
});

app.get("/recommendations", auth, async function (req, res) {
    getRecommendations(res, req.query.artists, req.query.genres)
});

// OTHER

app.post("/login", async function (req, res) {
    login(res, req.body.email, req.body.password)
});

app.get("/search/playlists", auth, async function (req, res) {
    searchPlaylists(res, req.query);
});

app.listen(3100, () => {
    console.log("Server started on port 3100")
});