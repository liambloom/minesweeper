const c = document.getElementById("canvas");
const ctx = c.getContext("2d");

const gameWidth = 20;
const gameHeight = 15;
const squareSize = 27;
const bgColor = "#bbbbbb";
const gridColor = "#888888";

const mine = Symbol("mine");
const minecount = 30;
const board = Array.from({length: gameWidth}, () => Array(gameHeight).fill(undefined));
let mines = 0;
while (mines < minecount) {
    const x = Math.floor(Math.random() * gameWidth);
    const y = Math.floor(Math.random() * gameHeight);

    if (!board[x][y]) {
        board[x][y] = mine;
        mines++;
    }
}
function isMine(x, y) {
    if (x < 0 || x >= gameWidth || y < 0 || y >= gameHeight) {
        return false;
    }
    else if (board[x][y] === mine) {
        return true;
    }
    else {
        return false;
    }
}
for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
        if (board[i][j] === mine) {
            continue;
        }
        let adj = 0;
        for (let [x, y] of [[i-1, j-1], [i-1, j], [i-1, j+1], [i, j-1], [i, j+1], [i+1, j-1], [i+1, j], [i+1, j+1]]) {
            adj += isMine(x, y);
        }
        board[i][j] = adj;
    }
}

c.width = gameWidth * squareSize + 1;
c.height = gameHeight * squareSize + 1;

function drawFrame() {
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
}

drawFrame();