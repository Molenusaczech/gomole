const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });
const http = require('http');
const fs = require('fs');
const { start } = require('repl');
let mainSocket = null;
let games = {};
let users = {};

const winLib = require('./server/checkWin.js');

const hostname = "10.0.1.19";
console.log("Server running at http://" + hostname + ":8080/");

function invertPlayer(player) {
    if (player == 1) {
        return 2;
    } else {
        return 1;
    }
}

function startGame(id) {

    games[id]["status"] = "swap1";
    if (games[id]["startingPlayer"] == null) {
        console.log("random starting player");
        games[id]["startingPlayer"] = Math.round(Math.random()) + 1;
    } else {

        if (games[id]["startingPlayer"] == 1) {
            games[id]["startingPlayer"] = 2;
            console.log("starting player 2");
        } else if (games[id]["startingPlayer"] == 2) {
            games[id]["startingPlayer"] = 1;
            console.log("starting player 1");
        }

    }

    games[id] = {
        ...games[id],
        player1Symbol: null,
        player2Symbol: null,
        player1Time: games[id]["tempo"],
        player2Time: games[id]["tempo"],
        playerTurn: games[id]["startingPlayer"],
        turnStartTime: Date.now(),
        lastTurn: undefined,
        history: {
            swap: [],
            swap2: [],
            moves: [],
            choose: null
        },
    }

    games[id]["board"] = [
        ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    ]

    games[id]["spectators"].forEach(function (spectator) {
        users[spectator].send(JSON.stringify(
            {
                "type": "gameUpdated",
                "data": games[id]
            }));
    });

}

function updateGame(id) {

    if (games[id] == null) {
        return;
    }

    games[id]["spectators"].forEach(function (spectator) {
        users[spectator].send(JSON.stringify(
            {
                "type": "gameUpdated",
                "data": games[id]
            }));
    });
}

function removePlayer(id, player) {
    console.log("Leaving Game");
    console.log("id: " + id + " player: " + player);

    if (games[id] == null) {
        return;
    }

    console.log(games[id]["spectators"])
    let index = games[id]["spectators"].indexOf(player);
    if (index > -1) {
        games[id]["spectators"].splice(index, 1);
    }

    let ws = users[player];

    ws.send(JSON.stringify({
        "type": "gameLeft",
        "data": games[id]
    }));


    updateGame(id);
}

function getPlayerIndex(id, playerName) {
    if (games[id]["player1"] == playerName) {
        return 1;
    } else if (games[id]["player2"] == playerName) {
        return 2;
    } else {
        return null;
    }
}

function unSitPlayer(id, username) {
    if (games[id] == null) {
        console.log("Game not found");
        return;
    }

    if (games[id]["player1"] == username) {
        games[id]["player1"] = null;
        console.log("Player 1 unset");
    }

    if (games[id]["player2"] == username) {
        games[id]["player2"] = null;
        console.log("Player 2 unset");
    }
    updateGame(id);

}

function AddPlayerToGame(gameId, username) {
    if (games[gameId] == null) {
        console.log("Game not found");
        return;
    }

    if (!games[gameId]["spectators"].includes(username)) {
        games[gameId]["spectators"].push(username);
    }

    let ws = users[username];

    ws.send(JSON.stringify(
        {
            "type": "gameJoined",
            "data": games[gameId]
        }));
    updateGame(gameId);
}

function sitPlayer(id, username, slot) {
    if (games[id] == null) {
        console.log("Game not found");
        return;
    }
    if (!games[id]["spectators"].includes(username)) {
        games[id]["spectators"].push(username);
    }
    if (slot == 1 && games[id]["player1"] == null && games[id]["player2"] != username) {
        games[id]["player1"] = username;
        console.log("Player 1 set");
    }

    if (slot == 2 && games[id]["player2"] == null && games[id]["player1"] != username) {
        games[id]["player2"] = username;
        console.log("Player 2 set");
    }

    updateGame(id);

}

function createGame(admin) {
    let game = {
        id: Math.random().toString(36).substr(2, 9),
        player1: null,
        player2: null,
        startingPlayer: null,
        player1Symbol: null,
        playerTurn: 0,
        player2Symbol: null,
        admin: admin,
        tempo: 600,
        fisher: 0,
        spectators: [admin],
        status: "waiting",
        history: {
            swap: [],
            swap2: [],
            moves: [],
            choose: null
        },
        board: [
            ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
        ]
    };
    games[game.id] = game;
    //ws.send(JSON.stringify(game));

    let ws = users[admin];
    ws.send(JSON.stringify(
        {
            "type": "gameJoined",
            "data": game
        }));

    wss.broadcast(JSON.stringify({
        type: "gameCreated",
        game: game
    }));
}

