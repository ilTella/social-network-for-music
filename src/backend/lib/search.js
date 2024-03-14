import { getCollection } from "./database.js";

const collectionPlaylists = () => getCollection("playlists");

export async function searchPlaylists(res, query) {
    var limit;
    if (query.limit == undefined) {
        limit = 50
    } else {
        if (isNaN(query.limit)) {
            res.status(400).send("Invalid limit");
            return;
        }
        limit = parseInt(query.limit, 10);
    }

    var tagsList;
    if (query.tags == undefined) {
        var tagsList = [];
    } else {
        var tagsList = query.tags.split(",");
    }

    var tracksList;
    if (query.tracks == undefined) {
        var tracksList = [];
    } else {
        var tracksList = query.tracks.split(",");
    }

    var playlistName;
    if (query.name == undefined) {
        playlistName = "";
    } else {
        playlistName = query.name;
    }

    try {
        var playlists = await collectionPlaylists();

        var searchTerms = []
        if (tagsList.length > 0) {
            searchTerms.push({tags: {$all: tagsList}})
        }
        if (tracksList.length > 0) {
            for (var i = 0; i < tracksList.length; i++) {
                tracksList[i] = tracksList[i].toLowerCase();
                searchTerms.push({"tracks.name": {$regex: tracksList[i]}})
            }
        }
        if (playlistName.length > 0) {
            searchTerms.push({name: {$regex: playlistName}})
        }

        var conditions = [{isPublic: true}];
        if (searchTerms.length > 0) {
            conditions.push({$and: searchTerms})
        }

        var filter = {
            $and: conditions
        }

        var searchResults = await playlists
        .find(filter)
        .limit(limit)
        .sort({followers: -1})
        .toArray();

        res.json(searchResults);

    } catch (e) {
        res.status(500).send(`Error: ${e}`);
    }
}