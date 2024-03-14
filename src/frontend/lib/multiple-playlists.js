function addPlaylist(playlistId, playlistName, cardIndex) {
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
            var element = document.getElementById(`card-playlist-${cardIndex}`).getElementsByClassName("btn")[1];
            element.innerText = "Remove ❌";
            element.setAttribute("onclick", `removePlaylist('${playlistId}', '${playlistName.replace("'", "’")}', '${cardIndex}')`);
        } else {
            console.log(response);
            timeoutLogout();
        }
    });
}

function removePlaylist(playlistId, playlistName, cardIndex) {
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
            var element = document.getElementById(`card-playlist-${cardIndex}`).getElementsByClassName("btn")[1];
            element.innerText = "Add 💚";
            element.setAttribute("onclick", `addPlaylist('${playlistId}', '${playlistName.replace("'", "’")}', '${cardIndex}')`);
        } else {
            console.log(response);
            timeoutLogout();
        }
    });
}