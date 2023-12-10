const cardStack = [];
const dealerCards = [];
const playerCards = [];
const player2Cards = [];

GenerateDeck();
SchuffleDeck();
DealCards();

fetch("/game-data")
  .then((response) => response.json())
  .then((data) => {
    gamesWon.innerHTML = data.gamesWon;
    gamesLost.innerHTML = data.gamesLost;
  })
  .catch((error) => console.error(error));

function GenerateDeck() {
  const types = ["hearts", "diamonds", "clubs", "spades"];
  const values = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
    "A",
  ];

  for (let i = 0; i < types.length; i++) {
    for (let j = 0; j < values.length; j++) {
      const card = {
        type: types[i],
        value: values[j],
      };
      cardStack.push(card);
    }
  }
}

function SchuffleDeck() {
  //ChatGPT -> Fisher-Yates algorithm
  for (let i = cardStack.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cardStack[i], cardStack[j]] = [cardStack[j], cardStack[i]];
  }
}

function DealCards() {
  for (let i = 0; i < 2; i++) {
    playerCards.push(cardStack.pop());
    player2Cards.push(cardStack.pop());
    dealerCards.push(cardStack.pop());
  }
}

const dealerText = document.getElementById("dealerText");
dealerText.innerHTML = "Cards:<br>";
const p1Text = document.getElementById("p1Text");
p1Text.innerHTML = "Cards:<br>";
const p2Text = document.getElementById("p2Text");
p2Text.innerHTML = "Cards:<br>";
UpdateCards();

function UpdateCards() {
  dealerText.innerHTML = "";
  p1Text.innerHTML = "";
  p2Text.innerHTML = "";
  for (let i = 0; i < dealerCards.length; i++) {
    dealerText.innerHTML += `${dealerCards[i].value} of ${dealerCards[i].type}<br>`;
  }
  for (let i = 0; i < playerCards.length; i++) {
    p1Text.innerHTML += `${playerCards[i].value} of ${playerCards[i].type}<br>`;
  }
  for (let i = 0; i < player2Cards.length; i++) {
    p2Text.innerHTML += `${player2Cards[i].value} of ${player2Cards[i].type}<br>`;
  }
}

console.log("cardstack:", cardStack);

const hitButton = document.getElementById("hit");
const standButton = document.getElementById("stand");

function Hit() {
  console.log("HIT");
  playerCards.push(cardStack.pop());
  UpdateCards();
  NextTurn();
}

function Stand() {
  console.log("Stand");
  UpdateCards();
  NextTurn();
}

function NextTurn() {
  DisableButtons();
  Player2Decision();
  DealerDecision();
  EnableButtons();
  UpdateCards();
}
function DisableButtons() {
  hitButton.disabled = true;
  standButton.disabled = true;
}
function EnableButtons() {
  hitButton.disabled = false;
  standButton.disabled = false;
}

function Player2Decision() {
  let valuesSum = CheckSum(player2Cards);
  if (valuesSum < 17) {
    player2Cards.push(cardStack.pop());
  }
}

function DealerDecision() {
  let valuesSum = CheckSum(dealerCards);
  console.log("Dealer has less cards: ", doPlayersHaveHigherValues(valuesSum));
  if (valuesSum < 21 && doPlayersHaveHigherValues(valuesSum)) {
    dealerCards.push(cardStack.pop());
  }
}

function doPlayersHaveHigherValues(val) {
  p1Sum = CheckSum(playerCards);
  p2Sum = CheckSum(player2Cards);
  if (p1Sum > 21 && p2Sum > 21) {
    return false;
  }
  if (val < p1Sum || val < p2Sum) return true;
  else return false;
}

