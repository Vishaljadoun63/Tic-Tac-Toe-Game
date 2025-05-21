const board = document.getElementById("board");
const statusText = document.getElementById("gameStatus");
const restartBtn = document.getElementById("restart");
const scoreX = document.getElementById("scoreX");
const scoreO = document.getElementById("scoreO");
const clickSound = document.getElementById("clickSound");
const winSound = document.getElementById("winSound");
const toggleBtn = document.getElementById("toggleMode");
const difficultySelect = document.getElementById("difficulty");

let currentPlayer = "X";
let gameActive = true;
let boardState = Array(9).fill("");
let scores = { X: 0, O: 0 };
let vsAI = true;
let difficulty = "easy";

const winningCombos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

function initializeBoard() {
  board.innerHTML = "";
  boardState = Array(9).fill("");
  gameActive = true;
  currentPlayer = "X";
  statusText.textContent = `Player ${currentPlayer}'s Turn`;

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    cell.addEventListener("click", handleClick);
    board.appendChild(cell);
  }
}

function handleClick(e) {
  const index = e.target.dataset.index;
  if (!gameActive || boardState[index] !== "") return;

  playMove(index);

  if (vsAI && gameActive && currentPlayer === "O") {
    setTimeout(aiMove, 300);
  }
}

function playMove(index) {
  boardState[index] = currentPlayer;
  const cell = board.querySelector(`.cell[data-index="${index}"]`);
  cell.textContent = currentPlayer;
  clickSound.play();

  if (checkWinner()) return;

  if (!boardState.includes("")) {
    statusText.textContent = "😐 It's a Draw!";
    gameActive = false;
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusText.textContent = `Player ${currentPlayer}'s Turn`;
}

function checkWinner() {
  for (const combo of winningCombos) {
    const [a, b, c] = combo;
    if (boardState[a] && boardState[a] === boardState[b] && boardState[b] === boardState[c]) {
      document.querySelector(`.cell[data-index="${a}"]`).classList.add("win");
      document.querySelector(`.cell[data-index="${b}"]`).classList.add("win");
      document.querySelector(`.cell[data-index="${c}"]`).classList.add("win");

      statusText.textContent = `🎉 Player ${currentPlayer} Wins!`;
      winSound.play();
      scores[currentPlayer]++;
      updateScore();
      gameActive = false;
      return true;
    }
  }
  return false;
}

function updateScore() {
  scoreX.textContent = scores["X"];
  scoreO.textContent = scores["O"];
}

function aiMove() {
  if (difficulty === "easy") {
    const available = boardState
      .map((val, idx) => (val === "" ? idx : null))
      .filter((val) => val !== null);
    const randomMove = available[Math.floor(Math.random() * available.length)];
    playMove(randomMove);
  } else if (difficulty === "hard") {
    const bestMove = getBestMove();
    playMove(bestMove);
  }
}

function getBestMove() {
  let bestScore = -Infinity;
  let move;

  for (let i = 0; i < 9; i++) {
    if (boardState[i] === "") {
      boardState[i] = "O";
      let score = minimax(boardState, 0, false);
      boardState[i] = "";
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(state, depth, isMaximizing) {
  const winner = checkMinimaxWinner(state);
  if (winner === "X") return -10 + depth;
  if (winner === "O") return 10 - depth;
  if (!state.includes("")) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (state[i] === "") {
        state[i] = "O";
        best = Math.max(best, minimax(state, depth + 1, false));
        state[i] = "";
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (state[i] === "") {
        state[i] = "X";
        best = Math.min(best, minimax(state, depth + 1, true));
        state[i] = "";
      }
    }
    return best;
  }
}

function checkMinimaxWinner(state) {
  for (const [a, b, c] of winningCombos) {
    if (state[a] && state[a] === state[b] && state[b] === state[c]) {
      return state[a];
    }
  }
  return null;
}

toggleBtn.addEventListener("click", () => {
  vsAI = !vsAI;
  toggleBtn.textContent = vsAI ? "Mode: Player vs AI 🤖" : "Mode: Player vs Player 👥";
  initializeBoard();
});

difficultySelect.addEventListener("change", (e) => {
  difficulty = e.target.value;
});

restartBtn.addEventListener("click", initializeBoard);
initializeBoard();
