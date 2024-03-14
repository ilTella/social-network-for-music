function getUserPlaylists(ids) {
    fetch(`http://localhost:3100/playlists?ids=${ids}&include_private=true`, {
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