function checkWinners() {
  const p1Status = document.getElementById("p1Status");
  const p2Status = document.getElementById("p2Status");
  const dealerStatus = document.getElementById("dealerStatus");

  const p1Sum = CheckSum(playerCards);
  const p2Sum = CheckSum(player2Cards);
  const dealerSum = CheckSum(dealerCards);

  if (p1Sum > 21) p1Status.innerHTML = "DEAD";
  if (p2Sum > 21) p2Status.innerHTML = "DEAD";
  if (dealerSum > 21) dealerStatus.innerHTML = "DEAD";
  UpdateCards();

  let p1dead = p1Sum > 21;
  let p2dead = p2Sum > 21;
  let ddead = dealerSum > 21;

  if (p1dead && p2dead && ddead) {
    alert("No Winners");
    LoseScore();
  } else if (
    (p1dead || p1Sum < dealerSum) &&
    (p2dead || p2Sum < dealerSum) &&
    dealerSum <= 21
  ) {
    alert("Dealer won!");
    LoseScore();
  } else if (ddead) {
    if (p1dead) {
      alert("Player 2 won!");
      LoseScore();
    } else if (p2dead) {
      alert("Player 1 won!");
      WinScore();
    } else if (p1Sum > p2Sum) {
      alert("Player 1 won!");
      WinScore();
    } else if (p1Sum < p2Sum) {
      alert("Player 2 won!");
      LoseScore();
    } else {
      alert("It's a tie!");
      WinScore();
    }
  } else if (p1dead || p1Sum < dealerSum) {
    alert("Player 2 won!");
    LoseScore();
  } else if (p2dead || p2Sum < dealerSum) {
    alert("Player 1 won!");
    WinScore();
  } else {
    alert("It's a tie!");
    WinScore();
  }
}
function addToDeposit(amount) {
  const moneyElement = document.getElementById("money");
  let currentAmount = parseInt(moneyElement.innerHTML);
  moneyElement.innerHTML = currentAmount + amount;
}

function subtractFromDeposit(amount) {
  const moneyElement = document.getElementById("money");
  let currentAmount = parseInt(moneyElement.innerHTML);
  moneyElement.innerHTML = currentAmount - amount;
}
function WinScore() {
  const moneyElement = document.getElementById("money");
  addToDeposit(parseInt(moneyElement.innerHTML) * 2);
  fetch("/game-data")
    .then((response) => response.json())
    .then((data) => {
      fetch("/game-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gamesWon: data.gamesWon + 1,
          gamesLost: data.gamesLost,
        }),
      })
        .then((response) => response.text())
        .then((data) => console.log(data))
        .catch((error) => console.error(error));
      gamesWon.innerHTML = data.gamesWon + 1;
      gamesLost.innerHTML = data.gamesLost;
    })
    .catch((error) => console.error(error));
}

function LoseScore() {
  const moneyElement = document.getElementById("money");
  subtractFromDeposit(parseInt(moneyElement.innerHTML) / 2);
  fetch("/game-data")
    .then((response) => response.json())
    .then((data) => {
      fetch("/game-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gamesWon: data.gamesWon,
          gamesLost: data.gamesLost + 1,
        }),
      })
        .then((response) => response.text())
        .then((data) => console.log(data))
        .catch((error) => console.error(error));
      gamesWon.innerHTML = data.gamesWon;

      gamesLost.innerHTML = data.gamesLost + 1;
    })
    .catch((error) => console.error(error));
}

function CheckSum(arr) {
  let sum = 0;
  let aceCount = 0;
  for (let i = 0; i < arr.length; i++) {
    var content = arr[i].value;
    if (content == "K" || content == "Q" || content == "J") {
      sum += 10;
    } else if (content == "A") {
      aceCount++;
    } else {
      sum += parseInt(content);
    }
  }
  for (let i = 0; i < aceCount; i++) {
    if (sum + 11 <= 21) {
      sum += 11;
    } else {
      sum += 1;
    }
  }
  return sum;
}

function Restart() {
  cardStack.length = 0; // Clear the card stack
  dealerCards.length = 0; // Clear the dealer's cards
  playerCards.length = 0; // Clear player 1's cards
  player2Cards.length = 0; // Clear player 2's cards

  GenerateDeck();
  SchuffleDeck();
  DealCards();
  UpdateCards();

  const p1Status = document.getElementById("p1Status");
  const p2Status = document.getElementById("p2Status");
  const dealerStatus = document.getElementById("dealerStatus");

  p1Status.innerHTML = "";
  p2Status.innerHTML = "";
  dealerStatus.innerHTML = "";

  EnableButtons();
}
