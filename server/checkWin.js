function checkWin(board) {
    let win = "";

    let xCount = 0;
    let oCount = 0;
    // check rows
    for (let x = 0; x < 14; x++) {
        for (let y = 0; y < 14; y++) {
            if (board[x][y] == "x") {
                xCount++;
            } else {
                if (xCount == 5) {
                    win = "x";
                }
                xCount = 0;
            }
            if (board[x][y] == "o") {
                oCount++;
            } else {
                if (oCount == 5) {
                    win = "o";
                }
                oCount = 0;
            }
        }
        xCount = 0;
        oCount = 0;
    }

    // check columns

    xCount = 0;
    oCount = 0;

    for (let y = 0; y < 14; y++) {
        for (let x = 0; x < 14; x++) {
            if (board[x][y] == "x") {
                xCount++;
            } else {
                if (xCount == 5) {
                    win = "x";
                }
                xCount = 0;
            }
            if (board[x][y] == "o") {
                oCount++;
            } else {
                if (oCount == 5) {
                    win = "o";
                }
                oCount = 0;
            }
        }
        xCount = 0;
        oCount = 0;
    }

    // check diagonal 1

    for (let x = -14; x < 14; x++) {
        for (let y = 0; y < 14; y++) {
            if (!board[x + y]) {

                if (xCount == 5) {
                    win = "x";
                }

                if (oCount == 5) {
                    win = "o";
                }

                continue;

            }

            if (!board[x + y][y]) {

                if (xCount == 5) {
                    win = "x";
                }

                if (oCount == 5) {
                    win = "o";
                }

                continue;
            }

            let symbol = board[x + y][y] || "";
            //console.log(symbol);
            symbol ??= "";
            if (symbol == "x") {
                xCount++;
            } else {
                if (xCount == 5) {
                    win = "x";
                }
                xCount = 0;
            }
            if (symbol == "o") {
                oCount++;
            } else {
                if (oCount == 5) {
                    win = "o";
                }
                oCount = 0;
            }
        }
        //console.log("new line")
        xCount = 0;
        oCount = 0;
    }

    // check diagonal 2

    for (let x = 29; x > 0; x--) {
        for (let y = 0; y < 14; y++) {
            if (!board[x - y]) {

                if (xCount == 5) {
                    win = "x";
                }

                if (oCount == 5) {
                    win = "o";
                }

                continue;

            }

            if (!board[x - y][y]) {

                if (xCount == 5) {
                    win = "x";
                }

                if (oCount == 5) {
                    win = "o";
                }

                continue;
            }

            let symbol = board[x - y][y] || "";
            //console.log(symbol);
            symbol ??= "";
            if (symbol == "x") {
                xCount++;
            } else {
                if (xCount == 5) {
                    win = "x";
                }
                xCount = 0;
            }
            if (symbol == "o") {
                oCount++;
            } else {
                if (oCount == 5) {
                    win = "o";
                }
                oCount = 0;
            }
        }
        //console.log("new line")
        xCount = 0;
        oCount = 0;
    }

    return win;

}

module.exports = { checkWin };