const numFont = new FontFace("VT323", `url(https://fonts.gstatic.com/s/vt323/v17/pxiKyp0ihIEF2isfFJU.woff2)`)
numFont.load()
    .then(font => {
        document.fonts.add(font);
    })
    .catch(err => console.error(err));

const c = document.getElementById("canvas");
const ctx = c.getContext("2d");

const gameWidth = 20;
const gameHeight = 15;
const squareSize = 27;
const bevelSize = 3;
const bgColor = "#bbbbbb";
const gridColor = "#888888";
const numColors = ["blue", "green", "red", "darkblue", "brown", "cyan", "black", "#404040"];
const canvasWidth = gameWidth * squareSize + 1;
const canvasHeight = gameHeight * squareSize + 1;

function arrayOf(length, gen) {
    return Array.from({length}, gen);
}

const mine = Symbol("mine");
const minecount = 30;
let remainingSafe = (gameWidth * gameHeight) - minecount;
const board = arrayOf(gameWidth, () => arrayOf(gameHeight, () => ({
    isVisible: false,
    isMine: false,
    hasFlag: false,
    adjMines: 0,
})))
let mines = 0;
while (mines < minecount) {
    const x = Math.floor(Math.random() * gameWidth);
    const y = Math.floor(Math.random() * gameHeight);

    if (!board[x][y].isMine) {
        board[x][y].isMine = true;
        mines++;
    }
}
function isMine(x, y) {
    return !(x < 0 || x >= gameWidth || y < 0 || y >= gameHeight) && board[x][y].isMine;
}
for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
        if (!board[i][j].isMine) {
            for (let [x, y] of [[i-1, j-1], [i-1, j], [i-1, j+1], [i, j-1], [i, j+1], [i+1, j-1], [i+1, j], [i+1, j+1]]) {
                board[i][j].adjMines += isMine(x, y);
            }
        }
    }
}

function drawWholeBoard() {
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, c.width, c.height);

    ctx.beginPath();
    for (let i = 0; i < gameWidth + 1; i++) {
        ctx.moveTo(i * squareSize, 0);
        ctx.lineTo(i * squareSize, c.height);
    }
    for (let j = 0; j < gameHeight + 1; j++) {
        ctx.moveTo(0, j * squareSize);
        ctx.lineTo(c.width, j * squareSize);
    }
    ctx.strokeStyle = gridColor;
    ctx.stroke();

    for (let x = 0; x < gameWidth; x++) {
        for (let y = 0; y < gameHeight; y++) {
            ctx.save();
            ctx.translate(squareSize * x + 1, squareSize * y + 1);

            if (board[x][y].isVisible) {
                if (board[x][y].adjMines > 0) {
                    ctx.font = "24px VT323";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillStyle = numColors[board[x][y].adjMines - 1];
                    ctx.fillText(board[x][y].adjMines + "", (squareSize - 1) / 2, (squareSize - 1) / 2);
                }
            }
            else {
                ctx.beginPath();
                ctx.moveTo(0, 0)
                ctx.lineTo(squareSize - 1, 0);
                ctx.lineTo(squareSize - 1 - bevelSize, bevelSize);
                ctx.lineTo(bevelSize, bevelSize);
                ctx.lineTo(bevelSize, squareSize - 1 - bevelSize);
                ctx.lineTo(0, squareSize - 1);
                ctx.closePath();
                ctx.fillStyle = "#d0d0d0";
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(squareSize - 1, 0);
                ctx.lineTo(squareSize - 1, squareSize - 1);
                ctx.lineTo(0, squareSize - 1);
                ctx.lineTo(bevelSize, squareSize - 1 - bevelSize);
                ctx.lineTo(squareSize - 1 - bevelSize, squareSize - 1 - bevelSize);
                ctx.lineTo(squareSize - 1 - bevelSize, bevelSize);
                ctx.closePath();
                ctx.fillStyle = "#777777";
                ctx.fill();

                ctx.fillStyle = "#a0a0a0";
                ctx.fillRect(bevelSize, bevelSize, squareSize - bevelSize * 2 - 1, squareSize - bevelSize * 2 - 1);

                if (board[x][y].hasFlag) {
                    ctx.translate(bevelSize, bevelSize);
                    ctx.beginPath();
                    // ctx.moveTo(4, 19);
                    // ctx.lineTo(16, 19);
                    ctx.ellipse(10, 19, 7, 4, 0, 0, Math.PI, true);
                    ctx.rect(9, 10, 2, 5);
                    ctx.fillStyle = "black";
                    ctx.fill();

                    ctx.beginPath();
                    ctx.moveTo(11, 1);
                    ctx.lineTo(3, 5.5);
                    ctx.lineTo(11, 10);
                    ctx.closePath();
                    ctx.fillStyle = "red";
                    ctx.fill();
                    // ctx.moveTo()
                }
            }

            ctx.restore();
        }
    }
}

