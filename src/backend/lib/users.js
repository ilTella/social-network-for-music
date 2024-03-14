import { ObjectId } from "mongodb";
import { getCollection } from "./database.js";
import { hash, isValidString, isValidPassword, isValidEmail, isValidList } from "./utils.js";

const collectionUsers = () => getCollection("users");
const collectionPlaylists = () => getCollection("playlists");

export async function getUsers(res) {
    try {
        var collection = await collectionUsers();

        var items = await collection
        .find()
        .project({"password": 0})
        .toArray();

        res.json(items)
    } catch (e) {
        res.status(500).send(`Internal error: ${e}`);
    }
}

export async function getUser(res, id) {
    if (!isValidString(id)) {
        res.status(400).send("Invalid or missing id");
        return;
    }

    try {
        var collection = await collectionUsers();

        var user = await collection
        .findOne({ "_id": new ObjectId(id) })
 
        if (user == null) {
            res.status(404).send("User not found");
        } else {
            user.password = undefined;
            res.json(user);
        }
    } catch (e) {
        res.status(500).send(`Internal error: ${e}`);
    }
}

export async function addUser(res, user) {
    if (!isValidString(user.username)) {
        res.status(400).send("Invalid or missing username");
        return;
    }
    if (!isValidEmail(user.email)) {
        res.status(400).send("Invalid or missing email");
        return;
    }
    if (!isValidPassword(user.password)) {
        res.status(400).send("Invalid or missing password");
        return;
    }
    if (!isValidList(user.favoriteGenres)) {
        res.status(400).send("Missing favorite genres");
        return;
    }
    if (!isValidList(user.favoriteArtists)) {
        res.status(400).send("Missing favorite artists");
        return;
    }

    user.password = hash(user.password);

    try {
        var newUser = {
            username: user.username,
            email: user.email,
            password: user.password,
            favoriteGenres: user.favoriteGenres,
            favoriteArtists: user.favoriteArtists,
            playlists: []
        };

        var collection = await collectionUsers();
        await collection
        .insertOne(newUser);

        res.status(201).send();
    }
    catch (e) {
        if (e.code == 11000) {
            res.status(403).send("Username and/or email already taken");
            return;
        }
        res.status(500).send(`Internal error: ${e}`);
    };
}

export async function updateUser(res, updatedUser, id) {
    if (!isValidString(updatedUser.username)) {
        res.status(400).send("Invalid or missing username");
        return;
    }
    if (!isValidEmail(updatedUser.email)) {
        res.status(400).send("Invalid or missing email");
        return;
    }
    if (!isValidPassword(updatedUser.password)) {
        res.status(400).send("Invalid or missing password");
        return;
    }
    if (!isValidList(updatedUser.favoriteGenres)) {
        res.status(400).send("Missing favorite genres");
        return;
    }
    if (!isValidList(updatedUser.favoriteArtists)) {
        res.status(400).send("Missing favorite artists");
        return;
    }

    updatedUser.password = hash(updatedUser.password);

    try {
        var collection = await collectionUsers();

        var filter = { "_id": new ObjectId(id) };
        var updatedUserToInsert = {
            $set: {
                username: updatedUser.username,
                email: updatedUser.email,
                password: updatedUser.password,
                favoriteGenres: updatedUser.favoriteGenres,
                favoriteArtists: updatedUser.favoriteArtists
            }
        };

        var result = await collection
        .updateOne(filter, updatedUserToInsert);

        if (result.matchedCount == 0) {
            res.status(404).send("User not found");
        } else {
            res.status(200).send();
        }
    } catch (e) {
        if (e.code == 11000) {
            res.status(403).send("Username and/or email already taken, user was not updated");
            return;
        }
        res.status(500).send(`Internal error: ${e}`);
    }
}