function readyPlayer(id, username) {
    console.log("Starting Game");

    if (games[id] == null) {
        console.log("Game not found");
        return;
    }

    if (games[id]["player1"] == null || games[id]["player2"] == null) {
        console.log("Not enough players");
        return;
    }

    if (games[id]["status"] == "waiting") {

        if (games[id]["player1"] == username) {
            games[id]["status"] = "start1";
        } else if (games[id]["player2"] == username) {
            games[id]["status"] = "start2";
        } else {
            console.log("Not a player");
            return;
        }

        updateGame(id);
    } else if (games[id]["status"] == "start1") {
        if (games[id]["player2"] == username) {
            startGame(id);
        }
    } else if (games[id]["status"] == "start2") {
        if (games[id]["player1"] == username) {
            startGame(id);
        }
    }
}

function place(id, username, x, y) {
    if (games[id] == null) {
        console.log("Game not found");
        return;
    }

    if (games[id]["board"][x][y] != "") {
        console.log("Invalid move");
        return;
    }

    let player = getPlayerIndex(id, username);

    console.log("Placing " + x + "" + y + " for player " + player);

    if (player == games[id]["startingPlayer"]) {
        console.log("valid swap");
        if (games[id]["status"] == "swap1") {
            games[id]["board"][x][y] = "x";
            games[id]["history"]["swap"][0] = [x, y];
            games[id] = {
                ...games[id],
                status: "swap2",
                turnStartTime: Date.now()
            };
        } else if (games[id]["status"] == "swap2") {
            games[id]["board"][x][y] = "o";
            games[id]["history"]["swap"][1] = [x, y];
            games[id] = {
                ...games[id],
                status: "swap3",
                turnStartTime: Date.now()
            };
        }
        else if (games[id]["status"] == "swap3") {
            games[id]["board"][x][y] = "x";
            games[id]["history"]["swap"][2] = [x, y];
            games[id] = {
                ...games[id],
                status: "swap4",
                playerTurn: invertPlayer(games[id]["startingPlayer"]),
                turnStartTime: Date.now()
            };
        }
    } else {
        if (games[id]["status"] == "swap4") {
            games[id]["board"][x][y] = "o";
            games[id]["history"]["swap2"][0] = [x, y];
            games[id] = {
                ...games[id],
                status: "swap5",
                turnStartTime: Date.now()
            };
        } else if (games[id]["status"] == "swap5") {
            games[id]["board"][x][y] = "x";
            games[id]["history"]["swap2"][1] = [x, y];
            games[id] = {
                ...games[id],
                status: "choose",
                playerTurn: games[id]["startingPlayer"],
                turnStartTime: Date.now()
            };
        }

    }

    if (games[id]["status"] == "turn1" && player == 1) {
        games[id]["board"][x][y] = games[id]["player1Symbol"];
        games[id]["history"]["moves"].push([x, y]);
        games[id] = {
            ...games[id],
            status: "turn2",
            playerTurn: 2,
            lastTurn: [x, y],
            player1Time: Number(games[id]["fisher"]) + Number(games[id]["player1Time"]),
            turnStartTime: Date.now()
        };
    }

    if (games[id]["status"] == "turn2" && player == 2) {
        games[id]["board"][x][y] = games[id]["player2Symbol"];
        games[id]["history"]["moves"].push([x, y]);
        games[id] = {
            ...games[id],
            status: "turn1",
            playerTurn: 1,
            lastTurn: [x, y],
            player2Time: Number(games[id]["fisher"]) + Number(games[id]["player2Time"]),
            turnStartTime: Date.now()
        }
    }


    let win = winLib.checkWin(games[id]["board"]);

    if (win == "x") {
        console.log("X wins");
        games[id]["playerTurn"] = null;
        if (games[id]["player1Symbol"] == "x") {
            games[id]["status"] = "waiting";
            games[id]["winner"] = 1;
        } else {
            games[id]["status"] = "waiting";
            games[id]["winner"] = 2;
        }
    } else if (win == "o") {
        console.log("O wins");
        games[id]["playerTurn"] = null;
        if (games[id]["player1Symbol"] == "o") {
            games[id]["status"] = "waiting";
            games[id]["winner"] = 1;
        } else {
            games[id]["status"] = "waiting";
            games[id]["winner"] = 2;
        }
    }
    updateGame(id);

}

