"use client";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useCallback, useRef } from "react"
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
  Star, Check, Settings, X
} from "lucide-react"

import { setCookie, getCookie } from "@/lib/cookie";
import { time } from "console";
import { start } from "repl";
import { Separator } from "@radix-ui/react-context-menu";
import { off } from "process";


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
            <Table>
                <TableCaption>Click a game to join!</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[200px]"></TableHead>
                        <TableHead></TableHead>
                        <TableHead></TableHead>
                        <TableHead className="text-right">
                            <CreateButton />
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {games.map((game) => (
                        <TableRow key={game.id} onClick={() => { JoinGame(game.id) }}>
                            <TableCell className="font-medium">{game.id}</TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell className="text-right">
                                <Button

                                    size="sm"
                                    className="w-full justify-start"
                                >
                                    Join
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

        </>
    );
}

function Cross() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="symbolSvg" viewBox="0 0 80 80">
                    <path
                        d="M 0 10 L 10 0 L 40 30 L 70 0 L 80 10 L 50 40 M 50 40 L 80 70 L 70 80 L 40 50 L 10 80 L 0 70 L 30 40 L 0 10"
                        fill="#e11734" />
                </svg>
    )
}

function Circle() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="symbolSvg">
                    <circle cx="50" cy="50" r="40" stroke="#0058d4" stroke-width="15" fill="none" />
                </svg>
    )
}

function Symbol({ name, className }) {
    if (name == "x") {
        return (
            <div className={"symbol float-left block border-2 p-1 " + className}>
                {/*<X className="symbolSvg"/>*/}
                <Cross />
            </div>
        )
    } else if (name == "o") {
        return (
            <div className={"symbol float-left block border-2 p-1 " + className}>
                {/*<Circle className="symbolSvg" />*/}
                <Circle />
            </div>
        )
    } else {
        return (
            <div className={"symbol float-left block border-2 " + className}>

            </div>
        )
    }
}

function Board({ board, gameId, lastMove }) {

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
                        <div onClick={() => { play(rowPos, cellPos) }} className={highlightClass(lastMove, rowPos, cellPos)}>
                            <Symbol name={cell} className={highlightClass(lastMove, rowPos, cellPos)} />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}

function highlightClass(lastMove, x, y) {

    if (lastMove == null) {
        return "";
    }

    if (lastMove[0] == x && lastMove[1] == y) {
        return "bg-accent";
    } else {
        return "";
    }

}

function Timer({ time, isOn, tempo }) {

    if (time == null) {
        time = tempo;
    }

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

function Player({ name, pfp, gameId, slot, isDisabled, symbol }) {

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
                <Button onClick={JoinGame} disabled={isDisabled}>Join</Button>

            </>
        )
    }

    let short = name.substring(0, 2).toUpperCase();

    let symbolText = (<></>);

    if (symbol == "x") {
        symbolText = (<Cross />);
    } else if (symbol == "o") {
        symbolText = (<Circle />);
    }

    return (

        <>

            <Avatar className="float-left">
                <AvatarImage src={pfp} />
                <AvatarFallback>{short}</AvatarFallback>
            </Avatar>
            <Label className="float-left">{name}</Label>

            <div className="w-10 h-10 float-left py-2">
            {symbolText}
            </div>
            <LeaveButton gameId={gameId} show={name == username} />

        </>

    )
}

function LeaveButton({ gameId, show }) {

    function leave() {
        socket.send(JSON.stringify({
            type: "unsit", data: {
                "id": gameId + "",
                "username": username
            }
        }));
    }

    if (!show) {
        return (<></>);
    } else {
        return (

            <Button onClick={leave} variant="secondary" className="float-right ">Leave</Button>

        )
    }
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
            size="sm"
            className="w-full justify-start"
            onClick={start}
        >
            Ready Up!
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
                            <Symbol name="x" className="" />
                        </div>
                    </div>
                    <div className="col-span-1"></div>
                    <div className="col-start-5 col-end-5" onClick={() => { PickSymbol("o") }}>
                        <Symbol name="o" className="" />
                    </div>

                </div>

            </CardContent>
        </Card>
    )
}

