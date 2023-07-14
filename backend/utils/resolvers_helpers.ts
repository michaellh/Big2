import {
  Card,
  GameState,
  GameStateUpdateResult,
  PlayerAction,
} from '../schema';

export const selectRandomCards = (
  deckOfCards: Card[],
  players: number,
): Card[][] => {
  const handSize = 13;
  const shuffledCards = [...deckOfCards].sort(() => Math.random() - 0.5);
  const playerCards: Card[][] = [];

  for (let i = 0; i < players; i += 1) {
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
    const straightSet = new Set<number>();
    const checkCards = cards.map((card) => card.value);
    checkCards.forEach((card) =>
      !straightSet.has(card) ? straightSet.add(card) : straightSet.add(-1),
    );
    const sortedSet = [...straightSet].sort((a, b) => a - b);

    for (let i = 1; i < sortedSet.length; i += 1) {
      if (sortedSet[i - 1] + 1 !== sortedSet[i]) {
        return false;
      }
    }

    return true;
  }

  return false;
};

export const isChop = (cards: Card[], chops = 3): boolean => {
  const evenStraight = [];
  const oddStraight = [];

  if (cards.length < 6 || cards.length > 10 || cards.length % 2 !== 0) {
    return false;
  }

  for (let i = 0; i < cards.length; i += 1) {
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

export function updateCurrentMove(
  user: string,
  gameState: GameState,
  play: string,
  playerAction: PlayerAction,
): GameState {
  const gameStateCopy: GameState = JSON.parse(
    JSON.stringify(gameState),
  ) as GameState;
  gameStateCopy.currentMove.play = play;
  gameStateCopy.currentMove.cards = playerAction.cardsPlayed;

  const playerState = gameStateCopy.playerStates.find(
    (state) => state.player === user,
  );

  if (playerState) {
    playerState.cardCount -= playerAction.cardsPlayed.length;

    if (playerState.cardCount === 0) {
      gameStateCopy.turnRotation.shift();
      gameStateCopy.currentMove.playersInPlay.shift();
      const [topPlayer] = gameStateCopy.currentMove.playersInPlay;
      gameStateCopy.currentMove.player = topPlayer;
      playerState.placementRank = gameStateCopy.nextPlacementRank;
      gameStateCopy.nextPlacementRank += 1;

      if (
        gameStateCopy.nextPlacementRank === gameStateCopy.playerStates.length
      ) {
        const lastRankPlayer = gameStateCopy.playerStates.find(
          (state) => state.placementRank === 0,
        );
        if (lastRankPlayer) {
          lastRankPlayer.placementRank = gameStateCopy.nextPlacementRank;
        }
      }
    } else {
      const currentPlayer = gameStateCopy.currentMove.playersInPlay.shift();
      if (currentPlayer) {
        gameStateCopy.currentMove.player = currentPlayer;
        gameStateCopy.currentMove.playersInPlay.push(currentPlayer);
      }
      const shiftPlayer = gameStateCopy.turnRotation.shift();
      if (shiftPlayer) {
        gameStateCopy.turnRotation.push(shiftPlayer);
      }
    }
  }

  return gameStateCopy;
}

export function isCardHigher(cardA: Card, cardB: Card): boolean {
  if (cardA.value !== cardB.value) {
    return cardA.value > cardB.value;
  }
  return cardA.suit > cardB.suit;
}

export const updateGameStateFromPlay = (
  user: string,
  playerAction: PlayerAction,
  gameState: GameState,
): GameStateUpdateResult => {
  const cards: Card[] = playerAction.cardsPlayed;
  let gameStateCopy: GameState = JSON.parse(
    JSON.stringify(gameState),
  ) as GameState;
  const { currentMove } = gameStateCopy;
  let success = false;
  let failCause = 'Your play is trash!';

  if (currentMove.cards.length === 0) {
    let play;

    if (isSingle(cards)) {
      play = 'single';
    } else if (isPair(cards)) {
      play = 'pair';
    } else if (isTriple(cards)) {
      play = 'triple';
    } else if (isBomb(cards)) {
      play = 'bomb';
    } else if (isStraight(cards)) {
      play = 'straight';
    } else if (isChop(cards)) {
      play = 'chop';
    } else {
      play = undefined;
    }

    if (play) {
      gameStateCopy = updateCurrentMove(
        user,
        gameStateCopy,
        play,
        playerAction,
      );
      success = true;
    } else {
      failCause = 'Not a valid play';
    }
  }

  switch (currentMove.play) {
    case 'single':
      if (isSingle(cards)) {
        if (isCardHigher(cards[0], currentMove.cards[0])) {
          gameStateCopy = updateCurrentMove(
            user,
            gameStateCopy,
            'single',
            playerAction,
          );
          success = true;
        }
      } else if (currentMove.cards[0].value === 15) {
        if (isChop(cards)) {
          gameStateCopy = updateCurrentMove(
            user,
            gameStateCopy,
            'chop',
            playerAction,
          );
          success = true;
        } else if (isBomb(cards)) {
          gameStateCopy = updateCurrentMove(
            user,
            gameStateCopy,
            'bomb',
            playerAction,
          );
          success = true;
        }
      }
      break;
    case 'pair':
      if (isPair(cards)) {
        if (isCardHigher(cards[1], currentMove.cards[1])) {
          gameStateCopy = updateCurrentMove(
            user,
            gameStateCopy,
            'pair',
            playerAction,
          );
          success = true;
        }
      } else if (currentMove.cards[0].value === 15 && isChop(cards, 4)) {
        gameStateCopy = updateCurrentMove(
          user,
          gameStateCopy,
          'chop',
          playerAction,
        );
        success = true;
      }
      break;
    case 'triple':
      if (isTriple(cards)) {
        if (isCardHigher(cards[2], currentMove.cards[2])) {
          gameStateCopy = updateCurrentMove(
            user,
            gameStateCopy,
            'triple',
            playerAction,
          );
          success = true;
        }
      } else if (currentMove.cards[0].value === 15 && isChop(cards, 5)) {
        gameStateCopy = updateCurrentMove(
          user,
          gameStateCopy,
          'chop',
          playerAction,
        );
        success = true;
      }
      break;
    case 'bomb':
      if (isBomb(cards)) {
        if (isCardHigher(cards[3], currentMove.cards[3])) {
          gameStateCopy = updateCurrentMove(
            user,
            gameStateCopy,
            'bomb',
            playerAction,
          );
          success = true;
        }
      }
      break;
    case 'straight':
      if (isStraight(cards) && cards.length === currentMove.cards.length) {
        if (
          isCardHigher(
            cards[cards.length - 1],
            currentMove.cards[currentMove.cards.length - 1],
          )
        ) {
          gameStateCopy = updateCurrentMove(
            user,
            gameStateCopy,
            'straight',
            playerAction,
          );
          success = true;
        }
      }
      break;
    case 'chop':
      if (
        (isChop(cards) && currentMove.cards.length === 6) ||
        (isChop(cards, 4) && currentMove.cards.length === 8) ||
        (isChop(cards, 5) && currentMove.cards.length === 10)
      ) {
        if (
          isCardHigher(
            cards[cards.length - 1],
            currentMove.cards[currentMove.cards.length - 1],
          )
        ) {
          gameStateCopy = updateCurrentMove(
            user,
            gameStateCopy,
            'chop',
            playerAction,
          );
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
    failCause: success ? 'Play successful' : failCause,
  };
};
