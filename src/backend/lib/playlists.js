import { ObjectId } from "mongodb";
import { getCollection } from "./database.js";
import { isValidList, isValidString } from "./utils.js";

const collectionPlaylists = () => getCollection("playlists");
const collectionUsers = () => getCollection("users");

export async function getPlaylists(res, query) {
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

    var idList;
    if (query.ids == undefined) {
        idList = [];
    } else {
        idList = query.ids.split(",");
    }

    var include_private;
    if (query.include_private == undefined) {
        include_private = false;
    } else {
        include_private = (query.include_private == "true");
    }

    try {
        var collection = await collectionPlaylists();

        var filter = {};
        if (idList.length > 0) {
            for (var i = 0; i < idList.length; i++) {
                idList[i] = new ObjectId(idList[i]);
            };
            filter = {
                _id: {$in: idList}
            };
        }
        if (!include_private) {
            filter.isPublic = true;
        }

        var items = await collection
        .find(filter)
        .limit(limit)
        .toArray();

        res.json(items);
    } catch (e) {
        res.status(500).send(`Internal error: ${e}`);
    }
}

export async function getPlaylist(res, id) {
    if (!isValidString(id)) {
        res.status(400).send("Invalid or missing id");
        return;
    }

    try {
        var collection = await collectionPlaylists();

        var playlist = await collection
        .findOne({ "_id": new ObjectId(id) });
 
        if (playlist == null) {
            res.status(404).send("Playlist not found");
        } else {
            res.json(playlist);
        }
    } catch (e) {
        res.status(500).send(`Internal error: ${e}`);
    }
}

export async function addPlaylist(res, playlist) {
    if (!isValidString(playlist.name)) {
        res.status(400).send("Missing or invalid name");
        return;
    }
    if (!isValidString(playlist.description)) {
        res.status(400).send("Missing or invalid description");
        return;
    }
    if (!isValidString(playlist.owner)) {
        res.status(400).send("Missing or invalid owner ID");
        return;
    }
    if (!isValidList(playlist.tags)) {
        res.status(400).send("Missing tags");
        return;
    }
    if (typeof playlist.isPublic != "boolean") {
        res.status(400).send("'isPublic' property must be either true or false");
        return;
    }

    var playlistToAdd = {
        name: playlist.name,
        description: playlist.description,
        owner: new ObjectId(playlist.owner),
        tags: playlist.tags,
        isPublic: playlist.isPublic,
        followers: 0,
        tracks: []
    }

    try {
        var users = await collectionUsers();

        var ownerUser = await users
        .findOne({ "_id": playlistToAdd.owner });
        if (ownerUser == null) {
            res.status(404).send("Playlist owner not found");
            return;
        }

        var playlists = await collectionPlaylists();

        var result = await playlists
        .insertOne(playlistToAdd);

        var insertedId = result.insertedId;
        var usersFilter = {
            _id: playlistToAdd.owner
        };
        var usersUpdate = {
            $addToSet: {
                playlists: {
                    id: insertedId,
                    name: playlistToAdd.name,
                    isOwner: true
                }
            }
        }
        await users
        .updateOne(usersFilter, usersUpdate);

        res.status(201).json({id: insertedId});
    }
    catch (e) {
        res.status(500).send(`Internal error: ${e}`);
    };
}

export async function updatePlaylist(res, playlist, plId) {
    if (!isValidString(playlist.name)) {
        res.status(400).send("Invalid or missing name");
        return;
    }
    if (!isValidString(playlist.description)) {
        res.status(400).send("Invalid or missing description");
        return;
    }
    if (!isValidList(playlist.tags)) {
        res.status(400).send("Missing tags");
        return;
    }
    if (typeof playlist.isPublic != "boolean") {
        res.status(400).send("'isPublic' property must be either true or false");
        return;
    }

    try {
        var playlists = await collectionPlaylists();

        var playlistId = new ObjectId(plId);
        var playlistsFilter = { "_id": playlistId };
        var playlistsUpdate = {
            $set: {
                name: playlist.name,
                description: playlist.description,
                tags: playlist.tags,
                isPublic: playlist.isPublic
            }
        };

        var result = await playlists
        .updateOne(playlistsFilter, playlistsUpdate);

        if (result.matchedCount == 0) {
            res.status(404).send("Playlist not found");
        } else {
            if (result.modifiedCount != 0) {
                var users = await collectionUsers();

                var usersFilter = {
                    "playlists.id": playlistId
                };
                var usersUpdate = {
                    $set: {
                        "playlists.$.name": playlist.name
                    }
                };
                await users
                .updateMany(usersFilter, usersUpdate);
            }

            res.status(200).send();
        }

    } catch (e) {
        res.status(500).send(`Internal error: ${e}`);
    }
}

export async function deletePlaylist(res, id) {
    if (!isValidString(id)) {
        res.status(400).send("Invalid or missing id");
        return;
    }

    try {
        var playlists = await collectionPlaylists();

        var playlistId = new ObjectId(id);
        var playlistsFilter = { "_id": playlistId };
        var result = await playlists
        .deleteOne(playlistsFilter);

        if (result.deletedCount == 0) {
            res.status(404).send("Playlist not found");
        } else {
            var users = await collectionUsers();

            var usersFilter = {
                "playlists.id": playlistId
            };
            var usersUpdate = {
                $pull: {
                    playlists: {
                        id: playlistId
                    }
                }
            };
            await users
            .updateMany(usersFilter, usersUpdate);

            res.status(200).send();
        }

    } catch(e) {
        res.status(500).send(`Internal error: ${e}`);
    }
}

export async function addTrackToPlaylist(res, playlistId, trackId, trackName) {
    if (!isValidString(playlistId)) {
        res.status(400).send("Missing playlist ID");
        return;
    }
    if (!isValidString(trackId)) {
        res.status(400).send("Missing track ID");
        return;
    }
    if (!isValidString(trackName)) {
        res.status(400).send("Missing track name");
        return;
    }

    try {
        var collection = await collectionPlaylists();

        var filter = { "_id": new ObjectId(playlistId) };
        var update = {
            $addToSet: {
                tracks: {
                    id: trackId,
                    name: trackName.toLowerCase()
                }
            }
        };

        var result = await collection
        .updateOne(filter, update);

        if (result.matchedCount == 0) {
            res.status(404).send("Playlist not found");
        } else if (result.modifiedCount == 0) {
            res.status(409).send("Track already present, playlist not modified");
        } else {
            res.status(201).send();
        }
    } catch (e) {
        res.status(500).send(`Internal error: ${e}`);
    }
}

export async function removeTrackFromPlaylist(res, playlistId, trackId) {
    if (!isValidString(playlistId)) {
        res.status(400).send("Missing playlist ID");
        return;
    }
    if (!isValidString(trackId)) {
        res.status(400).send("Missing track ID");
        return;
    }

    try {
        var collection = await collectionPlaylists();

        var filter = { "_id": new ObjectId(playlistId) };
        var update = {
            $pull: {
                tracks: {id: trackId}
            }
        };

        var result = await collection
        .updateOne(filter, update);

        if (result.matchedCount == 0) {
            res.status(404).send("Playlist not found");
        } else if (result.modifiedCount == 0) {
            res.status(404).send("Track not present, playlist not modified");
        } else {
            res.status(200).send();
        }
    } catch (e) {
        res.status(500).send(`Internal error: ${e}`);
    }
}