let resizeListenerRemover;
function setCanvasSize() {
    if (resizeListenerRemover !== undefined) {
        resizeListenerRemover();
    }

    // c.width = ;
// c.height = gameHeight * squareSize + 1;

    c.width = canvasWidth * devicePixelRatio;
    c.height = canvasHeight * devicePixelRatio;

    c.style.width = canvasWidth + "px";
    c.style.height = canvasHeight + "px";

    ctx.scale(devicePixelRatio, devicePixelRatio);

    const media = matchMedia(`(resolution: ${devicePixelRatio}dppx)`);
    media.addEventListener("change", this.setCanvasSize);
    resizeListenerRemover = () => media.removeEventListener("change", this.setCanvasSize);

    drawWholeBoard();
}

setCanvasSize();

function getClickCord(event) {
    let x, y;
    if (event instanceof MouseEvent) {
        x = event.offsetX;
        y = event.offsetY;
    }
    else {
        if (event.changedTouches.length > 0) {
            return null;
        }
        const ePos = event.changedTouches[0];
        const cPos = c.getBoundingClientRect();
        x = ePos.clientX - cPos.x;
        y = ePos.clientY - cPos.y;
    }

    if (x % squareSize === 0 || y % squareSize === 0) {
        return null;
    }

    return [Math.floor(x / squareSize), Math.floor(y / squareSize)];
}

function digAt([x, y]) {
    if (board[x][y].isMine) {
        gameOver(x, y);
    }
    else if (!board[x][y].hasFlag) {
        recurseShow(x, y);
        drawWholeBoard();
        if (remainingSafe === 0) {
            gameWin();
        }
    }
}

function recurseShow(x, y) {
    if (x < 0 || x >= gameWidth || y < 0 || y >= gameHeight) {
        return;
    }
    if (!board[x][y].isVisible) {
        board[x][y].isVisible = true;
        remainingSafe--;
        if (board[x][y].adjMines === 0) {
            recurseShow(x - 1, y - 1);
            recurseShow(x - 1, y);
            recurseShow(x - 1, y + 1);
            recurseShow(x, y - 1);
            recurseShow(x, y + 1);
            recurseShow(x + 1, y - 1);
            recurseShow(x + 1, y);
            recurseShow(x + 1, y + 1);
        }
    }
}

function flagAt([x, y]) {
    if (!board[x][y].isVisible) {
        board[x][y].hasFlag ^= true;
        drawWholeBoard();
    }
}

function gameOver(x, y) {
    console.log("Game Over");
}

function gameWin() {
    console.log("Game win");
}

function clickHandler(event) {
    event.preventDefault();
    const cord = getClickCord(event);
    if (cord && !board[cord[0]][cord[1]].isVisible) {
        console.log(event.button);
        if (event.button === 0) {
            digAt(cord);
        }
        else if (event.button === 2) {
            flagAt(cord);
        }
    }
}

c.addEventListener("click", clickHandler);
c.addEventListener("contextmenu", clickHandler)