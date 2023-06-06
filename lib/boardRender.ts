function switchSymbol(symbol) {
    if (symbol === "x") {
        return "o";
    }
    else {
        return "x";
    }
}

export function historyToBoard(history, index) {
    let board = [
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
        ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]
    ];
    let symbol = "x";

    let offset = 1;

    if (history["swap2"].length > 0) {
        offset = 2;
    }

    if (index > 0) {
        history["swap"].forEach((swap) => {
            board[swap[0]][swap[1]] = symbol;
            symbol = switchSymbol(symbol);
        });
    }

    if (index > 1) {
        history["swap2"].forEach((swap) => {
            board[swap[0]][swap[1]] = symbol;
            symbol = switchSymbol(symbol);
        });
    }

    if (index > offset) {
        symbol = "o";
        history["moves"].forEach((move, loopIndex) => {
            if (index > loopIndex + offset) {
                board[move[0]][move[1]] = symbol;
                symbol = switchSymbol(symbol);
            }

        });
    }


    return board;

}