function ReadyMarker({ isPlayer, gameId, show, isReady }) {

    if (!show) {
        return (
            <></>
        )
    }

    if (isPlayer) {

        if (isReady) {
            return (
                <div className="text-lime-400">
                    <Check className="text-lime-400 float-left" /> You are ready
                </div>
            )
        } else {
            return (
                <StartButton gameId={gameId} />
            )
        }

    } else {
        if (isReady) {
            return (
                <div className="text-lime-400">
                    <Check className="text-lime-400 float-left" /> Player is ready
                </div>
            )
        } else {
            return (
                <div className="text-rose-700">
                    <X className="text-rose-700 float-left" /> Player is not ready
                </div>
            )
        }
    }
}

function gameWaiting(status) {
    if (status == "waiting" || status == "start1" || status == "start2") {
        return true;
    } else {
        return false;
    }
}

function GameSettings({ gameState }) {



    const tempoMinRef = useRef<HTMLInputElement>(null);
    const tempoSecRef = useRef<HTMLInputElement>(null);
    const fisherRef = useRef<HTMLInputElement>(null);

    function save() {

        if (tempoMinRef.current == null
            || tempoSecRef.current == null
            || fisherRef.current == null
        ) {
            return;
        }

        let tempoMin = parseInt(tempoMinRef.current.value) || 10;
        let tempoSec = parseInt(tempoSecRef.current.value) || 0;
        let tempo = tempoMin * 60 + tempoSec;
        let fisher = parseInt(fisherRef.current.value) || 0;
        let id = gameState["id"];

        socket.send(JSON.stringify({
            type: "updateSettings", data: {
                "id": id + "",
                "username": username,
                "tempo": tempo,
                "fisher": fisher
            }
        }));

    }
    let buttonText = "Save";
    let buttonDisabled = false;

    if (gameState["admin"] != username) {
        buttonText = "Only the admin can change settings";
        buttonDisabled = true;
    }

    useEffect(() => {
        tempoMinRef.current!.value = Math.floor(gameState["tempo"] / 60) + "";
        tempoSecRef.current!.value = (gameState["tempo"] % 60) + "";
        fisherRef.current!.value = gameState["fisher"] + "";
    }, [gameState["tempo"], gameState["fisher"]]);

    return (
        <div>
            <Label>Tempo</Label> <br></br>
            <Input
                type="number"
                placeholder="mm"
                className="w-20 float-left"

                ref={tempoMinRef}
                disabled={buttonDisabled}
            />
            <Input
                type="number"
                placeholder="ss"
                className="w-20"

                ref={tempoSecRef}
                disabled={buttonDisabled}
            />

            <Label>Fisher</Label> <br></br>
            <Input
                type="number"
                placeholder="ss"
                className="w-20"

                ref={fisherRef}
                disabled={buttonDisabled}
            />

            <Button disabled={buttonDisabled} onClick={save}>
                {buttonText}
            </Button>

        </div>
    )
}

function PlayerList({ gameState }) {
    let spectators = gameState["spectators"];
    const list = spectators.map((spectator) => <PlayerListItem
        player={spectator}
        isAdmin={gameState["admin"] == spectator

        } />);
    return (
        <ul>
            {list}
        </ul>
    )
}

function PlayerListItem({ player, isAdmin }) {

    let title = isAdmin ? "Table Owner" : "Player";

    return (<li

        className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
    >
        <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
        <div className="space-y-1">
            <p className="text-sm font-medium leading-none">
                {player}
            </p>
            <p className="text-sm text-muted-foreground">
                {title}
            </p>
        </div>
    </li>)
}