function pickSymbol(id, symbol, username) {
    if (games[id] == null) {
        console.log("Game not found");
        return;
    }

    let player = getPlayerIndex(id, username);

    if (games[id]["status"] == "swap4") {
        if (player == games[id]["startingPlayer"]) {
            console.log("Wrong player");
            return;
        }

        games[id]["turnStartTime"] = Date.now();

        if (symbol == "x") {
            games[id]["history"]["choose"] = "x";

            if (games[id]["startingPlayer"] == 1) {
                games[id] = {
                    ...games[id],
                    "status": "turn1",
                    "player1Symbol": "o",
                    "player2Symbol": "x",
                    "playerTurn": 1
                }
            } else {
                games[id] = {
                    ...games[id],
                    "status": "turn2",
                    "player1Symbol": "x",
                    "player2Symbol": "o",
                    "playerTurn": 2
                }
            }

        } else if (symbol == "o") {
            games[id]["history"]["choose"] = "o";
            if (games[id]["startingPlayer"] == 1) {
                games[id] = {
                    ...games[id],
                    "status": "turn2",
                    "player1Symbol": "x",
                    "player2Symbol": "o",
                    "playerTurn": 2
                }
            } else {
                games[id] = {
                    ...games[id],
                    "status": "turn1",
                    "player1Symbol": "o",
                    "player2Symbol": "x",
                    "playerTurn": 1
                }
            }
        }

    } else if (games[id]["status"] == "choose") {
        if (player != games[id]["startingPlayer"]) {
            console.log("Wrong player");
            return;
        }

        games[id]["turnStartTime"] = Date.now();

        if (symbol == "x") {
            games[id]["history"]["choose"] = "x";
            if (games[id]["startingPlayer"] == 1) {
                games[id] = {
                    ...games[id],
                    "status": "turn2",
                    "player1Symbol": "x",
                    "player2Symbol": "o",
                    "playerTurn": 2
                }
            } else {
                games[id] = {
                    ...games[id],
                    "status": "turn1",
                    "player1Symbol": "o",
                    "player2Symbol": "x",
                    "playerTurn": 1
                }
            }
        } else if (symbol == "o") {
            games[id]["history"]["choose"] = "o";
            if (games[id]["startingPlayer"] == 1) {
                games[id] = {
                    ...games[id],
                    "status": "turn1",
                    "player1Symbol": "o",
                    "player2Symbol": "x",
                    "playerTurn": 1
                }
            } else {
                games[id] = {
                    ...games[id],
                    "status": "turn2",
                    "player1Symbol": "x",
                    "player2Symbol": "o",
                    "playerTurn": 2
                }
            }
        }
    }

    updateGame(id);
}

function updateSettings(id, tempo, fisher) {

    if (games[id] == null) {
        console.log("Game not found");
        return;
    }

    if (games[id]["status"] != "waiting") {
        console.log("Game already started");
        return;
    }

    if (tempo != null && tempo >= 1 && tempo <= 36000) {
        games[id]["tempo"] = tempo;
    }

    if (fisher != null && fisher >= 0 && fisher <= 600) {
        games[id]["fisher"] = fisher;
    }

    updateGame(id);
}

wss.on('connection', function connection(ws) {
    console.log("Client Connected");
    ws.on('message', function (message) {
        message = JSON.parse(message + "");
        let action = message.type;
        let data = message.data;
        console.log("action: " + action);
        console.log(data);

        if (action == "auth") {
            console.log("Authenticating user");
            users[data.username] = ws;
            console.log(users);
            ws.send(JSON.stringify({ type: "auth", data: { "games": games } }));
            return;
        }

        if (ws != users[data.username]) {
            console.log("User not authenticated");
            return;
        }

        switch (action) {
            case "create":
                console.log("Creating Game");
                createGame(data.username);
                break;
            case "join":
                console.log("Joining Game");
                AddPlayerToGame(data.id, data.username);
                break;
            case "leave":
                console.log("Leaving Game");
                removePlayer(data.id, data.username);
                break;
            case "sit":
                console.log("Sitting at Game");
                sitPlayer(data.id, data.username, data.slot);
                break;
            case "unsit":
                console.log("Unsitting at Game");
                unSitPlayer(data.id, data.username);
                break;
            case "start":
                console.log("Starting Game");
                readyPlayer(data.id, data.username);
                break;
            case "place":
                place(data.id, data.username, data.x, data.y);
                break;
            case "pick":
                pickSymbol(data.id, data.symbol, data.username);
                break;
            case "updateSettings":
                if (games[data.id]["admin"] != data.username) {
                    console.log("Not an admin");
                    return;
                }
                updateSettings(data.id, data.tempo, data.fisher);
                break;
        }
    });

    ws.on('close', function () {
        console.log("Client Disconnected");
    });

});

wss.broadcast = function broadcast(msg) {
    wss.clients.forEach(function each(client) {
        client.send(msg);
    });
};


setInterval(() => {


    for (const [key, value] of Object.entries(games)) {
        if (value["playerTurn"] == 0) {
            continue;
        }

        games[key]["player" + value["playerTurn"] + "Time"] -= 1;

        if (games[key]["player" + value["playerTurn"] + "Time"] <= 0) {


            games[key] = {
                ...games[key],
                winner: invertPlayer(value["playerTurn"]),
                playerTurn: null,
                status: "waiting"
            }
            updateGame(key);


        }

    }

}, 1000);