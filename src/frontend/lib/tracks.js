function showTracks(tracks) {
    var element = document.getElementById("track");
    var container = document.getElementById("container-tracks");
    container.innerHTML = "";
    container.append(element);

    for (var i = tracks.length - 1; i >= 0; i--) {
        var clone = element.cloneNode(true);

        clone.id = 'element-track-' + i;

        clone.getElementsByClassName("track-image")[0].src = tracks[i].album.images[0].url;
        clone.getElementsByClassName("track-title")[0].innerText = tracks[i].name;
        var album = tracks[i].album.name;
        if (album.length > 35) 
            album = album.substring(0, 35) + "...";
        clone.getElementsByClassName("track-album")[0].innerHTML = `<a href="tracks.html?album=${tracks[i].album.id}">${album}</a>`;
        for (var j = 0; j < tracks[i].artists.length; j++) {
            clone.getElementsByClassName("track-artists")[0].innerHTML +=
            `
            <div class="m-1"><a href="tracks.html?artist=${tracks[i].artists[j].id}">${tracks[i].artists[j].name}</a></div>
            `
        }
        var user = JSON.parse(localStorage.getItem("user"));
        var playlists = user.playlists;
        var dropdown = clone.getElementsByClassName("dropdown-menu")[0];
        dropdown.innerHTML += `<li><a href="playlist-creation.html?id=${tracks[i].id}&name=${tracks[i].name}" class="dropdown-item new-playlist">New playlist</a></li>`
        for (var j = 0; j < playlists.length; j++) {
            if (playlists[j].isOwner == true) {
                dropdown.innerHTML += `<li><a class="dropdown-item" onclick="addTrackToPlaylist('${playlists[j].id}', '${tracks[i].id}', '${tracks[i].name.replace("'", "’")}', '${i}')">${playlists[j].name}</a></li>`
            }
        }
        
        clone.classList.remove('d-none');

        element.after(clone);
    }
}

function searchTracks(trackName, artistName, albumName, genreName) {
    var query = "q=";
    var hasQuery = false;
    if (trackName != "") {
        query += "track:" + trackName + "%20";
        hasQuery = true;
    }
    if (artistName != "") {
        query += "artist:" + artistName + "%20";
        hasQuery = true;
    }
    if (albumName != "") {
        query += "album:" + albumName + "%20";
        hasQuery = true;
    }
    if (genreName != "") {
        query += "genre:" + genreName + "%20";
        hasQuery = true;
    }
    if (!hasQuery) {
        var year = new Date().getFullYear();
        query += `year:${year}`;
    }

    fetch(`http://localhost:3100/search/tracks?${query}`, {
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
        response.json()
        .then(result => showTracks(result.tracks.items));
    })
    .catch(error => alert(error))
}

function getArtistTracks(artistId) {
    fetch(`http://localhost:3100/artist/${artistId}/tracks`, {
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
        response.json()
        .then(result => showTracks(result.tracks));
    })
    .catch(error => alert(error))
}

function getAlbumTracks(albumId) {
    fetch(`http://localhost:3100/album/${albumId}/tracks`, {
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
        response.json()
        .then(result => {console.log(result); showTracks(result.tracks)});
    })
    .catch(error => alert(error))
}

function addTrackToPlaylist(playlistId, trackId, trackName, elementIndex) {
    var track = {
        id: trackId,
        name: trackName
    }

    var element = document.getElementById("element-track-" + elementIndex);

    fetch(`http://localhost:3100/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            Authorization: localStorage.getItem("token")
        },
        body: JSON.stringify(track)
    })
    .then(response => {
        if (response.ok) {
            element.getElementsByClassName("track-alert")[0].innerHTML =
            `
            <div class="alert alert-success alert-dismissible fade show tag-name" role="alert">
                Track added!
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
            `
        } else {
            console.log(response);
            if (response.status == 409) {
                element.getElementsByClassName("track-alert")[0].innerHTML =
                `
                <div class="alert alert-warning alert-dismissible fade show tag-name" role="alert">
                    Track already present
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
                `
            }
            if (response.status == 401) {
                timeoutLogout();
            }
            return;
        }
    })
    .catch(error => alert(error));
}

function getSeveralTracks(ids, playlist) {
    fetch(`http://localhost:3100/tracks?ids=${ids}`, {
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
        response.json()
        .then(results => {
            showPlaylistTracks(results.tracks, playlist)
        });
    })
    .catch(error => alert(error));
}

function showPlaylistTracks(tracks, playlist) {
    var element = document.getElementById("track");
    var container = document.getElementById("container-tracks");
    container.innerHTML = "";
    container.append(element);

    var duration = 0;

    for (var i = tracks.length - 1; i >= 0; i--) {
        var clone = element.cloneNode(true);

        clone.id = 'element-track-' + i;

        clone.getElementsByClassName("track-image")[0].src = tracks[i].album.images[0].url;
        clone.getElementsByClassName("track-title")[0].innerText = tracks[i].name;
        clone.getElementsByClassName("track-album")[0].innerHTML = `<a href="tracks.html?album=${tracks[i].album.id}">${ tracks[i].album.name}</a>`;
        for (var j = 0; j < tracks[i].artists.length; j++) {
            clone.getElementsByClassName("track-artists")[0].innerHTML +=
            `
            <div class="m-1"><a href="tracks.html?artist=${tracks[i].artists[j].id}">${tracks[i].artists[j].name}</a></div>
            `
        }
        clone.getElementsByClassName("track-duration")[0].innerText = msToShortTime(tracks[i].duration_ms);
        clone.getElementsByClassName("track-release")[0].innerText = tracks[i].album.release_date;

        var user = JSON.parse(localStorage.getItem("user"));
        if (playlist.owner == user._id) {
            clone.getElementsByClassName("track-info")[0].innerHTML +=
            `<button class="btn btn-delete mt-3" onclick="removeTrackFromPlaylist('${playlist._id}', '${tracks[i].id}', '${i}')">Remove</button>`;
        }
        
        clone.classList.remove('d-none');

        element.after(clone);

        duration += tracks[i].duration_ms;
    }

    document.getElementById("playlist-duration").innerText = msToTime(duration);
}