function LeaveGameButton({ gameId }) {
    function leave() {
        console.log("Leave Game" + gameId);
        socket.send(JSON.stringify({
            type: "leave", data: {
                "id": gameId + "",
                "username": username
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
            size="sm"
            className="w-full justify-start"
            onClick={leave}
        >
            Leave Game
        </Button>
    )
}

function History({ history, startingPlayer, p1, p2 }) {
    return (
        <>
            <Table>
                <TableCaption>Click a turn to time travel.</TableCaption>
                <TableHeader>
                    <TableHead></TableHead>
                    <TableHead></TableHead>
                    <TableHead></TableHead>
                </TableHeader>
                <TableBody>

                    <HistorySwap
                        swapHistory={history["swap"]}
                        startingPlayer={startingPlayer}
                    />
                    <HistorySwapTwo
                        swapHistory={history["swap2"]}
                        startingPlayer={startingPlayer}
                    />
                    <HistorySeparator
                        value={history["choose"]}
                        startingPlayer={startingPlayer}
                        swap2History={history["swap2"]}
                    />
                    <HistoryTurn
                        startingPlayer={startingPlayer}
                        swap2History={history["swap2"]}
                        history={history["moves"]}
                        choose={history["choose"]}
                    />

                </TableBody>
            </Table>
        </>
    )
}

function HistorySwap({ swapHistory, startingPlayer, }) {
    let history = "";
    if (startingPlayer == 1) {

        history = swapHistory.map((symbol, index) => (

            <TableRow key={index + 1}>
                <TableCell>{index + 1}.</TableCell>
                <TableCell><HistoryCell value={symbol} show={true} /></TableCell>
                <TableCell></TableCell>
            </TableRow>

        ))


    } else {
        history = swapHistory.map((symbol, index) => (

            <TableRow key={index + 1}>
                <TableCell>{index + 1}.</TableCell>
                <TableCell></TableCell>
                <TableCell><HistoryCell value={symbol} show={true} /></TableCell>
            </TableRow>

        ))


    }
    console.log("History Swap");
    console.log(history);
    return (
        <>

            {history}
        </>
    )
}

function HistorySwapTwo({ swapHistory, startingPlayer, }) {
    let history = "";
    if (startingPlayer == 2) {

        history = swapHistory.map((symbol, index) => (

            <TableRow key={index + 4}>
                <TableCell>{index + 4}.</TableCell>
                <TableCell><HistoryCell value={symbol} show={true} /></TableCell>
                <TableCell></TableCell>
            </TableRow>

        ))


    } else {
        history = swapHistory.map((symbol, index) => (

            <TableRow key={index + 4}>
                <TableCell>{index + 4}.</TableCell>
                <TableCell></TableCell>
                <TableCell><HistoryCell value={symbol} show={true} /></TableCell>
            </TableRow>

        ))


    }
    console.log("History Swap");
    console.log(history);
    return (
        <>

            {history}
        </>
    )
}

function HistorySeparator({ value, startingPlayer, swap2History }) {

    if (value == null) {
        return (<> </>)
    }
    let pos = 0;

    if (startingPlayer == 1) {

        if (swap2History.length == 0) {
            pos = 2;
        } else {
            pos = 1;
        }

    } else {

        if (swap2History.length == 0) {
            pos = 1;
        } else {
            pos = 2;
        }

    }

    if (pos == 1) {
        return (
            <TableRow key="choose">
                <TableCell>
                    Pick
                </TableCell>
                <TableCell>
                    {value}
                </TableCell>

            </TableRow>
        )
    } else {
        return (
            <TableRow key="choose">
                <TableCell>
                    Pick
                </TableCell>
                <TableCell>

                </TableCell>

                <TableCell>
                    {value}
                </TableCell>

            </TableRow>
        )
    }
}

function InvertPlayer(player) {
    if (player == 1) {
        return 2;
    } else {
        return 1;
    }
}

function HistoryTurn({ history, startingPlayer, swap2History, choose }) {
    let newHistory: Array<Array<string>> = [];

    let firstTurn = startingPlayer;
    let offset = 4;

    if (swap2History.length == 0) {
        offset = 6;
        firstTurn = InvertPlayer(firstTurn);
    }

    if (choose == "x") {
        firstTurn = InvertPlayer(firstTurn);
    }

    for (let i = 0; i < Math.ceil(history.length / 2); i++) {

        history[i * 2 + 1] ??= "";


        let curTurn = ["", ""];
        if (firstTurn == 1) {
            curTurn = [history[i * 2], history[i * 2 + 1]];
        } else {
            curTurn = [history[i * 2 + 1], history[i * 2]];
        }
        newHistory.push(curTurn);

    }

    return (<>
        {newHistory.map((symbol, index) => (
            <TableRow key={index + offset}>
                <TableCell>{index + offset}.</TableCell>
                <TableCell><HistoryCell value={symbol[0]} show={true} /></TableCell>

                <TableCell><HistoryCell value={symbol[1]} show={true} /></TableCell>

            </TableRow>
        ))}
    </>)
}

function HistoryCell({ value, show }) {



    if (!show || value == null) {
        return (<></>)
    }

    let letter = String.fromCharCode(value[0] + 96);
    let text = letter + value[1];

    if (value == "") {
        text = "";
    }

    return (
        <>
            <Label>{text}</Label>
        </>
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
        "id": null,
        "tempo": 0,

    });
    const [timer, setTimer] = useState(setInterval(countdown, 1000000000));
    const [games, setGames] = useState<Object[]>([]);

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

                setGames([...curGames]);
                console.log("games is:");
                console.log(games);
            } else if (data.type == "gameCreated") {
                let newGames = games;
                console.log("gamecreated");
                console.log("newGames is:");
                console.log(newGames);

                //setGameState("gameCreated" + newGames.length); //TODO: nějak fixnout, protože toto vykopává z her
                newGames.push(data.game);

                setGames([...newGames]);
                console.log("new games is:");
                console.log(games);

            } else if (data.type == "gameUpdated") {
                setGameState(data.data);
            } else if (data.type == "gameLeft") {
                setGameState({
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
                    "id": null,
                    "tempo": 0,

                });
            }

        }
        , []
    )




    useEffect(() => {
        console.log("gameState changed");

        if (timer != null) {
            clearInterval(timer);
        }

        setTimer(setInterval(function () {
            console.log("counting down");
            //console.log(gameState);
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
                                <Player
                                    name={gameState["player1"]}
                                    gameId={gameState["id"]}
                                    slot={1}
                                    pfp="https://github.com/molenusaczech.png"
                                    isDisabled={gameState["player2"] == username}
                                    symbol={gameState["player1Symbol"]}
                                />
                            </div>

                            <div className="col-start-2 p-4">

                                <ReadyMarker
                                    isPlayer={gameState["player1"] == username}
                                    isReady={gameState["status"] == "start1"}
                                    gameId={gameState["id"]}
                                    show={gameState["player1"] != null && gameState["player2"] != null && gameWaiting(gameState["status"])}
                                />

                            </div>

                            <div className="col-start-3">
                                <Timer
                                    time={gameState["player1Time"]}
                                    isOn={gameState["playerTurn"] == 1}
                                    tempo={gameState["tempo"]} />
                            </div>
                        </div>

                        <div className="col-span-1">
                            <SymbolSelect
                                gameId={gameState["id"]}
                                show={showChoose} />
                            <Board board={gameState["board"]} gameId={gameState["id"]} lastMove={gameState["lastTurn"]} />


                        </div>

                        <div className="grid grid-cols-3">
                            <div className="col-span-1">
                                <Player
                                    name={gameState["player2"]}
                                    gameId={gameState["id"]}
                                    slot={2}
                                    pfp="https://github.com/shadcn.png"
                                    isDisabled={gameState["player1"] == username} 
                                    symbol={gameState["player2Symbol"]}
                                />
                            </div>

                            <div className="col-start-2 p-4">

                                <ReadyMarker
                                    isPlayer={gameState["player2"] == username}
                                    isReady={gameState["status"] == "start2"}
                                    gameId={gameState["id"]}
                                    show={gameState["player1"] != null && gameState["player2"] != null && gameWaiting(gameState["status"])}
                                />

                            </div>

                            <div className="col-start-3">
                                <Timer
                                    time={gameState["player2Time"]}
                                    isOn={gameState["playerTurn"] == 2}
                                    tempo={gameState["tempo"]} />
                            </div>
                            <div>

                                <div onClick={countdown}>{showChoose + ""}</div>
                                {JSON.stringify(gameState)}
                            </div>
                        </div>

                    </div>

                    <div className="col-span-2">




                        <Tabs defaultValue="games" className="w-[100%]">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="games">Games</TabsTrigger>
                                <TabsTrigger value="history" disabled={gameState["id"] == null}>History</TabsTrigger>
                                <TabsTrigger value="settings" disabled={gameState["id"] == null}>Settings</TabsTrigger>
                                <TabsTrigger value="players" disabled={gameState["id"] == null}>Players</TabsTrigger>
                            </TabsList>
                            <TabsContent value="history">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>History</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <History
                                            history={gameState["history"]}
                                            startingPlayer={gameState["startingPlayer"]}
                                            p1={gameState["player1"]}
                                            p2={gameState["player2"]}
                                        />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="games">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Games</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Games games={games} />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="settings">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Settings</CardTitle>
                                    </CardHeader>
                                    <CardContent>

                                        <LeaveGameButton gameId={gameState["id"]} />
                                        <GameSettings gameState={gameState} />

                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="players">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Players</CardTitle>
                                    </CardHeader>
                                    <CardContent>

                                        <PlayerList gameState={gameState} />

                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>

                    </div>

                </div>
            </div>
            {JSON.stringify(games)}
        </>
    )

}