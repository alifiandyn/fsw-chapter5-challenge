// Untuk kembali ke halaman utama
function backHome() {
  location.href = "/";
}

// Untuk pindah ke halaman game
function gamePage() {
  location.href = "/game";
}

function loginPage() {
  location.href = "/login?status=notlogin";
}

// Untuk merefresh halaman playGame.HTML
function refreshPage() {
  location.reload();
}

// Fungsi yang digunakan untuk komputer memilih pilihan
function computerChoice() {
  const comp = Math.random();
  if (comp < 0.34) {
    return "rock";
  } else if (comp >= 0.34 && comp < 0.67) {
    return "paper";
  } else {
    return "scissor";
  }
}

// Fungsi untuk mereset pilihan pertandingan sebelumnya
function choosedCheck() {
  const choosedCheck = document.querySelectorAll(".choosed");
  if (choosedCheck) {
    choosedCheck.forEach((item) => item.classList.remove("choosed"));
  }
}

// Kelas yang digunakan untuk pertandingan
class playGame {
  constructor(comp, player) {
    this.playerChoice = player;
    this.comChoice = comp;
  }

  // Fungsi untuk aturan pertandingan
  matchRules() {
    if (this.comChoice == this.playerChoice) {
      return "draw";
    } else if (this.comChoice == "rock") {
      if (this.playerChoice == "paper") {
        return "Player 1 <br> win";
      } else {
        return "com <br> win";
      }
    } else if (this.comChoice == "paper") {
      if (this.playerChoice == "scissor") {
        return "Player 1 <br> win";
      } else {
        return "com <br> win";
      }
    } else {
      if (this.playerChoice == "rock") {
        return "Player 1 <br> win";
      } else {
        return "com <br> win";
      }
    }
  }

  // Fungsi yang mengumumkan hasil dari pertandingan
  matchResult() {
    let matchResult = document.querySelector(".versus-text");
    matchResult.classList.remove("result-match", "win", "draw");
    matchResult.innerHTML = this.matchRules();
    if (this.matchRules() == "draw") {
      matchResult.classList.add("result-match", "draw");
    } else {
      matchResult.classList.add("result-match", "win");
    }
  }
}

// Untuk menjalankan pilihan pemain
const playerChoose = document.querySelectorAll(".player-choose");
const history = [];
playerChoose.forEach(function (result) {
  result.addEventListener("click", function () {
    choosedCheck();
    const comChoice = computerChoice();
    const playerChoice = result.alt;
    let comBackgroundAdd = document.querySelector(`.com-choose-${comChoice}`);
    comBackgroundAdd.classList.add("choosed");
    let playerBackgroundAdd = document.querySelector(`.player-choose-${playerChoice}`);
    playerBackgroundAdd.classList.add("choosed");
    const game = new playGame(comChoice, playerChoice);
    game.matchResult();
    history.push([playerChoice, comChoice, game.matchRules()]);
    console.log(history);
  });
});
