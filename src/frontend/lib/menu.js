var menuItems = [
    { label: "Home", link: "index.html" },
    { label: "Login", link: "login.html" }
];

if (localStorage.getItem("user") != null) {
    menuItems.pop();
    menuItems.push({label: "Explore playlists", link: "public-playlists.html"});
    menuItems.push({label: "Explore tracks", link: "tracks.html"});
    menuItems.push({label: "Recommendations", link: "recommendations.html"});
    menuItems.push({label: "Your playlists", link: "user-playlists.html"});
    menuItems.push({label: "Profile", link: "profile.html"});
}

var menuHTML = "";

for (let i = 0; i < menuItems.length; i++) {
    let item = menuItems[i];
    menuHTML += `<li class="nav-item"><a class="nav-link" href="${item.link}">${item.label}</a></li>`;
}

if (localStorage.getItem("user") != null) {
    menuHTML += `<li class="nav-item"><a class="nav-link" href="#" onclick="userLogout()">Logout</a></li>`;
}

var menuElement = document.getElementById('menu');
menuElement.innerHTML =
`
<nav class="navbar navbar-expand-md fixed-top bg-body-tertiary" data-bs-theme="dark">
    <div class="container-fluid">
        <a class="navbar-brand" href="#">SNM</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
            aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav">
                ${menuHTML}
            </ul>
        </div>
    </div>
</nav>
`;