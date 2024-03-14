function submitEdit() {
    var elementResult = document.getElementById("edit-result");

    var inputName = document.getElementById("input-name").value;
    var inputDescription = document.getElementById("input-description").value;
    var publicStatus = document.getElementById("check-public").checked;
    var inputTags = [];
    var tagElements = document.getElementsByClassName("tag-name");

    if (!areFieldsOk(elementResult, inputName, inputDescription, tagElements))
        return;

    for (var i = 0; i < tagElements.length; i++) {
        inputTags.push(tagElements[i].innerText);
    }

    var updatedPlaylist = {
        name: inputName,
        description: inputDescription,
        isPublic: publicStatus,
        tags: inputTags
    };

    updatePlaylist(id, updatedPlaylist);
}

function submitCreation() {
    var elementResult = document.getElementById("creation-result");

    var inputName = document.getElementById("input-name").value;
    var inputDescription = document.getElementById("input-description").value;
    var publicStatus = document.getElementById("check-public").checked;
    var inputTags = [];
    var tagElements = document.getElementsByClassName("tag-name");

    if (!areFieldsOk(elementResult, inputName, inputDescription, tagElements))
        return;

    for (var i = 0; i < tagElements.length; i++) {
        inputTags.push(tagElements[i].innerText);
    }

    var user = JSON.parse(localStorage.getItem("user"));

    var newPlaylist = {
        name: inputName,
        description: inputDescription,
        isPublic: publicStatus,
        tags: inputTags,
        owner: user._id
    };

    createPlaylist(newPlaylist);
}

function areFieldsOk(elementResult, inputName, inputDescription, tagElements) {
    if (inputName == undefined || inputName.trim().length == 0 || inputName.trim().length > 30) {
        elementResult.innerHTML =
        `
        <div class="alert alert-warning alert-dismissible fade show text-center" role="alert">
            Insert a valid name, between 1 and 30 characters long
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
        `;
        return false;
    }

    if (inputDescription == undefined || inputDescription.trim().length == 0) {
        elementResult.innerHTML =
        `
        <div class="alert alert-warning alert-dismissible fade show text-center" role="alert">
            Insert a valid description
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
        `;
        return false;
    }

    var tagElements = document.getElementsByClassName("tag-name");
    if (tagElements.length == 0) {
        elementResult.innerHTML =
        `
        <div class="alert alert-warning alert-dismissible fade show text-center" role="alert">
            Insert at least 1 tag
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
        `;
        return false;
    }

    if (tagElements.length > 8) {
        elementResult.innerHTML =
        `
        <div class="alert alert-warning alert-dismissible fade show text-center" role="alert">
            Cannot have more than 8 tags
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
        `;
        return false;
    }

    return true;
}

function createPlaylist(newPlaylist) {
    fetch(`http://localhost:3100/playlists`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem("token")
        },
        body: JSON.stringify(newPlaylist)
    })
    .then(response => {
        if (!response.ok) {
            console.log(response);

            if (response.status == 401) {
                timeoutLogout();
                return;
            }

            document.getElementById("creation-result").innerHTML =
            `
            <div class="alert alert-warning alert-dismissible fade show" role="alert">
                Something went wrong
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
            `;
        } else {
            response.json()
            .then(data => {
                var params = new URLSearchParams(window.location.search);
                var trackId = params.get("id");

                var user = JSON.parse(localStorage.getItem("user"));
                playlist = {
                    id: data.id,
                    name: newPlaylist.name,
                    isOwner: true
                }
                user.playlists.push(playlist);

                localStorage.setItem("user", JSON.stringify(user));

                if (trackId != null) {
                    var track = {
                        id: trackId,
                        name: params.get("name")
                    }

                    fetch(`http://localhost:3100/playlists/${data.id}/tracks`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json;charset=utf-8',
                            Authorization: localStorage.getItem("token")
                        },
                        body: JSON.stringify(track)
                    })
                }
                window.location.href = `user-playlists.html`;
            })
        }
    })
    .catch(error => alert(error));
}

function deletePlaylist() {
    fetch(`http://localhost:3100/playlists/${id}`, {
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
                return;
            }

            document.getElementById("edit-result").innerHTML =
            `
            <div class="alert alert-warning alert-dismissible fade show" role="alert">
                Something went wrong
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
            `;
        } else {
            var user = JSON.parse(localStorage.getItem("user"));
            var index;
            for (index = 0; index < user.playlists.length; index++) {
                if (user.playlists[index].id == id)
                    break;
            }
            user.playlists.splice(index, 1);
            localStorage.setItem("user", JSON.stringify(user));

            window.location.href = `user-playlists.html`;
        }
    })
    .catch(error => alert(error));
}

function initEditFields(playlist) {
    document.getElementById("input-name").value = playlist.name;
    document.getElementById("input-description").value = playlist.description;
    var checkElement =  document.getElementById("check-public");
    var checkElementLabel =  document.getElementById("check-public-label");
    if (playlist.isPublic) {
        checkElementLabel.innerText = "public playlist 🌍";
    } else {
        checkElement.removeAttribute("checked");
        checkElementLabel.innerText = "private playlist 🔒";
    }
    var tagsContainer = document.getElementById("tag-zone");
    for (var i = 0; i < playlist.tags.length; i++) {
        tagsContainer.innerHTML +=
        `
        <div class="row">
            <div class="col-3"></div>
            <div id="${playlist.tags[i]}" class="alert alert-success alert-dismissible fade show tag-name text-center col-6" role="alert">
                ${playlist.tags[i]}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
            <div class="col-3"></div>
        </div>
        `
    }
}

function updatePlaylist(playlistId, updatedPlaylist) {
    fetch(`http://localhost:3100/playlists/${playlistId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem("token")
        },
        body: JSON.stringify(updatedPlaylist)
    })
    .then(response => {
        if (!response.ok) {
            console.log(response);

            if (response.status == 401) {
                timeoutLogout();
                return;
            }
        } else {
            var user = JSON.parse(localStorage.getItem("user"));
            for (var i = 0; i < user.playlists.length; i++) {
                if (user.playlists[i].id == playlistId) {
                    user.playlists[i].name = updatedPlaylist.name;
                    break;
                }
            }
            localStorage.setItem("user", JSON.stringify(user));
            window.location.href = `playlist.html?playlistId=${playlistId}`;
        }
    })
    .catch(error => alert(error));
}

function changeIcon() {
    var check = document.getElementById("check-public");
    var label = document.getElementById("check-public-label");
    if (check.checked) {
        label.innerText = "public playlist 🌍";
    } else {
        label.innerText = "private playlist 🔒";
    }
}