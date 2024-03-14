function logout(url) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = url;
}

function userLogout() {
    logout("index.html");
}

function timeoutLogout() {
    logout("login.html?timeout=true");
}

function login() {
    var email = document.getElementById("input-email").value;
    var password = document.getElementById("input-password").value;

    user = {
        email: email,
        password: password
    };

    fetch("http://localhost:3100/login", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    })
    .then(response => {
        if (!response.ok) {
            document.getElementById("failure-alert").innerHTML =
            `<div class="alert alert-warning alert-dismissible fade show" role="alert" id="alert">
                Email and/or password are incorrect! Retry
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
            `
            return;
        }
        response.json()
        .then(data => {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            window.location.href = "index.html";
        })
    })
    .catch(error => alert(error))

    return false;
}

function register() {
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

    fetch(`http://localhost:3100/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
    })
    .then(response => {
        if (!response.ok) {
            console.log(response);
            document.getElementById("result-alert").innerHTML =
            `
            <div class="alert alert-warning alert-dismissible fade show" role="alert">
                Email and/or username already taken
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
            `
        } else {
                window.location.href = `login.html`;
        }
    })
    .catch(error => alert(error));
}