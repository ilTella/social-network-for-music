function showUser() {
    var user = JSON.parse(localStorage.getItem("user"));

    document.getElementById("welcome").innerHTML += ` ${user.username}`;
    document.getElementById("username").innerHTML += `<span class="badge bg-secondary rounded-pill p-2 m-1">${user.username}</button>`;
    document.getElementById("email").innerHTML += `<span class="badge bg-secondary rounded-pill p-2 m-1">${user.email}</button>`;
    var element = document.getElementById("artists")
    for (var i = 0; i < user.favoriteArtists.length; i++) {
        element.innerHTML += `<a class="badge bg-secondary rounded-pill p-2 m-1" href="tracks.html?artist=${user.favoriteArtists[i].id}">${user.favoriteArtists[i].name}</a>`;
    }
    var element = document.getElementById("genres")
    for (var i = 0; i < user.favoriteGenres.length; i++) {
        element.innerHTML += `<a class="badge bg-secondary rounded-pill p-2 m-1" href="tracks.html?genre=${user.favoriteGenres[i]}">${user.favoriteGenres[i]}</a>`;
    }
}

function initDelete() {
    document.getElementById("delete-alert").innerHTML =
    `
    <div class="alert alert-danger alert-dismissible fade show" role="alert" id="alert">
        Are you sure? This action will delete your account forever, there is no going back...
        <a class="btn btn-delete" onclick="commitDelete()">Yes, I'm sure, delete it</a>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
    `
}

function commitDelete() {
    var user = JSON.parse(localStorage.getItem("user"));

    fetch(`http://localhost:3100/users/${user._id}`, {
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
        userLogout();
    })
    .catch(error => alert(error));
}

function getGenres() {
    fetch(`http://localhost:3100/genres`, {
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
            .then(result => genres = result.genres);
    })
    .catch(error => alert(error))
}

function searchGenres(query) {
    if (query.length < 2) {
        return;
    }

    var element = document.getElementById("genres-dropdown");
    element.innerHTML = "";
    var k = 0;
    for (var i = 0; i < genres.length; i++) {
        if (genres[i].includes(query)) {
            k++;
            if (k < 10) {
                element.innerHTML +=
                `
                <li><a class="dropdown-item" onclick="addGenre('${genres[i]}')">${genres[i]}</a></li>
                `;
            } else {
                break;
            }
        }
    }
}

