function removeTrackFromPlaylist(playlistId, trackId, elementIndex) {
    fetch(`http://localhost:3100/playlists/${playlistId}/tracks/${trackId}`, {
        method: 'DELETE',
        headers: {
            Authorization: localStorage.getItem("token")
        }
    })
    .then(response => {
        if (!response.ok) {
            console.log(response);
            if (response.status == 401) {
                timeoutLogout();
            }
            return;
        }
        var element = document.getElementById(`element-track-${elementIndex}`)
        var durationTrack = element.getElementsByClassName("track-duration")[0].innerText;
        element.remove();
        var numTracks = parseInt(document.getElementById("playlist-num-tracks").innerText);
        document.getElementById("playlist-num-tracks").innerText = (numTracks - 1) + " tracks";
        var durationTot = document.getElementById("playlist-duration").innerText;
        document.getElementById("playlist-duration").innerText = msToTime(timeToMs(durationTot) - timeToMs(durationTrack));
    })
    .catch(error => alert(error));
}

function showPlaylistContent(content) {
    icon = " 🔒";
    if (content.isPublic) {
        icon = " 🌍";
    }
    document.getElementById("playlist-name").innerText = content.name + icon;
    document.getElementById("playlist-description").innerText = content.description;
    document.getElementById("playlist-followers").innerText = content.followers + " followers";
    document.getElementById("playlist-num-tracks").innerText = content.tracks.length + " tracks";
    for (var i = 0; i < content.tags.length; i++) {
        document.getElementById('playlist-tags').innerHTML += `<a class="badge bg-secondary rounded-pill p-2 m-1" href="public-playlists.html?tag=${content.tags[i]}">${content.tags[i]}</a>`;
    }

    var user = JSON.parse(localStorage.getItem("user"));

    if (content.owner == user._id) {
        document.getElementById("playlist-button").innerHTML =
        `<a class="btn" href="playlist-edit.html?playlistId=${content._id}">Edit</a>`
    } else {
        var inPlaylists = false;
        for (var i = 0; i < user.playlists.length; i++) {
            if (content._id == user.playlists[i].id) {
                inPlaylists = true;
                break;
            }
        }

        if (inPlaylists) {
            document.getElementById("playlist-button").innerHTML =
            `<a class="btn" onclick="removePlaylist('${content._id}', '${content.name}')">Remove ❌</a>`
        } else {
            document.getElementById("playlist-button").innerHTML =
            `<a class="btn" onclick="addPlaylist('${content._id}', '${content.name}')">Add 💚</a>`
        }
    }

    var ids = ""
    for (var i = 0; i < content.tracks.length; i++) {
        if (i == 0) {
            ids += content.tracks[i].id;
        } else {
            ids += "," + content.tracks[i].id;
        }
    }
    if (ids != "") {
        getSeveralTracks(ids, content);
    } else {
        var element = document.getElementById("playlist-placeholder");
        var link = '';
        if (content.owner == user._id) {
            link = '<a href="tracks.html" class="add-tracks-link">add some!</a>'
        }
        element.innerHTML +=
        `
        <p>This playlist doesn't have any track yet... ${link}</p>
        `
    }
}

function addPlaylist(playlistId, playlistName) {
    var user = JSON.parse(localStorage.getItem("user"));

    var playlist = {
        id: playlistId,
        name: playlistName
    }

    fetch(`http://localhost:3100/users/${user._id}/playlists`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            Authorization: localStorage.getItem("token")
        },
        body: JSON.stringify(playlist)
    })
    .then(response => {
        if (response.ok) {
            playlist = {
                id: playlistId,
                name: playlistName,
                isOwner: false
            }
            user.playlists.push(playlist);
            localStorage.setItem("user", JSON.stringify(user));
            var element = document.getElementById("playlist-button").getElementsByClassName("btn")[0];
            element.innerText = "Remove ❌";
            element.setAttribute("onclick", `removePlaylist('${playlistId}', '${playlistName.replace("'", "’")}')`);
        } else {
            console.log(response.message);
            if (response.status == 401) {
                timeoutLogout();
                return;
            }
        }
    });
}

function removePlaylist(playlistId, playlistName) {
    var user = JSON.parse(localStorage.getItem("user"));

    fetch(`http://localhost:3100/users/${user._id}/playlists/${playlistId}`, {
        method: 'DELETE',
        headers: {
            Authorization: localStorage.getItem("token")
        }
    })
    .then(response => {
        if (response.ok) {
            var index;
            for (index = 0; index < user.playlists.length; index++) {
                if (user.playlists[index].id == playlistId)
                    break;
            }
            user.playlists.splice(index, 1);
            localStorage.setItem("user", JSON.stringify(user));
            var element = document.getElementById("playlist-button").getElementsByClassName("btn")[0];
            element.innerText = "Add 💚";
            element.setAttribute("onclick", `addPlaylist('${playlistId}', '${playlistName.replace("'", "’")}')`);
        } else {
            console.log(response.message);
            if (response.status == 401) {
                timeoutLogout();
                return;
            }
        }
    });
}