export async function deleteUser(res, id) {
    if (!isValidString(id)) {
        res.status(400).send("Invalid or missing id");
        return;
    }

    try {
        var users = await collectionUsers();

        var userToDeleteId = new ObjectId(id);
        var filter = { "_id": userToDeleteId };
        var result = await users
        .deleteOne(filter);

        if (result.deletedCount == 0) {
            res.status(404).send("User not found");
        } else {
            var playlists = await collectionPlaylists();

            var playlistsFilter = {owner: userToDeleteId};
            var playlistsToDelete = await playlists
            .find(playlistsFilter)
            .toArray();

            var ids = [];
            for (var i = 0; i < playlistsToDelete.length; i++) {
                ids.push(playlistsToDelete[i]._id);
            }

            playlistsFilter = {
                _id: { $in: ids }
            };
            await playlists
            .deleteMany(playlistsFilter);

            var usersFilter = {};
            var usersUpdate = {
                $pull: {
                    playlists: {
                        id: { $in: ids }
                    }
                }
            };
            await users
            .updateMany(usersFilter, usersUpdate);

            res.status(200).send();
        }
    } catch(e) {
        res.status(500).send(`Error: ${e}`);
    }
}

export async function addPlaylistToUser(res, userId, playlistId, playlistName) {
    if (!isValidString(userId)) {
        res.status(400).send("Missing user ID");
        return;
    }
    if (!isValidString(playlistId)) {
        res.status(400).send("Missing playlist ID");
        return;
    }
    if (!isValidString(playlistName)) {
        res.status(400).send("Missing playlist name");
        return;
    }

    try {
        var users = await collectionUsers();
        var playlists = await collectionPlaylists();

        var userId = new ObjectId(userId);
        var playlistId = new ObjectId(playlistId);

        var playlistToAdd = await playlists
        .findOne({ "_id": playlistId });
        if (playlistToAdd == null) {
            res.status(404).send("Playlist not found");
            return;
        }

        var usersFilter = { "_id": userId };
        var usersUpdate = {
            $addToSet: {
                playlists: {
                    id: playlistId,
                    name: playlistName,
                    isOwner: false
                } 
            }
        };

        var result = await users
        .updateOne(usersFilter, usersUpdate);

        if (result.matchedCount == 0) {
            res.status(404).send("User not found");
        } else if (result.modifiedCount == 0) {
            res.status(409).send("Playlist already present, user not modified");
        } else {
            var playlistsFilter = {"_id": playlistId};
            var playlistsUpdate = {
                $inc: {
                    followers: 1
                }
            };
            await playlists
            .updateOne(playlistsFilter, playlistsUpdate);

            res.status(201).send();
        }
    } catch (e) {
        res.status(500).send(`Error: ${e}`);
    }
}

export async function removePlaylistFromUser(res, userId, playlistId) {
    if(!isValidString(userId)) {
        res.status(400).send("Missing user ID");
        return;
    }
    if (!isValidString(playlistId)) {
        res.status(400).send("Missing playlist ID");
        return;
    }

    try {
        var users = await collectionUsers();
        var playlists = await collectionPlaylists();

        var userId = new ObjectId(userId);
        var playlistId = new ObjectId(playlistId);

        var playlistToRemove = await playlists
        .findOne({ "_id": playlistId });
        if (playlistToRemove == null) {
            res.status(404).send("Playlist not found");
            return;
        }

        var usersFilter = { "_id": userId };
        var usersUpdate = {
            $pull: {
                playlists: {
                    id: playlistId
                }
            }
        };

        var result = await users
        .updateOne(usersFilter, usersUpdate);

        if (result.matchedCount == 0) {
            res.status(404).send("User not found");
        } else if (result.modifiedCount == 0) {
            res.status(404).send("Playlist not present, user not modified");
        } else {
            var playlistsFilter = {"_id": playlistId};
            var playlistsUpdate = {
                $inc: {
                    followers: -1
                }
            }
            await playlists
            .updateOne(playlistsFilter, playlistsUpdate);

            res.status(200).send();
        }
    } catch (e) {
        res.status(500).send(`Error: ${e}`);
    }
}