function searchArtists(query) {
    if (query.length < 2) {
        return;
    }

    fetch(`http://localhost:3100/search/artists?q=${query}`, {
        headers: {
            "Content-Type": "application/json",
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
        response.json().then(result => showResultArtists(result.artists.items));
    })
    .catch(error => alert(error))
}

function addArtist(artistName, artistId) {
    var element = document.getElementById("artist-zone");

    var artistElement = document.getElementById(artistId);
    if (artistElement != null)
        return;

    element.innerHTML +=
    `
    <div id="${artistId}" class="alert alert-success alert-dismissible fade show artist-name" role="alert">
        ${artistName}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
    `
}   

function addGenre(genre) {
    var element = document.getElementById("genre-zone");

    var genreElement = document.getElementById(genre);
    if (genreElement != null)
        return;

    element.innerHTML +=
    `
    <div id="${genre}" class="alert alert-success alert-dismissible fade show genre-name" role="alert">
        ${genre}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
    `
}

function showResultArtists(artists) {
    var element = document.getElementById("artists-dropdown");
    element.innerHTML = "";
    for (var i = 0; i < artists.length; i++) {
        element.innerHTML +=
        `
        <li><a class="dropdown-item" onclick="addArtist('${artists[i].name}', '${artists[i].id}')">${artists[i].name}</a></li>
        `;
    }
}

function updateUser() {
    var name = document.getElementById("input-username").value;
    if (name == undefined || name.trim().length == 0 || name.length > 25) {
        document.getElementById("result-alert").innerHTML =
        `<div class="alert alert-warning alert-dismissible fade show" role="alert" id="alert">
            Username must be between 1 and 25 characters long
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
        `;
        return;
    }

    var email = document.getElementById("input-email").value;
    var regex = new RegExp("[a-zA-Z0-9]+@[a-zA-Z0-9]+");
    if (email == undefined || email.length == 0 || !(regex.test(email))) {
        document.getElementById("result-alert").innerHTML =
        `<div class="alert alert-warning alert-dismissible fade show" role="alert" id="alert">
            Insert a valid email
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
        `;
        return;
    }

    var password = document.getElementById("input-password").value;
    var repeatedPassword = document.getElementById("input-repeat-password").value;
    if (password == undefined || password.length < 8 || password.length > 16) {
        document.getElementById("result-alert").innerHTML =
        `<div class="alert alert-warning alert-dismissible fade show" role="alert" id="alert">
            Your password must be between 8 and 16 characters long
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
        `;
        return;
    }
    if (password != repeatedPassword) {
        document.getElementById("result-alert").innerHTML =
        `<div class="alert alert-warning alert-dismissible fade show" role="alert" id="alert">
            You typed 2 different passwords, try again
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
        `;
        return;
    }

    var artists = [];
    var artistsElements = document.getElementsByClassName("artist-name");
    for (var i = 0; i < artistsElements.length; i++) {
        artists.push({
            name: artistsElements[i].innerText,
            id: artistsElements[i].id
        });
    }
    if (artists.length == 0) {
        document.getElementById("result-alert").innerHTML =
        `<div class="alert alert-warning alert-dismissible fade show" role="alert" id="alert">
            Select at least 1 artist you like
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
        `;
        return;
    }

    var genres = [];
    var genresElements = document.getElementsByClassName("genre-name");
    for (var i = 0; i < genresElements.length; i++) {
        genres.push(genresElements[i].innerText);
    }
    if (genres.length == 0) {
        document.getElementById("result-alert").innerHTML =
        `<div class="alert alert-warning alert-dismissible fade show" role="alert" id="alert">
            Select at least 1 genre you like
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
        `;
        return;
    }

    var newUser = {
        username: name,
        email: email,
        password: password,
        favoriteArtists: artists,
        favoriteGenres: genres
    }

    var user = JSON.parse(localStorage.getItem("user"));

    fetch(`http://localhost:3100/users/${user._id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem("token")
        },
        body: JSON.stringify(newUser)
    })
    .then(response => {
        if (!response.ok) {
            console.log(response);

            if (response.status == 401) {
                timeoutLogout();
                return;
            }
            
            document.getElementById("result-alert").innerHTML =
            `
            <div class="alert alert-warning alert-dismissible fade show" role="alert">
                Email and/or username already taken
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
            `
        } else {
            var user = JSON.parse(localStorage.getItem("user"));
            user.username = newUser.username;
            user.email = newUser.email;
            user.favoriteArtists = newUser.favoriteArtists;
            user.favoriteGenres = newUser.favoriteGenres;
            localStorage.setItem("user", JSON.stringify(user));
            window.location.href = "profile.html";
        }
    })
    .catch(error => alert(error));
}

function initEditFields() {
    var user = JSON.parse(localStorage.getItem("user"));

    document.getElementById("input-username").value = user.username;
    document.getElementById("input-email").value = user.email;
    
    var artistsContainer = document.getElementById("artist-zone");
    for (var i = 0; i < user.favoriteArtists.length; i++) {
        artistsContainer.innerHTML +=
        `
        <div id="${user.favoriteArtists[i].id}" class="alert alert-success alert-dismissible fade show artist-name" role="alert">
            ${user.favoriteArtists[i].name}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
        `
    }

    var genresContainer = document.getElementById("genre-zone");
    for (var i = 0; i < user.favoriteGenres.length; i++) {
        genresContainer.innerHTML +=
        `
        <div id="${user.favoriteGenres[i]}" class="alert alert-success alert-dismissible fade show genre-name" role="alert">
            ${user.favoriteGenres[i]}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
        `
    }
}