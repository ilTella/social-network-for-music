function initializePlaylistsSearch() {
    var tagList = "";
        var tagElements = document.getElementsByClassName("tag-name");
        if (tagElements.length > 0) {
            tagList += tagElements[0].innerText;
        }
        if (tagElements.length > 1) {
            for (var i = 1; i < tagElements.length; i++) {
                tagList += "," + tagElements[1].innerText;
            }
        }

        var trackList = "";
        var trackElements = document.getElementsByClassName("track-name");
        if (trackElements.length > 0) {
            trackList += trackElements[0].innerText;
        }
        if (trackElements.length > 1) {
            for (var i = 1; i < trackElements.length; i++) {
                trackList += "," + trackElements[1].innerText;
            }
        }

        var name = document.getElementById("input-name").value;

        searchPlaylists(tagList, trackList, name);
}

function searchPlaylists(tags, tracks, name) {
    var query = "limit=20"
    if (tags != "") {
        query += "&tags=" + tags;
    }
    if (tracks != "") {
        query += "&tracks=" + tracks;
    }
    if (name != "") {
        query += "&name=" + name;
    }

    fetch(`http://localhost:3100/search/playlists?${query}`, {
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
        response.json().then(playlists => showPlaylists(playlists));
    })
    .catch(error => alert(error));
}

function getPublicPlaylists() {
    fetch(`http://localhost:3100/playlists?limit=20`)
        .then(response => {
            if (!response.ok) {
                console.log(response);
                return;
            }
            response.json().then(playlists => showPlaylists(playlists));
        })
        .catch(error => alert(error));
}

function addTrack() {
    var track = document.getElementById("input-track").value;
    if (track == "")
        return;

    var tagElement = document.getElementById(`track-${track}`);

    if (tagElement != null) 
        return;
    
    document.getElementById("input-track").value = "";

    if (!isTrackValid(track)) {
        document.getElementById("track-alert").innerHTML +=
        `
        <div class="alert alert-warning alert-dismissible fade show track-name" role="alert">
            Track names cannot be empty or contain certain symbols
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
        `
        return;
    }

    document.getElementById("track-zone").innerHTML +=
    `
    <div id="track-${track}" class="alert alert-success alert-dismissible fade show track-name" role="alert">
        ${track}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
    `
}

function isTrackValid(track) {
    if (track.trim().length == 0 || track.includes("?") || track.includes("*"))
        return false;
    return true;
}