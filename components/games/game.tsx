"use client";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useCallback } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    X, Circle, Star
} from "lucide-react"

import { setCookie, getCookie } from "@/lib/cookie";
import { time } from "console";


if (getCookie("username") == "") {
    setCookie("username", "guest_" + Math.floor(Math.random() * 100000), 100);
}

const username = getCookie("username");

const socket = new WebSocket("ws://10.0.1.19:8080");

socket.addEventListener("open", (event) => {
    let data = {
        "type": "auth",
        "data": {
            "username": username,
        }
    };
    socket.send(JSON.stringify(data));
});

function CreateButton() {

    function create() {
        socket.send(JSON.stringify({
            type: "create", data: {
                username: username
            }
        }));
    }

    return (
        <Button
            variant="secondary"
            size="sm"
            className="w-full justify-start"
            onClick={create}
        >
            Create Game
        </Button>
    )

}


function Games({ games }) {

    function JoinGame(id: string) {
        console.log("Joining game " + id);
        socket.send(JSON.stringify({
            type: "join", data: {
                id: id,
                username: username
            }
        }));
    }


    return (
        <>
            {/*games.map(name => (
                    <tr key={name.id}>
                        <td>
                            {name.id}
                        </td>
                        <td>
                            <Button
                                variant="secondary"
                                size="sm"
                                className="w-full justify-start"
                                onClick={() => JoinGame(name.id)}>
                                Join
                            </Button>
                        </td>
                    </tr>
                ))*/ }

            <Table>
                <TableCaption>Click a game to join!</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[200px]">Game ID</TableHead>
                        <TableHead>Tempo</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead className="text-right">Join</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {games.map((game) => (
                        <TableRow key={game.id} onClick={() => { JoinGame(game.id) }}>
                            <TableCell className="font-medium">{game.id}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

        </>
    );
}

function Symbol({ name }) {
    if (name == "x") {
        return (
            <div className="symbol float-left block border-2 p-1">
                {/*<X className="symbolSvg"/>*/}
                <svg xmlns="http://www.w3.org/2000/svg" className="symbolSvg" viewBox="0 0 80 80">
                    <path
                        d="M 0 10 L 10 0 L 40 30 L 70 0 L 80 10 L 50 40 M 50 40 L 80 70 L 70 80 L 40 50 L 10 80 L 0 70 L 30 40 L 0 10"
                        fill="#e11734" />
                </svg>
            </div>
        )
    } else if (name == "o") {
        return (
            <div className="symbol float-left block border-2 p-1">
                {/*<Circle className="symbolSvg" />*/}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="symbolSvg">
                    <circle cx="50" cy="50" r="40" stroke="#0058d4" stroke-width="15" fill="none" />
                </svg>
            </div>
        )
    } else {
        return (
            <div className="symbol float-left block border-2">

            </div>
        )
    }
}

function Board({ board, gameId }) {

    function play(x, y) {
        console.log("Playing " + x + " " + y + " in game " + gameId);
        socket.send(JSON.stringify({
            type: "place", data: {
                "id": gameId + "",
                "x": x,
                "y": y,
                "username": username
            }
        }));
    }

    board ??= [["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
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
    ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]
    ];

    return (
        <div className="grid grid-rows-15">
            {board.map((row, rowPos) => (
                <div key={Math.random()}>
                    {row.map((cell, cellPos) => (
                        <div onClick={() => { play(rowPos, cellPos) }}>
                            <Symbol name={cell} />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}

function Timer({ time, isOn }) {


    let minutes = Math.floor(time / 60);
    let seconds = time % 60;

    let minutesText = minutes.toString();
    if (minutes < 10) {
        minutesText = "0" + minutes;
    }

    let secondsText = seconds.toString();
    if (seconds < 10) {
        secondsText = "0" + seconds;
    }

    let timeClass = "";

    if (isOn) {
        timeClass = "bg-primary text-primary-foreground";
    }

    return (
        <Card className={timeClass}>
            <CardHeader>
                <CardTitle>{minutesText}:{secondsText}</CardTitle>
            </CardHeader>
        </Card>
    )
}

function Player({ name, pfp, gameId, slot }) {

    if (gameId == null) {
        return (<></>);
    }

    function JoinGame() {
        socket.send(JSON.stringify({
            type: "sit", data: {
                "id": gameId + "",
                "slot": slot,
                "username": username
            }
        }));
    }

    if (name == null) {
        return (
            <>
                <Button onClick={JoinGame}>Join</Button>

            </>
        )
    }

    let short = name.substring(0, 2).toUpperCase();

    return (

        <>

            <Avatar className="float-left">
                <AvatarImage src={pfp} />
                <AvatarFallback>{short}</AvatarFallback>
            </Avatar>
            <Label>{name}</Label>

        </>

    )
}

function StartButton({ gameId }) {

    function start() {
        socket.send(JSON.stringify({
            type: "start", data: {
                "id": gameId,
                username: username
            }
        }));
    }

    if (gameId == null) {
        return (
            <></>
        )
    }

    return (
        <Button
            variant="secondary"
            size="sm"
            className="w-full justify-start"
            onClick={start}
        >
            Start
        </Button>
    )

}

function SymbolSelect({ gameId, show }) {

    function PickSymbol(symbol) {
        console.log("picking " + symbol);
        socket.send(JSON.stringify({
            type: "pick", data: {
                "id": gameId + "",
                "symbol": symbol,
                "username": username
            }
        }));
    }

    if (!show) {
        return (
            <></>
        )
    }

    return (
        <Card className="w-60 h-30 float-right">
            <CardHeader>
                <CardTitle>Choose your symbol</CardTitle>
                <CardDescription>Or place 2 additional symbols</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-6">
                    <div className="col-start-2 col-end-2">
                        <div className="justify-center items-center" onClick={() => { PickSymbol("x") }}>
                            <Symbol name="x" />
                        </div>
                    </div>
                    <div className="col-span-1"></div>
                    <div className="col-start-5 col-end-5" onClick={() => { PickSymbol("o") }}>
                        <Symbol name="o" />
                    </div>

                </div>

            </CardContent>
        </Card>
    )
}

export function Game() {
    "use client";
    const [gameState, setGameState] = useState<Object>({
        "player1": "Loading...",
        "player2": "Loading...",
        "playerTurn": 0,
        "board": [["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
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
        ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]
        ],
        "player1Time": 0,
        "player2Time": 0,
        "startingPlayer": 0,
        "status": "Loading",
        "id": null

    });

    function countdown() {
        console.log("counting down");
        console.log(gameState);
        let curGameState = gameState;

        if (curGameState["playerTurn"] == 1) {
            console.log("counting down player 1")
            setGameState({
                ...curGameState,
                player1Time: curGameState["player1Time"] - 1
            });
        } else if (curGameState["playerTurn"] == 2) {
            console.log("counting down player 2")
            setGameState({
                ...curGameState,
                player2Time: curGameState["player2Time"] - 1
            });
        }
    }

    const [games, setGames] = useState<Object[]>([]);

    const handleGames = useCallback(
        (rawData) => {
            console.log("hghg");

            let data = JSON.parse(rawData.data);
            console.log(data.type);

            if (data.type == "auth") {
                console.log(data.data);
                console.log("authed");

                let curGames = games;

                if (data.data.games == null) {
                    console.log("data.data.games is null");
                    return;
                }
                for (const [key, value] of Object.entries(data.data.games)) {
                    if (value != null && value != undefined) {
                        curGames.push(value);
                    }
                }

                console.log("games is:");
                console.log(curGames);

                if (curGames.length == null) {
                    console.log("curGames is empty");
                    return;
                }

                setGames(curGames);
                console.log("games is:");
                console.log(games);
            } else if (data.type == "gameCreated") {
                let newGames = games;
                console.log("gamecreated");
                console.log("newGames is:");
                console.log(newGames);

                setGameState("gameCreated" + newGames.length);
                newGames.push(data.game);

                setGames(newGames);

            } else if (data.type == "gameUpdated") {
                setGameState(data.data);
            }

        }
        , []
    )


    const [timer, setTimer] = useState(setInterval(countdown, 1000000000));

    useEffect(() => {
        console.log("gameState changed");

        if (timer != null) {
            clearInterval(timer);
        }

        setTimer(setInterval(function () {
            console.log("counting down");
            console.log(gameState);
            let curGameState = gameState;

            if (curGameState["playerTurn"] == 1) {
                console.log("counting down player 1")
                setGameState({
                    ...curGameState,
                    player1Time: curGameState["player1Time"] - 1
                });
            } else if (curGameState["playerTurn"] == 2) {
                console.log("counting down player 2")
                setGameState({
                    ...curGameState,
                    player2Time: curGameState["player2Time"] - 1
                });
            }
        }, 1000));

    }, [gameState]);


    useEffect(() => {

        //setGames([]);
        console.log("using effect");

        socket.addEventListener("message", handleGames);


    }, []);


    let player = 0;
    let showChoose = false;

    if (gameState["player1"] == username) {
        player = 1;
    } else if (gameState["player2"] == username) {
        player = 2;
    }

    if (player != 0) {
        if (gameState["status"] == "swap4") {
            if (gameState["startingPlayer"] != player) {
                showChoose = true;
            }

        } else if (gameState["status"] == "choose") {
            if (gameState["playerTurn"] == player) {
                showChoose = true;
            }
        }
    }


    return (
        <>
            <div className="mainGame">
                <div className="grid grid-cols-5">

                    <div className="col-span-3">
                        <div className="grid grid-cols-3">
                            <div className="col-span-1">
                                <Player name={gameState["player1"]} gameId={gameState["id"]} slot={1} pfp="https://github.com/molenusaczech.png" />
                            </div>

                            <div className="col-start-3">
                                <Timer time={gameState["player1Time"]} isOn={gameState["playerTurn"] == 1} />
                            </div>
                        </div>

                        <div className="col-span-1">
                            <SymbolSelect
                                gameId={gameState["id"]}
                                show={showChoose} />
                            <Board board={gameState["board"]} gameId={gameState["id"]} />


                        </div>

                        <div className="grid grid-cols-3">
                            <div className="col-span-1">
                                <Player name={gameState["player2"]} gameId={gameState["id"]} slot={2} pfp="https://github.com/shadcn.png" />
                            </div>

                            <div className="col-start-3">
                                <Timer time={gameState["player2Time"]} isOn={gameState["playerTurn"] == 2} />
                            </div>
                            <div>
                                <StartButton gameId={gameState["id"]} />
                                <div onClick={countdown}>{showChoose + ""}</div>
                                {JSON.stringify(gameState)}
                            </div>
                        </div>

                    </div>

                    <div className="col-span-2">
                        <CreateButton />

                        <Games games={games} />

                        <Tabs defaultValue="history" className="w-[400px]">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="history">History</TabsTrigger>
                                <TabsTrigger value="games">Games</TabsTrigger>
                            </TabsList>
                            <TabsContent value="history">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>History</CardTitle>
                                    </CardHeader>
                                </Card>
                            </TabsContent>
                            <TabsContent value="games">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Games</CardTitle>
                                    </CardHeader>
                                </Card>
                            </TabsContent>
                        </Tabs>

                    </div>

                </div>
            </div>
        </>
    )

}