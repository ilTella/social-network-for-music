# SNM - Social Network for Music

- [Introduzione](#introduzione)
- [Configurazione dell'applicazione](#configurazione-dellapplicazione)
- [Struttura del progetto](#struttura-del-progetto)
    - [Stack tecnologico](#stack-tecnologico)
    - [Organizzazione del codice](#organizzazione-del-codice)
- [Struttura dell'applicazione web](#struttura-dellapplicazione-web)
    - [Database](#database)
    - [API](#api)
    - [Sito web](#sito-web)
- [Scelte implementative significative](#scelte-implementative-significative)
- [Prove di funzionamento](#prove-di-funzionamento)

## Introduzione

Progetto "Social Network for Music" realizzato per il corso "Tecnologie e linguaggi per il web" (a.a. 2022-2023, appello di gennaio 2024).

Autore: Alessandro Tellarini (matricola 975490)

## Configurazione dell'applicazione

L'applicazione richiede la presenza di un file `.env` nella directory principale, in cui sono contenuti parametri fondamentali per il suo funzionamento.
Tali parametri includono:
- il nome e l'url del database MongoDB, compresa la password per accedervi
- l'id e il segreto necessari per connettersi all'API di Spotify
- un segreto utilizzato per generare i token che permettono al client di usare l'API dell'applicazione

Il file è gestito attraverso il pacchetto npm `dotenv` che si occupa di inizializzare le relative variabili d'ambienti.

esempio di file:
```
SECRET = "secret1234"

# MongoDB
DB_NAME='snm'
DB_URI="mongodb+srv://user:password@pwm.4cbo7ac.mongodb.net/?retryWrites=true&w=majority"

# Spotify
BASE_URL="https://api.spotify.com/v1"
TOKEN_URL="https://accounts.spotify.com/api/token"
CLIENT_ID='ab004cf1e22f3afc80e455ec390ffaf2'
CLIENT_SECRET='af4e06994efccc10a0bd511e9aec12e5'
```

## Struttura del progetto

### Stack tecnologico

Frontend:
- `Bootstrap` come CSS framework

Backend:
- `Express` come Node.js web application framework
- Gestione autorizzazioni (sessioni): `jsonwebtoken` (`JWT`)

Database:
- `MongoDB`

### Organizzazione del codice

**Frontend**:

- `./css/`
    - `style.css`: stile utilizzato uniformemente nelle pagine dell'applicazione web
- `./html/`
    - `index.html`: home del sito, prima pagina a essere caricata
    - `login.html`: pagina di login, a cui l'utente viene reindirizzato se prova a eseguire azioni mentre non ha eseguito l'accesso, oppure quando scade la sessione
    - `playlist-creation.html`: creazione di una nuova playlist
    - `playlist.html`: visualizzazione di una playlist
    - `profile-edit.html`: modifica delle informazioni relative al proprio profilo
    - `profile.html`: visualizzazione del proprio profilo utente
    - `public-playlists.html`: pagina nella quale l'utente può ricercare playlist pubbliche avvalendosi di filtri
    - `recommendations.html`: raccomandazioni di tracce per l'utente sulla base delle sue preferenze
    - `registration.html`: pagina di registrazione per i nuovi utenti
    - `tracks.html`: pagina nella quale l'utente può ricercare tracce avvalendosi di filtri
    - `user-playlists.html`: visualizzazione delle playlist che l'utente ha aggiunto al suo profilo
- `./lib/`
    - `authentication.js`: funzioni relative a login, logout e registrazione
    - `edit-playlists.js`: funzioni per modifica e creazione di playlist
    - `menu.js`: codice dedito al funzionamento del menu presente in ogni pagina
    - `multiple-playlists.js`: funzioni per la gestione di molteplici playlist sulla pagina
    - `playlists.js`: funzioni necessarie nelle pagine che devono gestire playlist
    - `public-playlists.js`: funzioni necessarie nelle pagine che devono gestire playlist pubbliche
    - `recommendations.js`: codice per la generazione delle recommendations
    - `single-playlist.js`: funzioni per la gestione di una sola playlist sulla pagina
    - `tracks.js`: funzioni necessarie per la gestione di tracce
    - `user-playlists.js`: funzioni necessarie nelle pagine che devono gestire playlist dell'utente
    - `user.js`: codice necessario per la visualizzazione e modifica del profilo utente
    - `utils.js`: funzioni di utilità generale

**Backend**:

- `config.js`: file necessario per caricare i dati salvati come variabili d'ambiente

- `./lib/`
    - `./spotify/`
        - `fetch.js`: operazioni per l'ottenimento di dati da Spotify
        - `token.js`: codice per generare il token di autenticazione di Spotify
    - `database.js`: funzioni utili per ogni operazione sul database
    - `login.js`: operazioni di login
    - `playlists.js`: operazioni relative alle playlist
    - `users.js`: operazioni relative agli utenti
    - `utils.js`: funzioni di utilità generale

- `index.js`: file contenente gli endpoint dell'applicazione

## Struttura dell'applicazione web

### Database

Sono presenti due collezioni: `users` e `playlists`.

#### Users

La collezione `users` raccoglie le informazioni inerenti gli utenti registrati al sito.

Attributi
- `_id`: identificatore di un utente, di tipo ObjectId. Attributo obbligatorio e univoco.
- `username`: nickname dell'utente, di tipo string. Attributo obbligatorio e univoco.
- `email`: email dell'utente, di tipo string. Attributo obbligatorio e univoco.
- `password`: password dell'utente, di tipo string (viene salvato l'hash della password). Attributo obbligatorio.
- `favoriteArtists`: artisti preferiti dell'utente, lista di oggetti (id, name). Attributo obbligatorio, inoltre la lista deve contenere almeno un elemento.
- `favoriteGenres`: generi preferiti dell'utente, lista di string. Attributo obbligatorio, inoltre la lista deve contenere almeno un elemento.
- `playlists`: playlist aggiunte dall'utente, lista di oggetti (id, name, isOwner). Attributo obbligatorio

`playlists` è un attributo obbligatorio nel senso che non esisterà mai un elemento di `users` che non abbia questo attributo, tuttavia esso non viene fornito in input dall'utente, bensì inizializzato come una lista vuota alla registrazione di un nuovo utente.
In seguito la lista verrà popolata in base all'attività dell'utente.

#### Playlists

la collezione `playlists` raccoglie le informazioni inerenti le playist create dagli utenti dell'applicazione web.

Attributi
- `_id`: identificatore di una playlist, di tipo ObjectId. Attributo obbligatorio e univoco.
- `name`: nome della playlist, di tipo string. Attributo obbligatorio.
- `description`: descrizione della playlist, di tipo string. Attributo obbligatorio.
- `owner`: identificatore dell'utente che ha creato la playlist, di tipo ObjectId. Attributo obbligatorio.
- `tags`: tag associati alla playlist, lista di string. Attributo obbligatorio, inoltre la lista deve contenere almeno un elemento.
- `isPublic`: campo che indica se la playlist è pubblica oppure no, booleano. Attributo obbligatorio.
- `followers`: numero di utenti che hanno aggiunto questa playlist a quelle da loro seguite, di tipo integer. Attributo obbligatorio.
- `tracks`: tracce contenute nella playlist, lista di oggetti (id, name). Attributo obbligatorio.

`followers` è un attributo obbligatorio nel senso che non esisterà mai un elemento di `playlists` che non abbia questo attributo, tuttavia esso non viene fornito in input dall'utente, bensì inizializzato a 0 alla creazione di una playlist e poi modificato in seguito, quando un utente aggiunge o rimuove la playlist da quelle da egli seguite.

Vale lo stesso discorso per `tracks`, che viene inizializzato come una lista vuota alla creazione di una playlist e verrà popolato in seguito.

### API

Users:
- `GET /users`: restituisce tutti gli utenti.
- `GET /users/:id`: restituisce l'utente con l'id indicato.
- `POST /users`: crea un nuovo utente.
- `POST /users/:id/playlists`: aggiunge una playlist ad un utente.
Modifica la playlist in questione, aumentando di uno il numero di followers.
- `PUT /users/:id`: modifica l'utente già esistente con l'id indicato.
- `DELETE /users/:id`: elimina l'utente con l'id indicato.
Elimina tutte le playlist create dall'utente.
Rimuove da tutti gli utenti le playlist eliminate.
- `DELETE /users/:uid/playlists/:plid`: rimuove la playlist con l'id indicato (plid) dall'utente con l'id indicato (uid).
Modifica la playlist in questione, diminuendo di uno il numero di followers.

Playlists:
- `GET /playlists`: restituisce diverse playlist.
Tramite i parametri della query è possibile stabilire un limite per le playlist restituite (default: 50)
oppure indicare tramite lista di id quali playlist restituire
- `GET /playlists/:id`: restituisce la playlist con l'id indicato
- `POST /playlists`: crea una nuova playlist.
Modifica l'utente indicato come owner della playlist, aggiungendola alla sua lista di playlists.
- `POST /playlists/:id/tracks`: aggiunge una traccia alla playlist con l'id indicato
- `PUT /playlists/:id`: modifica la playlist con l'id indicato.
Modifica gli utenti che hanno la playlist in questione nella loro lista, aggiornandone il nome.
- `DELETE /playlists/:id`: elimina la playlist con l'id indicato.
Modifica gli utenti che hanno la playlist in questione nella loro lista, rimuovendola.
- `DELETE /playlists/:plid/tracks/:trid`: rimuove la traccia con l'id indicato (trid) dalla playlist con l'id indicato (plid)

### Sito web

In ogni pagina del sito web è presente, in alto, un menù dal quale l'utente può raggiungere diverse pagine.

Contenuto del menù:

Se non ha effettuato il login:
- Home
- Login

Se ha effettuato il login:
- Home
- Explore playlists
- Explore tracks
- Recommendations
- Your playlists
- Profile
- Logout (non è una pagina; premendo il pulsante viene effettuato il logout e si viene reindirizzati alla home)

Schema del sito per un utente che non ha ancora effettuato il login:

<img src="./images/diagram_no_login.png">

Schema del sito per un utente che ha già effettuato il login (le pagine in verde fanno parte del menù e possono essere raggiunte da qualsiasi altra pagina):

<img src="./images/diagram_login.png">

#### Home (`index.html`)

Home prima di effettuare il login

<img src="./images/home_no_login.png" style="max-width: 50%">

Home dopo aver effettuato il login

<img src="./images/home_login.png" style="max-width: 50%">

Pagina iniziale del sito, nella quale l'utente può visualizzare una porzione delle playlist pubbliche.
Se il visitatore non ha effettuato il login, da questa pagina può solamente arrivare alla pagina di login, altrimenti se ha già effettuato l'accesso potrà visitare tutte le pagine presenti nel menù, in aggiunta alle pagine di ogni playlist mostrata in quel momento.

#### Login (`login.html`)

<img src="./images/login.png" style="max-width: 50%">

In questa pagina un utente può inserire la sua email e password per effettuare il login; può inoltre accedere alla pagina di registrazione, nel caso voglia creare un nuovo profilo utente.
Se l'email inserita e/o la password non è corretta, verrà mostrato un avviso e il login non avrà successo.
Quando un utente tenta di eseguire qualsiasi azione dopo che la sessione è scaduta, verrà automaticamente effettuato il logout e reindirizzato a questa pagina.

#### Registration (`registration.html`)

<img src="./images/registration.png" style="max-width: 50%">

L'utente ha qui la possibilità di inserire le informazioni necessarie a creare un nuovo profilo utente, oppure tornare alla schermata di login.

#### Explore playlists (`public-playlists.html`)

<img src="./images/explore_playlists.png" style="max-width: 50%">

In questa pagina l'utente può ricercare le playlist pubbliche.
Ha a disposizione diversi filtri: nome della playlist, tag associati ad essa e nomi delle tracce contenute.
Se nessun filtro viene inserito, la ricerca restituirà una selezione arbitraria di playlist.

#### Explore tracks (`tracks.html`)

<img src="./images/explore_tracks.png" style="max-width: 50%">

In questa pagina l'utente può ricercare le tracce e aggiungerle a playlist di cui è proprietario, oppure creare una nuova playlist in cui quella traccia verrà aggiunta automaticamente.
Ha a disposizione diversi filtri: nome della traccia, artista presente nella traccia, album di cui essa fa parte, genere a esso associato.
Se nessun filtro viene inserito, la ricerca restituirà tracce rilasciate nell'anno in corso.

#### Recommendations (`recommendations.html`)

<img src="./images/recommendations.png" style="max-width: 50%">

Entrando in questa pagina, verranno presentate all'utente una selezione di tracce, che egli potrà aggiungere a playlist di cui è proprietario, oppure creare una nuova playlist a partire da una di esse (come in "explore tracks").
Le tracce vengono scelte in base ad una combinazione casuale di artisti e generi selezionati tra quelli che l'utente ha indicato come suoi preferiti.
Premendo il pulsante "generate" vengono generate nuove tracce.

#### Your playlists (`user-playlists.html`)

<img src="./images/your_playlists.png" style="max-width: 50%">

In questa pagina l'utente può visualizzare tutte le playlist che ha creato o che ha aggiunto.
Ha inoltre la possibilità di accedere ad una pagina dedicata alla creazione di una nuova playlist.

#### Playlist (`playlist.html`)

<img src="./images/playlist.png" style="max-width: 50%">

Questa pagina mostra le informazioni associate ad una playlist e la lista di tracce in essa contenute.
Se l'utente è il creatore della playlist ha la possibilità di rimuovere tracce.

#### Playlist creator (`playlist-creation.html`)

<img src="./images/playlist_creator.png" style="max-width: 50%">

Qui l'utente può inserire i dati necessari a creare una nuova playlist.

#### Playlist editor (`playlist-edit.html`)

<img src="./images/playlist_editor.png" style="max-width: 50%">

Qui l'utente può modificare una playlist di cui è proprietario, oppure eliminarla.

#### Profile (`profile.html`)

<img src="./images/profile.png" style="max-width: 50%">

In questa pagina vengono mostrate all'utente le informazioni associate al proprio account.
Egli ha la possibilità di accedere ad una pagina da cui modificare il profilo, effettuare il logout, oppure eliminare il profilo.

#### Profile editor (`profile-edit.html`)

<img src="./images/profile_editor.png" style="max-width: 50%">

Qui l'utente può modificare il proprio profilo.

## Scelte implementative significative

### Autenticazione

Quando un utente effettua il login, se le credenziali sono corrette viene generato un token `JWT` che viene inviato al client nella risposta.
Il client salverà questo token nel `local storage` e dovrà includerlo nelle richieste che effettuerà successivamente.

Ogni endpoint dell'applicazione (tranne quelli necessari per le operazioni effettuabili prima del login), quando viene effettuata una richiesta, controllano se negli header è presente un token di autenticazione, se presente ne viene verificata la validità.
Se il token non è presente oppure non è valido, viene restituito al client una risposta negativa con codice 401 (Unauthorized).

### Token Spotify

Il frontend comunica sempre solamente col backend; è il backend che si occupa di comunicare con l'API di Spotify.
Il backend si occupa di generare, memorizzare e rinnovare il token di autenticazione a Spotify e si occupa inoltre di ricevere le richieste del client, effettuare le richieste a Spotify, ricevere i dati e fornirli al client.
In questo modo dal punto di vista del client l'interazione è solo col backend e non con entità esterne ed inoltre non vengono esposti i segreti per l'accesso a Spotify.

### Gestione dei generi

Tramite l'API di Spotify non è possibile ottenere in modo semplice le informazioni riguardanti il genere o i generi musicali di una canzone.
Si può avere una lista di generi associati ad un artista, ma ciò è poco utile.
Per questo motivo ho deciso di non mostrare il genere di una traccia, ma solo le altre informazioni ottenibili in modo efficiente e consistente (nome, album, artisti, durata, anno di pubblicazione).
L'utente ha comunque la possibilità di ricercare tracce utilizzando il genere come parametro di ricerca.

Durante la registrazione vengono chiesti al nuovo utente i suoi generi preferiti; questo dato viene utilizzato per generare le raccomandazioni personalizzate, mostrate all'utente nella sezione "recommendations".

### Visibilità delle playlist

Quando un utente modifica la visibilità di una sua playlist da pubblica a privata, essa non viene rimossa dalle liste degli utenti che l'hanno aggiunta, essi semplicemente non la visualizzano più nella loro sezione "my playlists".
In questo modo, se il proprietario dovesse decidere di rendere di nuovo pubblica la sua playlist, chi in passato l'aveva aggiunta potrà immediatamente visualizzarla di nuovo.

Rendere una playlist privata, quindi, non la rimuove dagli elenchi di chi l'ha già aggiunta, ma ne impedisce solo la visualizzazione, ed evita inoltre che ulteriori utenti possano trovarla, in quanto scompare dai risultati di ricerca delle playlist e dalla frontpage.
Solo il proprietario di una playlist può visualizzarla fintanto che è privata.

### Ricerca per tracce

Quando una traccia viene aggiunta ad una playlist, vengono salvate due informazioni: l'id di Spotify e il nome della traccia.
Quest'ultimo viene salvato in lowercase, per semplificare le future ricerche basate su traccia.
Quando l'utente inserisce il nome di una traccia che vuole trovare nelle playlist da egli cercate, esso viene trasformato a sua volta in lowercase e poi confrontato con i nomi delle tracce presenti nelle playlist.
In questo modo si semplifica il processo di ricerca, migliorando l'esperienza dell'utente, che deve preoccuparsi solamente di inserire il nome della traccia, senza doversi ricordare di quali lettere siano maiuscole o minuscole nel titolo ufficiale.
Non è nemmeno necessario inserire il nome completo della traccia, in quanto la ricerca restituirà tutte le playlist che contengono almeno una traccia il cui nome contenga la stringa di testo inserita (ad esempio: cercare "sun" restituirà le playlist che contengono la traccia "Here Comes the Sun").

### Feautures aggiuntive di ricerca

I generi e gli artisti selezionati come preferiti dall'utente possono essere visualizzati nella pagina "profile"; se l'utente ci clicca sopra, viene reindirizzato alla pagina di ricerca delle tracce.
Se ha cliccato su un genere, vengono restituite tracce legate a quel genere.
Se ha cliccato su un artista, vengono restituite le tracce al momento più popolari di quell'artista.

Durante la visualizzazione di una traccia, l'utente ha la possibilità di cliccare su uno degli artisti ad essa associati o sull'album di cui essa fa parte: verrà reindirizzato anche in questo caso alla pagina di ricerca delle tracce.
Se ha cliccato su un artista, verranno restituite le tracce al momento più popolari di quell'artista.
Se ha cliccato sull'album, verranno restituite tutte le tracce contenute in quell'album.

L'utente ha la possibilità di cliccare su un tag di una playlist: verrà reindirizzato alla pagina di ricerca delle playlist pubbliche e gli verranno presentate le playlist contenenti quel tag.

### Utenti

Per questa applicazione ho scelto di porre il focus sulle playlist e non sugli utenti che le hanno create, questo in accordo con le specifiche fornite ma anche per rendere il sito più semplice ed intuitivo.
Di conseguenza non è possibile per un utente ricercare altri utenti sulla piattaforma, aggiungerli come amici o seguirli.
Queste feature addizionali aggiungerebbero un livello di complessità ulteriore all'applicazione, ma potrebbero anche portare vantaggi dal punto di vista dell'esperienza dell'utente.
Si potrebbero valutare come aggiornamenti futuri.

### Lingua

La lingua scelta per il progetto è l'inglese, in quanto essa è la lingua più diffusa nell'ambiente di sviluppo software e non solo.
Questa scelta permette a sviluppatori di tutto il mondo di poter leggere e capire il lavoro svolto.

## Prove di funzionamento

Verranno qui di seguito esposte, come richiesto, alcune prove di funzionamento delle feature dell'applicazione web.

### Creazione playlist

Inserendo tutti i dati richiesti nel playlist creator, viene creata una nuova playlist.
Essa può successivamente essere visualizzata tra le playlist dell'utente.

<img src="./images/playlist_creation_1.png" style="max-width: 80%">

<img src="./images/playlist_creation_2.png" style="max-width: 80%">

### Aggiunta traccia

Selezionando una traccia, è possibile aggiungerla ad una delle playlist di cui l'utente è proprietario.
In seguito tale traccia apparirà tra la lista di tracce contenute in quella playlist.

<img src="./images/add_track_1.png" style="max-width: 80%">

<img src="./images/add_track_2.png" style="max-width: 80%">

### Rimozione traccia

Premendo il pulsante "remove" su una traccia contenuta nella playlist, essa viene correttamente rimossa.
Vengono aggiornati i dati riguardanti il numero di tracce nella playlist e la sua durata complessiva

<img src="./images/remove_track.png" style="max-width: 80%">

### Eliminazione playlist

Accedendo all'editor della playlist, è possibile premere il pulsante "delete playlist" per eliminarla.
Successivamente essa non sarà più visibile tra le playlist dell'utente, in quanto non esiste più (scomparirà anche dalle raccolte di tutti gli altri utenti).

<img src="./images/delete_playlist_1.png" style="max-width: 80%">

<img src="./images/delete_playlist_2.png" style="max-width: 80%">

### Aggiunta playlist

A partire dalla home, da "explore playlists" o infine dalla pagina di una singola playlist, è possibile aggiungerla alla propria raccolta premendo il pulsante "add".
Essa potrà poi essere visualizzata nella pagina "my playlists".

<img src="./images/add_playlist_1.png" style="max-width: 80%">

<img src="./images/add_playlist_2.png" style="max-width: 80%">

### Rimozione playlist

A partire dalla home, da "explore playlists", da "my playlists" o infine dalla pagina di una singola playlist, è possibile rimuoverla dalla propria raccolta premendo il pulsante "remove".
Essa non sarà più presente tra le playlist della pagina "my playlists".

<img src="./images/remove_playlist_1.png" style="max-width: 80%">

<img src="./images/delete_playlist_2.png" style="max-width: 80%">

### Reattività dell'interfaccia

Come si può vedere in questa immagine, quando le dimensioni della finestra vengono ridotte, l'applicazione reagisce correttamente.

<img src="./images/small_window.png" style="max-height: 500">