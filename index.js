const c = document.getElementById("canvas");
const ctx = c.getContext("2d");

const gameWidth = 20;
const gameHeight = 15;
const squareSize = 27;
const bevelSize = 3;
const bgColor = "#bbbbbb";
const gridColor = "#888888";
const numColors = ["blue", "green", "red", "darkblue", "brown", "cyan", "black", "#404040"];

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
const boardVisibility = Array.from({length: gameWidth}, () => Array(gameHeight).fill(false));

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

    for (let x = 0; x < gameWidth; x++) {
        for (let y = 0; y < gameHeight; y++) {
            ctx.save();
            ctx.translate(squareSize * x + 1, squareSize * y + 1);

            if (boardVisibility[x][y]) {
                console.log(board[x][y]);
                if (board[x][y] > 0) {
                    ctx.font = "20px Arial";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillStyle = numColors[board[x][y]];
                    ctx.fillText(board[x][y] + "", (squareSize - 1) / 2, (squareSize - 1) / 2);
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
            }

            ctx.restore();
        }
    }
}

drawFrame();

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
    if (board[x][y] === mine) {
        gameOver(x, y);
    }
    else {
        recurseShow(x, y);
        drawFrame();
    }
}

function recurseShow(x, y) {
    if (x < 0 || x >= gameWidth || y < 0 || y >= gameHeight) {
        return;
    }
    if (!boardVisibility[x][y]) {
        boardVisibility[x][y] = true;
        if (board[x][y] === 0) {
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

}

function gameOver(x, y) {
    console.log("Game Over");
}

c.addEventListener("click", event => {
    const cord = getClickCord(event);
    if (cord && !boardVisibility[cord[0]][cord[1]]) {
        if (event.button === 0) {
            digAt(cord);
        }
        else if (event.button === 2) {
            flagAt(cord);
        }
    }
});
c.addEventListener("contextmenu", event => {
    event.preventDefault();
})