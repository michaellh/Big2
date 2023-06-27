import {
  Card,
  GameState,
  GameStateUpdateResult,
  PlayerAction,
} from "../schema";

export const selectRandomCards = (
  deckOfCards: Card[],
  players: number
): Card[][] => {
  const handSize = 13;
  const shuffledCards = [...deckOfCards].sort(() => Math.random() - 0.5);
  let playerCards: Card[][] = [];

  for (let i = 0; i < players; i++) {
    playerCards.push(shuffledCards.splice(0, handSize));
  }

  return playerCards;
};

export const isSingle = (cards: Card[]): boolean => cards.length === 1;

export const isPair = (cards: Card[]): boolean =>
  cards.length === 2 && cards[0].value === cards[1].value;

export const isTriple = (cards: Card[]): boolean =>
  cards.length === 3 &&
  cards[0].value === cards[1].value &&
  cards[1].value === cards[2].value;

export const isBomb = (cards: Card[]): boolean =>
  cards.length === 4 &&
  cards[0].value === cards[1].value &&
  cards[1].value === cards[2].value &&
  cards[2].value === cards[3].value;

export const isStraight = (cards: Card[]): boolean => {
  if (cards.length >= 3) {
    let straightSet = new Set<number>();
    const checkCards = cards.map((card) => card.value);
    checkCards.forEach((card) =>
      !straightSet.has(card) ? straightSet.add(card) : straightSet.add(-1)
    );
    const sortedSet = [...straightSet].sort((a, b) => a - b);

    for (let i = 1; i < sortedSet.length; i++) {
      if (sortedSet[i - 1] + 1 !== sortedSet[i]) {
        return false;
      }
    }

    return true;
  }

  return false;
};

export const isChop = (cards: Card[], chops: number = 3): boolean => {
  const evenStraight = [];
  const oddStraight = [];

  if (cards.length < 6 || cards.length > 10 || cards.length % 2 !== 0) {
    return false;
  }

  for (let i = 0; i < cards.length; i++) {
    if (i % 2 === 0) {
      evenStraight.push(cards[i]);
    } else {
      oddStraight.push(cards[i]);
    }
  }

  if (
    isStraight(evenStraight) &&
    isStraight(oddStraight) &&
    evenStraight.length === chops
  ) {
    return true;
  }

  return false;
};

export const updateGameStateFromPlay = (
  playerAction: PlayerAction,
  gameState: GameState
): GameStateUpdateResult => {
  const cards: Card[] = playerAction.cardsPlayed;
  const gameStateCopy: GameState = JSON.parse(JSON.stringify(gameState));
  const currentMove = gameStateCopy.currentMove;
  let success = false;

  if (currentMove.cards.length === 0) {
    const type = isSingle(cards)
      ? "single"
      : isPair(cards)
      ? "pair"
      : isTriple(cards)
      ? "triple"
      : isBomb(cards)
      ? "bomb"
      : isStraight(cards)
      ? "straight"
      : isChop(cards)
      ? "chop"
      : undefined;

    if (type) {
      updateCurrentMove(gameStateCopy, type, playerAction);
      success = true;
    }
  }

  switch (currentMove.type) {
    case "single":
      if (isSingle(cards)) {
        if (isCardHigher(cards[0], currentMove.cards[0])) {
          updateCurrentMove(gameStateCopy, "single", playerAction);
          success = true;
        }
      } else if (currentMove.cards[0].value === 15) {
        if (isChop(cards)) {
          updateCurrentMove(gameStateCopy, "chop", playerAction);
          success = true;
        } else if (isBomb(cards)) {
          updateCurrentMove(gameStateCopy, "bomb", playerAction);
          success = true;
        }
      }
      break;
    case "pair":
      if (isPair(cards)) {
        if (isCardHigher(cards[1], currentMove.cards[1])) {
          updateCurrentMove(gameStateCopy, "pair", playerAction);
          success = true;
        }
      } else if (currentMove.cards[0].value === 15 && isChop(cards, 4)) {
        updateCurrentMove(gameStateCopy, "chop", playerAction);
        success = true;
      }
      break;
    case "triple":
      if (isTriple(cards)) {
        if (isCardHigher(cards[0], currentMove.cards[0])) {
          updateCurrentMove(gameStateCopy, "triple", playerAction);
          success = true;
        }
      } else if (currentMove.cards[0].value === 15 && isChop(cards, 5)) {
        updateCurrentMove(gameStateCopy, "chop", playerAction);
        success = true;
      }
      break;
    case "bomb":
      if (isBomb(cards)) {
        if (isCardHigher(cards[0], currentMove.cards[0])) {
          updateCurrentMove(gameStateCopy, "bomb", playerAction);
          success = true;
        }
      }
      break;
    case "straight":
      if (isStraight(cards) && cards.length === currentMove.cards.length) {
        if (
          isCardHigher(
            cards[cards.length - 1],
            currentMove.cards[currentMove.cards.length - 1]
          )
        ) {
          updateCurrentMove(gameStateCopy, "straight", playerAction);
          success = true;
        }
      }
      break;
    case "chop":
      if (
        (isChop(cards) && currentMove.cards.length === 6) ||
        (isChop(cards, 4) && currentMove.cards.length === 8) ||
        (isChop(cards, 5) && currentMove.cards.length === 10)
      ) {
        if (
          isCardHigher(
            cards[cards.length - 1],
            currentMove.cards[currentMove.cards.length - 1]
          )
        ) {
          updateCurrentMove(gameStateCopy, "chop", playerAction);
          success = true;
        }
      }
      break;
    default:
      break;
  }

  return {
    updatedGameState: gameStateCopy,
    success,
  };
};

export function isCardLower(cardA: Card, cardB: Card): boolean {
  if (cardA.value !== cardB.value) {
    return cardA.value < cardB.value;
  }
  return cardA.suit < cardB.suit;
}

export function isCardHigher(cardA: Card, cardB: Card): boolean {
  if (cardA.value !== cardB.value) {
    return cardA.value > cardB.value;
  }
  return cardA.suit > cardB.suit;
}

export function updateCurrentMove(
  gameState: GameState,
  type: string,
  playerAction: PlayerAction
) {
  gameState.currentMove.type = type;
  gameState.currentMove.cards = playerAction.cardsPlayed;
  gameState.playerStates.find((playerState) => {
    if (playerState.player === playerAction.name) {
      playerState.cardCount -= playerAction.cardsPlayed.length;
    }
  });
  const lastPlayer = gameState.turnRotation.shift()?.toString();
  if (lastPlayer) {
    gameState.currentMove.player = lastPlayer;
    gameState.turnRotation.push(lastPlayer);
  }
}
