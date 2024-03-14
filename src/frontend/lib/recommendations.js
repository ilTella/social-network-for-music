function getRecommendations() {
    var user = JSON.parse(localStorage.getItem("user"));

    var artistList = "";
    var genreList = "";

    for (var i = 0; i < 5; i++) {
        var r = Math.random();
        if (r < 0.5) {
            var index = Math.floor(Math.random() * (user.favoriteArtists.length));
            var element = user.favoriteArtists[index].id;
            if (!artistList.includes(element)) {
                artistList += element + ",";
            }
        } else {
            var index = Math.floor(Math.random() * (user.favoriteGenres.length));
            var element = user.favoriteGenres[index];
            if (!genreList.includes(element)) {
                genreList += element + ",";
            }
        }
    }

    artistList = artistList.substring(0, artistList.length - 1);
    genreList = genreList.substring(0, genreList.length - 1);

    fetch(`http://localhost:3100/recommendations?artists=${artistList}&genres=${genreList}`, {
        headers: {
            Authorization: localStorage.getItem("token")
        }
    })
    .then(response => {
        if (!response.ok) {
            console.log(response);
            timeoutLogout();
            return;
        }
        response.json()
        .then(result => showTracks(result.tracks));
    })
    .catch(error => console.log(error));
}