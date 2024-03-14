function addTag() {
    var tag = document.getElementById("input-tag").value;
    if (tag == "")
        return;
    var tagElement = document.getElementById(tag);
    if (tagElement != null)
        return;
    document.getElementById("input-tag").value = "";

    if (!isTagValid(tag)) {
        document.getElementById("tag-alert").innerHTML +=
        `
        <div class="alert alert-warning alert-dismissible fade show text-center" role="alert">
            Tags must be between 1 and 25 characters long
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
        `
        return;
    }

    if (window.location.href.includes("public")) {
        document.getElementById("tag-zone").innerHTML +=
        `
        <div id="${tag}" class="alert alert-success alert-dismissible fade show tag-name text-center" role="alert">
            ${tag}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
        `
    } else {
        document.getElementById("tag-zone").innerHTML +=
        `
        <div class="row">
            <div class="col-3"></div>
            <div id="${tag}" class="alert alert-success alert-dismissible fade show tag-name text-center col-6" role="alert">
                ${tag}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
            <div class="col-3"></div>
        </div>
        `
    }
}

function isTagValid(tag) {
    if (tag.trim().length == 0 || tag.trim().length > 25)
        return false;
    return true;
}

function getOnePlaylist(playlistId, func) {
    fetch(`http://localhost:3100/playlists/${playlistId}`, {
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
        .then(content => func(content));
    })
    .catch(error => alert(error));
}

function showPlaylists(playlists) {
    var card = document.getElementById("card-playlist");
    var container = document.getElementById("container-playlist");
    container.innerHTML = "";
    container.append(card);

    var user = localStorage.getItem("user");

    for (var i = playlists.length - 1; i >= 0; i--) {
        var clone = card.cloneNode(true);

        clone.id = 'card-playlist-' + i;
        var name = playlists[i].name;
        if (name.length > 50) 
            name = name.substring(0, 50) + "...";
        icon = " 🔒";
        if (playlists[i].isPublic) {
            icon = " 🌍";
        }
        if (window.location.href.includes("public") || window.location.href.includes("index")) {
            icon = "";
        }
        clone.getElementsByClassName('card-title')[0].innerText = playlists[i].name + icon;
        var description = playlists[i].description;
        if (description.length > 50)
            description = description.substring(0, 50) + "...";
        clone.getElementsByClassName('description')[0].innerText = description;
        clone.getElementsByClassName('followers')[0].innerText = playlists[i].followers + " followers";
        clone.getElementsByClassName('tracks')[0].innerText = playlists[i].tracks.length + " tracks";
        for (var j = 0; j < playlists[i].tags.length; j++) {
            if (user != null) {
                link = `public-playlists.html?tag=${playlists[i].tags[j]}`;
            } else {
                link = "login.html";
            }
            clone.getElementsByClassName('card-tags')[0].innerHTML += `<a class="badge bg-secondary rounded-pill p-2 m-1" href="${link}">${playlists[i].tags[j]}</a>`;
        }

        if (user != null) {
            var userData = JSON.parse(user);

            if (playlists[i].isPublic == false && (playlists[i].owner != userData._id))
                continue;

            var button = "";

            if (playlists[i].owner != userData._id) {
                var toRemove = false;
                for (var j = 0; j < userData.playlists.length; j++) {
                    if (userData.playlists[j].id == playlists[i]._id) {
                        toRemove = true;
                        break;
                    }
                }
                if (toRemove) {
                    button = `<button class="btn" onclick="removePlaylist('${playlists[i]._id}', '${playlists[i].name.replace("'", "’")}', '${i}')">Remove ❌</button>`;
                } else {
                    button = `<button class="btn" onclick="addPlaylist('${playlists[i]._id}', '${playlists[i].name.replace("'", "’")}', '${i}')">Add 💚</button>`;
                }

                clone.getElementsByClassName('card-footer')[0].innerHTML =
                `
                <div class="row">
                    <div class="col-6">
                        <a href="playlist.html?playlistId=${playlists[i]._id}" class="btn">View</a>
                    </div>
                    <div class="col-6">
                        ${button}
                    </div>
                </div>
                `;
            } else {
                clone.getElementsByClassName('owner-badge')[0].innerHTML = `<span class="badge bg-secondary rounded-pill p-2 m-1">owner 👑</span>`;

                clone.getElementsByClassName('card-footer')[0].innerHTML =
                `
                <div class="row">
                    <div class="col-12">
                        <a href="playlist.html?playlistId=${playlists[i]._id}" class="btn">View </a>
                    </div>
                </div>
                `;
            }

        } else {
            clone.getElementsByClassName('card-footer')[0].innerHTML =
            `
            <div class="row">
                <div class="col-12">
                    <a href="login.html" class="btn">View</a>
                </div>
            </div>
            `;
        }

        clone.classList.remove('d-none');

        card.after(clone);
    }
}