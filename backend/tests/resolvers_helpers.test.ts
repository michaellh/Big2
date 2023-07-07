import { Types } from 'mongoose';
import {
  selectRandomCards,
  isSingle,
  isPair,
  isTriple,
  isBomb,
  isStraight,
  isChop,
  isCardHigher,
  updateCurrentMove,
  updateGameStateFromPlay,
} from '../utils/resolvers_helpers';
import deckOfCards from '../utils/test_data';
import { Card, GameState } from '../schema';

describe('selectRandomCards', () => {
  test('with 2 players', () => {
    const result = selectRandomCards(deckOfCards, 2);

    expect(result[0]).toHaveLength(13);
    expect(result[1]).toHaveLength(13);
  });

  test('with 3 players', () => {
    const result = selectRandomCards(deckOfCards, 3);

    expect(result[0]).toHaveLength(13);
    expect(result[1]).toHaveLength(13);
    expect(result[2]).toHaveLength(13);
  });

  test('with 4 players', () => {
    const result = selectRandomCards(deckOfCards, 4);

    expect(result[0]).toHaveLength(13);
    expect(result[1]).toHaveLength(13);
    expect(result[2]).toHaveLength(13);
    expect(result[3]).toHaveLength(13);
  });

  test('with unique cards', () => {
    const result = selectRandomCards(deckOfCards, 2);

    expect(result[0][0].id).not.toBe(result[1][0].id);
  });
});

describe('isSingle', () => {
  test('with 1 card', () => {
    const cards: Card[] = [
      {
        id: 0,
        value: 1,
        suit: 1,
      },
    ];
    const result = isSingle(cards);

    expect(result).toBe(true);
  });

  test('with 2 cards', () => {
    const cards: Card[] = [
      {
        id: 0,
        value: 1,
        suit: 1,
      },
      { id: 1, value: 1, suit: 2 },
    ];
    const result = isSingle(cards);

    expect(result).toBe(false);
  });
});

describe('isPair', () => {
  test('with 1 card', () => {
    const cards: Card[] = [
      {
        id: 0,
        value: 1,
        suit: 1,
      },
    ];
    const result = isPair(cards);

    expect(result).toBe(false);
  });

  test('with 2 cards with the same value', () => {
    const cards: Card[] = [
      { id: 4, value: 2, suit: 3 },
      { id: 5, value: 2, suit: 4 },
    ];
    const result = isPair(cards);

    expect(result).toBe(true);
  });

  test('with 2 cards with different values', () => {
    const cards: Card[] = [
      {
        id: 0,
        value: 1,
        suit: 1,
      },
      { id: 1, value: 2, suit: 2 },
    ];
    const result = isPair(cards);

    expect(result).toBe(false);
  });
});

describe('isTriple', () => {
  test('with 1 card', () => {
    const cards: Card[] = [
      {
        id: 0,
        value: 1,
        suit: 1,
      },
    ];
    const result = isTriple(cards);

    expect(result).toBe(false);
  });

  test('with 3 cards with the same value', () => {
    const cards: Card[] = [
      {
        id: 0,
        value: 1,
        suit: 1,
      },
      { id: 1, value: 1, suit: 2 },
      { id: 1, value: 1, suit: 3 },
    ];
    const result = isTriple(cards);

    expect(result).toBe(true);
  });

  test('with 3 cards with different values', () => {
    const cards: Card[] = [
      {
        id: 0,
        value: 1,
        suit: 1,
      },
      { id: 1, value: 2, suit: 2 },
      { id: 1, value: 2, suit: 3 },
    ];
    const result = isTriple(cards);

    expect(result).toBe(false);
  });
});

describe('isBomb', () => {
  test('with 1 card', () => {
    const cards: Card[] = [
      {
        id: 0,
        value: 1,
        suit: 1,
      },
    ];
    const result = isBomb(cards);

    expect(result).toBe(false);
  });

  test('with 4 cards with the same value', () => {
    const cards: Card[] = [
      {
        id: 0,
        value: 1,
        suit: 1,
      },
      { id: 1, value: 1, suit: 2 },
      { id: 2, value: 1, suit: 3 },
      { id: 3, value: 1, suit: 4 },
    ];
    const result = isBomb(cards);

    expect(result).toBe(true);
  });

  test('with 4 cards with different values', () => {
    const cards: Card[] = [
      {
        id: 0,
        value: 1,
        suit: 1,
      },
      { id: 1, value: 2, suit: 2 },
      { id: 2, value: 2, suit: 3 },
      { id: 3, value: 1, suit: 3 },
    ];
    const result = isBomb(cards);

    expect(result).toBe(false);
  });
});

describe('isStraight', () => {
  test('with 1 card', () => {
    const cards: Card[] = [
      {
        id: 0,
        value: 1,
        suit: 1,
      },
    ];
    const result = isStraight(cards);

    expect(result).toBe(false);
  });

  test('with 3 cards with sequential values', () => {
    const cards: Card[] = [
      {
        id: 0,
        value: 1,
        suit: 1,
      },
      { id: 1, value: 2, suit: 2 },
      { id: 2, value: 3, suit: 3 },
    ];
    const result = isStraight(cards);

    expect(result).toBe(true);
  });

  test('with 4 cards with non-sequential values', () => {
    const cards: Card[] = [
      {
        id: 0,
        value: 1,
        suit: 1,
      },
      { id: 1, value: 2, suit: 2 },
      { id: 2, value: 2, suit: 3 },
      { id: 3, value: 3, suit: 3 },
    ];
    const result = isStraight(cards);

    expect(result).toBe(false);
  });
});

describe('isChop', () => {
  test('with 1 card', () => {
    const cards: Card[] = [
      {
        id: 0,
        value: 1,
        suit: 1,
      },
    ];
    const result = isChop(cards);

    expect(result).toBe(false);
  });

  test('with 11 cards', () => {
    const cards: Card[] = [
      { id: 0, value: 2, suit: 1 },
      { id: 1, value: 2, suit: 2 },
      { id: 2, value: 4, suit: 1 },
      { id: 3, value: 4, suit: 2 },
      { id: 4, value: 5, suit: 1 },
      { id: 5, value: 5, suit: 2 },
      { id: 6, value: 7, suit: 1 },
      { id: 7, value: 7, suit: 2 },
      { id: 8, value: 6, suit: 2 },
      { id: 9, value: 8, suit: 1 },
      { id: 10, value: 9, suit: 2 },
    ];
    const result = isChop(cards);

    expect(result).toBe(false);
  });

  test('with 3 pairs of sequential values', () => {
    const cards: Card[] = [
      { id: 0, value: 1, suit: 1 },
      { id: 1, value: 1, suit: 2 },
      { id: 2, value: 2, suit: 1 },
      { id: 3, value: 2, suit: 2 },
      { id: 4, value: 3, suit: 1 },
      { id: 5, value: 3, suit: 2 },
    ];
    const result = isChop(cards);

    expect(result).toBe(true);
  });

  test('with 4 pairs with non-sequential values', () => {
    const cards: Card[] = [
      { id: 0, value: 2, suit: 1 },
      { id: 1, value: 2, suit: 2 },
      { id: 2, value: 4, suit: 1 },
      { id: 3, value: 4, suit: 2 },
      { id: 4, value: 5, suit: 1 },
      { id: 5, value: 5, suit: 2 },
      { id: 6, value: 7, suit: 1 },
      { id: 7, value: 7, suit: 2 },
    ];
    const result = isChop(cards, 4);

    expect(result).toBe(false);
  });

  test('with 4 pairs of sequential values', () => {
    const cards: Card[] = [
      { id: 4, value: 2, suit: 2 },
      { id: 5, value: 2, suit: 3 },
      { id: 6, value: 3, suit: 2 },
      { id: 7, value: 3, suit: 3 },
      { id: 8, value: 4, suit: 2 },
      { id: 9, value: 4, suit: 3 },
      { id: 10, value: 5, suit: 2 },
      { id: 11, value: 5, suit: 3 },
    ];
    const result = isChop(cards, 4);

    expect(result).toBe(true);
  });

  test('with 5 pairs of sequential values', () => {
    const cards: Card[] = [
      { id: 0, value: 2, suit: 1 },
      { id: 1, value: 2, suit: 2 },
      { id: 2, value: 3, suit: 1 },
      { id: 3, value: 3, suit: 2 },
      { id: 4, value: 4, suit: 1 },
      { id: 5, value: 4, suit: 2 },
      { id: 6, value: 5, suit: 1 },
      { id: 7, value: 5, suit: 2 },
      { id: 8, value: 6, suit: 1 },
      { id: 9, value: 6, suit: 2 },
    ];
    const result = isChop(cards, 5);

    expect(result).toBe(true);
  });
});

describe('isCardHigher', () => {
  test('with one card higher in value', () => {
    const cards = [
      { id: 0, value: 2, suit: 1 },
      { id: 1, value: 1, suit: 1 },
    ];

    expect(isCardHigher(cards[0], cards[1])).toBe(true);
  });

  test('with same values, but one is higher in suit', () => {
    const cards = [
      { id: 0, value: 1, suit: 2 },
      { id: 1, value: 1, suit: 1 },
    ];

    expect(isCardHigher(cards[0], cards[1])).toBe(true);
  });
});

describe('updateCurrentMove', () => {
  let gameState: GameState;
  const testPlayer1 = new Types.ObjectId();
  const testPlayer2 = new Types.ObjectId();

  beforeEach(() => {
    gameState = {
      turnRotation: [testPlayer1, testPlayer2],
      currentMove: {
        cards: [],
        play: '',
        player: testPlayer1,
        playersInPlay: [testPlayer1, testPlayer2],
      },
      playerStates: [
        {
          player: testPlayer1,
          cardCount: 2,
        },
        {
          player: testPlayer2,
          cardCount: 3,
        },
      ],
    };
  });

  test('when a player plays cards', () => {
    const playerAction = {
      name: testPlayer1,
      action: 'play',
      cardsPlayed: [{ id: 0, value: 1, suit: 1 }],
    };
    const result = updateCurrentMove(
      testPlayer1,
      gameState,
      'single',
      playerAction,
    );

    expect(result).toStrictEqual({
      turnRotation: [testPlayer2.toString(), testPlayer1.toString()],
      currentMove: {
        cards: playerAction.cardsPlayed,
        play: 'single',
        player: testPlayer1.toString(),
        playersInPlay: [testPlayer2.toString(), testPlayer1.toString()],
      },
      playerStates: [
        {
          player: testPlayer1.toString(),
          cardCount: 1,
        },
        {
          player: testPlayer2.toString(),
          cardCount: 3,
        },
      ],
    });
  });

  test('when a player runs out of cards with play', () => {
    gameState.playerStates[0].cardCount = 1;
    const playerAction = {
      name: testPlayer1,
      action: 'play',
      cardsPlayed: [{ id: 0, value: 1, suit: 1 }],
    };
    const result = updateCurrentMove(
      testPlayer1,
      gameState,
      'single',
      playerAction,
    );

    expect(result).toStrictEqual({
      turnRotation: [testPlayer2.toString()],
      currentMove: {
        cards: playerAction.cardsPlayed,
        play: 'single',
        player: testPlayer2.toString(),
        playersInPlay: [testPlayer2.toString()],
      },
      playerStates: [
        {
          player: testPlayer1.toString(),
          cardCount: 0,
        },
        {
          player: testPlayer2.toString(),
          cardCount: 3,
        },
      ],
    });
  });
});

describe('updateGameStateFromPlay', () => {
  const testPlayer1 = new Types.ObjectId();
  const testPlayer2 = new Types.ObjectId();
  let gameState: GameState;

  beforeEach(() => {
    gameState = {
      turnRotation: [testPlayer1, testPlayer2],
      currentMove: {
        cards: [],
        play: '',
        player: testPlayer1,
        playersInPlay: [testPlayer1, testPlayer2],
      },
      playerStates: [
        {
          player: testPlayer1,
          cardCount: 2,
        },
        {
          player: testPlayer2,
          cardCount: 3,
        },
      ],
    };
  });

  test('when no cards have been played yet', () => {
    const playerAction = {
      name: testPlayer1,
      action: 'play',
      cardsPlayed: [{ id: 0, value: 1, suit: 1 }],
    };
    const result = updateGameStateFromPlay(
      testPlayer1,
      playerAction,
      gameState,
    );

    expect(result.success).toBe(true);
    expect(result.updatedGameState).toStrictEqual({
      turnRotation: [testPlayer2.toString(), testPlayer1.toString()],
      currentMove: {
        cards: playerAction.cardsPlayed,
        play: 'single',
        player: testPlayer1.toString(),
        playersInPlay: [testPlayer2.toString(), testPlayer1.toString()],
      },
      playerStates: [
        {
          player: testPlayer1.toString(),
          cardCount: 1,
        },
        {
          player: testPlayer2.toString(),
          cardCount: 3,
        },
      ],
    });
  });

  describe('single', () => {
    test("can't be beat by a lower single", () => {
      gameState.currentMove.cards = [{ id: 0, value: 2, suit: 1 }];
      gameState.currentMove.play = 'single';
      gameState.currentMove.player = testPlayer1;

      const playerAction = {
        name: testPlayer2,
        action: 'play',
        cardsPlayed: [{ id: 0, value: 1, suit: 1 }],
      };
      const result = updateGameStateFromPlay(
        testPlayer2,
        playerAction,
        gameState,
      );

      expect(result.success).toBe(false);
      expect(result.updatedGameState).toStrictEqual({
        turnRotation: [testPlayer1.toString(), testPlayer2.toString()],
        currentMove: {
          cards: gameState.currentMove.cards,
          play: gameState.currentMove.play,
          player: gameState.currentMove.player.toString(),
          playersInPlay: [testPlayer1.toString(), testPlayer2.toString()],
        },
        playerStates: [
          {
            player: testPlayer1.toString(),
            cardCount: 2,
          },
          {
            player: testPlayer2.toString(),
            cardCount: 3,
          },
        ],
      });
    });

    test('beat by a higher single', () => {
      gameState.turnRotation = [testPlayer2, testPlayer1];
      gameState.currentMove.playersInPlay = [testPlayer2, testPlayer1];
      gameState.currentMove.cards = [{ id: 0, value: 2, suit: 1 }];
      gameState.currentMove.play = 'single';
      gameState.currentMove.player = testPlayer1;

      const playerAction = {
        name: testPlayer2,
        action: 'play',
        cardsPlayed: [{ id: 4, value: 2, suit: 2 }],
      };
      const result = updateGameStateFromPlay(
        testPlayer2,
        playerAction,
        gameState,
      );

      expect(result.success).toBe(true);
      expect(result.updatedGameState).toStrictEqual({
        turnRotation: [testPlayer1.toString(), testPlayer2.toString()],
        currentMove: {
          cards: playerAction.cardsPlayed,
          play: gameState.currentMove.play,
          player: playerAction.name.toString(),
          playersInPlay: [testPlayer1.toString(), testPlayer2.toString()],
        },
        playerStates: [
          {
            player: testPlayer1.toString(),
            cardCount: 2,
          },
          {
            player: testPlayer2.toString(),
            cardCount: 2,
          },
        ],
      });
    });

    test('when current move = single 2 & is beat by a chop', () => {
      gameState.turnRotation = [testPlayer2, testPlayer1];
      gameState.currentMove.playersInPlay = [testPlayer2, testPlayer1];
      gameState.currentMove.cards = [{ id: 0, value: 15, suit: 1 }];
      gameState.currentMove.play = 'single';
      gameState.currentMove.player = testPlayer1;
      gameState.playerStates[1].cardCount = 7;

      const playerAction = {
        name: testPlayer2,
        action: 'play',
        cardsPlayed: [
          { id: 4, value: 2, suit: 2 },
          { id: 5, value: 2, suit: 3 },
          { id: 6, value: 3, suit: 2 },
          { id: 7, value: 3, suit: 3 },
          { id: 8, value: 4, suit: 2 },
          { id: 9, value: 4, suit: 3 },
        ],
      };
      const result = updateGameStateFromPlay(
        testPlayer2,
        playerAction,
        gameState,
      );

      expect(result.success).toBe(true);
      expect(result.updatedGameState).toStrictEqual({
        turnRotation: [testPlayer1.toString(), testPlayer2.toString()],
        currentMove: {
          cards: playerAction.cardsPlayed,
          play: 'chop',
          player: playerAction.name.toString(),
          playersInPlay: [testPlayer1.toString(), testPlayer2.toString()],
        },
        playerStates: [
          {
            player: testPlayer1.toString(),
            cardCount: 2,
          },
          {
            player: testPlayer2.toString(),
            cardCount: 1,
          },
        ],
      });
    });

    test('when current move = single 2 & is beat by a bomb', () => {
      gameState.turnRotation = [testPlayer2, testPlayer1];
      gameState.currentMove.playersInPlay = [testPlayer2, testPlayer1];
      gameState.currentMove.cards = [{ id: 0, value: 15, suit: 1 }];
      gameState.currentMove.play = 'single';
      gameState.currentMove.player = testPlayer1;
      gameState.playerStates[1].cardCount = 7;

      const playerAction = {
        name: testPlayer2,
        action: 'play',
        cardsPlayed: [
          { id: 4, value: 4, suit: 1 },
          { id: 5, value: 4, suit: 2 },
          { id: 6, value: 4, suit: 3 },
          { id: 7, value: 4, suit: 4 },
        ],
      };
      const result = updateGameStateFromPlay(
        testPlayer2,
        playerAction,
        gameState,
      );

      expect(result.success).toBe(true);
      expect(result.updatedGameState).toStrictEqual({
        turnRotation: [testPlayer1.toString(), testPlayer2.toString()],
        currentMove: {
          cards: playerAction.cardsPlayed,
          play: 'bomb',
          player: playerAction.name.toString(),
          playersInPlay: [testPlayer1.toString(), testPlayer2.toString()],
        },
        playerStates: [
          {
            player: testPlayer1.toString(),
            cardCount: 2,
          },
          {
            player: testPlayer2.toString(),
            cardCount: 3,
          },
        ],
      });
    });
  });

  describe('pair', () => {
    test("can't be beat by a lower pair", () => {
      gameState.currentMove.cards = [
        { id: 0, value: 2, suit: 3 },
        { id: 0, value: 2, suit: 4 },
      ];
      gameState.currentMove.play = 'pair';
      gameState.currentMove.player = testPlayer1;

      const playerAction = {
        name: testPlayer2,
        action: 'play',
        cardsPlayed: [
          { id: 0, value: 2, suit: 1 },
          { id: 0, value: 2, suit: 2 },
        ],
      };
      const result = updateGameStateFromPlay(
        testPlayer2,
        playerAction,
        gameState,
      );

      expect(result.success).toBe(false);
      expect(result.updatedGameState).toStrictEqual({
        turnRotation: [testPlayer1.toString(), testPlayer2.toString()],
        currentMove: {
          cards: gameState.currentMove.cards,
          play: gameState.currentMove.play,
          player: gameState.currentMove.player.toString(),
          playersInPlay: [testPlayer1.toString(), testPlayer2.toString()],
        },
        playerStates: [
          {
            player: testPlayer1.toString(),
            cardCount: 2,
          },
          {
            player: testPlayer2.toString(),
            cardCount: 3,
          },
        ],
      });
    });

    test('beat by a higher pair', () => {
      gameState.turnRotation = [testPlayer2, testPlayer1];
      gameState.currentMove.playersInPlay = [testPlayer2, testPlayer1];
      gameState.currentMove.cards = [
        { id: 0, value: 2, suit: 1 },
        { id: 0, value: 2, suit: 2 },
      ];
      gameState.currentMove.play = 'pair';
      gameState.currentMove.player = testPlayer1;

      const playerAction = {
        name: testPlayer2,
        action: 'play',
        cardsPlayed: [
          { id: 4, value: 2, suit: 3 },
          { id: 5, value: 2, suit: 4 },
        ],
      };
      const result = updateGameStateFromPlay(
        testPlayer2,
        playerAction,
        gameState,
      );

      expect(result.success).toBe(true);
      expect(result.updatedGameState).toStrictEqual({
        turnRotation: [testPlayer1.toString(), testPlayer2.toString()],
        currentMove: {
          cards: playerAction.cardsPlayed,
          play: gameState.currentMove.play,
          player: playerAction.name.toString(),
          playersInPlay: [testPlayer1.toString(), testPlayer2.toString()],
        },
        playerStates: [
          {
            player: testPlayer1.toString(),
            cardCount: 2,
          },
          {
            player: testPlayer2.toString(),
            cardCount: 1,
          },
        ],
      });
    });

    test('when current move = pair 2s & is beat by a 4 chop', () => {
      gameState.turnRotation = [testPlayer2, testPlayer1];
      gameState.currentMove.playersInPlay = [testPlayer2, testPlayer1];
      gameState.currentMove.cards = [
        { id: 0, value: 15, suit: 1 },
        { id: 0, value: 15, suit: 2 },
      ];
      gameState.currentMove.play = 'pair';
      gameState.currentMove.player = testPlayer1;
      gameState.playerStates[1].cardCount = 10;

      const playerAction = {
        name: testPlayer2,
        action: 'play',
        cardsPlayed: [
          { id: 4, value: 2, suit: 2 },
          { id: 5, value: 2, suit: 3 },
          { id: 6, value: 3, suit: 2 },
          { id: 7, value: 3, suit: 3 },
          { id: 8, value: 4, suit: 2 },
          { id: 9, value: 4, suit: 3 },
          { id: 10, value: 5, suit: 2 },
          { id: 11, value: 5, suit: 3 },
        ],
      };
      const result = updateGameStateFromPlay(
        testPlayer2,
        playerAction,
        gameState,
      );

      expect(result.success).toBe(true);
      expect(result.updatedGameState).toStrictEqual({
        turnRotation: [testPlayer1.toString(), testPlayer2.toString()],
        currentMove: {
          cards: playerAction.cardsPlayed,
          play: 'chop',
          player: playerAction.name.toString(),
          playersInPlay: [testPlayer1.toString(), testPlayer2.toString()],
        },
        playerStates: [
          {
            player: testPlayer1.toString(),
            cardCount: 2,
          },
          {
            player: testPlayer2.toString(),
            cardCount: 2,
          },
        ],
      });
    });
  });

  describe('triple', () => {
    test("can't be beat by a lower triple", () => {
      gameState.currentMove.cards = [
        { id: 0, value: 5, suit: 2 },
        { id: 0, value: 5, suit: 3 },
        { id: 0, value: 5, suit: 4 },
      ];
      gameState.currentMove.play = 'triple';
      gameState.currentMove.player = testPlayer1;

      const playerAction = {
        name: testPlayer2,
        action: 'play',
        cardsPlayed: [
          { id: 0, value: 3, suit: 1 },
          { id: 0, value: 3, suit: 2 },
          { id: 0, value: 3, suit: 3 },
        ],
      };
      const result = updateGameStateFromPlay(
        testPlayer2,
        playerAction,
        gameState,
      );

      expect(result.success).toBe(false);
      expect(result.updatedGameState).toStrictEqual({
        turnRotation: [testPlayer1.toString(), testPlayer2.toString()],
        currentMove: {
          cards: gameState.currentMove.cards,
          play: gameState.currentMove.play,
          player: gameState.currentMove.player.toString(),
          playersInPlay: [testPlayer1.toString(), testPlayer2.toString()],
        },
        playerStates: [
          {
            player: testPlayer1.toString(),
            cardCount: 2,
          },
          {
            player: testPlayer2.toString(),
            cardCount: 3,
          },
        ],
      });
    });

    test('beat by a higher triple', () => {
      gameState.turnRotation = [testPlayer2, testPlayer1];
      gameState.currentMove.playersInPlay = [testPlayer2, testPlayer1];
      gameState.currentMove.cards = [
        { id: 0, value: 2, suit: 1 },
        { id: 0, value: 2, suit: 2 },
        { id: 0, value: 2, suit: 3 },
      ];
      gameState.currentMove.play = 'triple';
      gameState.currentMove.player = testPlayer1;
      gameState.playerStates[1].cardCount = 5;

      const playerAction = {
        name: testPlayer2,
        action: 'play',
        cardsPlayed: [
          { id: 3, value: 7, suit: 2 },
          { id: 4, value: 7, suit: 3 },
          { id: 5, value: 7, suit: 4 },
        ],
      };
      const result = updateGameStateFromPlay(
        testPlayer2,
        playerAction,
        gameState,
      );

      expect(result.success).toBe(true);
      expect(result.updatedGameState).toStrictEqual({
        turnRotation: [testPlayer1.toString(), testPlayer2.toString()],
        currentMove: {
          cards: playerAction.cardsPlayed,
          play: gameState.currentMove.play,
          player: playerAction.name.toString(),
          playersInPlay: [testPlayer1.toString(), testPlayer2.toString()],
        },
        playerStates: [
          {
            player: testPlayer1.toString(),
            cardCount: 2,
          },
          {
            player: testPlayer2.toString(),
            cardCount: 2,
          },
        ],
      });
    });

    test('when current move = triple 2s & is beat by a 5 chop', () => {
      gameState.turnRotation = [testPlayer2, testPlayer1];
      gameState.currentMove.playersInPlay = [testPlayer2, testPlayer1];
      gameState.currentMove.cards = [
        { id: 0, value: 15, suit: 1 },
        { id: 0, value: 15, suit: 2 },
        { id: 0, value: 15, suit: 3 },
      ];
      gameState.currentMove.play = 'triple';
      gameState.currentMove.player = testPlayer1;
      gameState.playerStates[1].cardCount = 11;

      const playerAction = {
        name: testPlayer2,
        action: 'play',
        cardsPlayed: [
          { id: 4, value: 2, suit: 2 },
          { id: 5, value: 2, suit: 3 },
          { id: 6, value: 3, suit: 2 },
          { id: 7, value: 3, suit: 3 },
          { id: 8, value: 4, suit: 2 },
          { id: 9, value: 4, suit: 3 },
          { id: 10, value: 5, suit: 2 },
          { id: 11, value: 5, suit: 3 },
          { id: 12, value: 6, suit: 2 },
          { id: 13, value: 6, suit: 3 },
        ],
      };
      const result = updateGameStateFromPlay(
        testPlayer2,
        playerAction,
        gameState,
      );

      expect(result.success).toBe(true);
      expect(result.updatedGameState).toStrictEqual({
        turnRotation: [testPlayer1.toString(), testPlayer2.toString()],
        currentMove: {
          cards: playerAction.cardsPlayed,
          play: 'chop',
          player: playerAction.name.toString(),
          playersInPlay: [testPlayer1.toString(), testPlayer2.toString()],
        },
        playerStates: [
          {
            player: testPlayer1.toString(),
            cardCount: 2,
          },
          {
            player: testPlayer2.toString(),
            cardCount: 1,
          },
        ],
      });
    });
  });

  describe('bomb', () => {
    test("can't be beat by a lower bomb", () => {
      gameState.currentMove.cards = [
        { id: 0, value: 5, suit: 1 },
        { id: 0, value: 5, suit: 2 },
        { id: 0, value: 5, suit: 3 },
        { id: 0, value: 5, suit: 4 },
      ];
      gameState.currentMove.play = 'bomb';
      gameState.currentMove.player = testPlayer1;

      const playerAction = {
        name: testPlayer2,
        action: 'play',
        cardsPlayed: [
          { id: 0, value: 3, suit: 1 },
          { id: 0, value: 3, suit: 2 },
          { id: 0, value: 3, suit: 3 },
          { id: 0, value: 3, suit: 4 },
        ],
      };
      const result = updateGameStateFromPlay(
        testPlayer2,
        playerAction,
        gameState,
      );

      expect(result.success).toBe(false);
      expect(result.updatedGameState).toStrictEqual({
        turnRotation: [testPlayer1.toString(), testPlayer2.toString()],
        currentMove: {
          cards: gameState.currentMove.cards,
          play: gameState.currentMove.play,
          player: gameState.currentMove.player.toString(),
          playersInPlay: [testPlayer1.toString(), testPlayer2.toString()],
        },
        playerStates: [
          {
            player: testPlayer1.toString(),
            cardCount: 2,
          },
          {
            player: testPlayer2.toString(),
            cardCount: 3,
          },
        ],
      });
    });

    test('beat by a higher bomb', () => {
      gameState.turnRotation = [testPlayer2, testPlayer1];
      gameState.currentMove.playersInPlay = [testPlayer2, testPlayer1];
      gameState.currentMove.cards = [
        { id: 0, value: 2, suit: 1 },
        { id: 0, value: 2, suit: 2 },
        { id: 0, value: 2, suit: 3 },
        { id: 0, value: 2, suit: 4 },
      ];
      gameState.currentMove.play = 'bomb';
      gameState.currentMove.player = testPlayer1;
      gameState.playerStates[1].cardCount = 10;

      const playerAction = {
        name: testPlayer2,
        action: 'play',
        cardsPlayed: [
          { id: 2, value: 7, suit: 1 },
          { id: 3, value: 7, suit: 2 },
          { id: 4, value: 7, suit: 3 },
          { id: 5, value: 7, suit: 4 },
        ],
      };
      const result = updateGameStateFromPlay(
        testPlayer2,
        playerAction,
        gameState,
      );

      expect(result.success).toBe(true);
      expect(result.updatedGameState).toStrictEqual({
        turnRotation: [testPlayer1.toString(), testPlayer2.toString()],
        currentMove: {
          cards: playerAction.cardsPlayed,
          play: gameState.currentMove.play,
          player: playerAction.name.toString(),
          playersInPlay: [testPlayer1.toString(), testPlayer2.toString()],
        },
        playerStates: [
          {
            player: testPlayer1.toString(),
            cardCount: 2,
          },
          {
            player: testPlayer2.toString(),
            cardCount: 6,
          },
        ],
      });
    });
  });

  describe('straight', () => {
    test("can't be beat by a mismatched straight size", () => {
      gameState.currentMove.cards = [
        { id: 0, value: 4, suit: 1 },
        { id: 0, value: 5, suit: 2 },
        { id: 0, value: 6, suit: 3 },
        { id: 0, value: 7, suit: 3 },
      ];
      gameState.currentMove.play = 'straight';
      gameState.currentMove.player = testPlayer1;

      const playerAction = {
        name: testPlayer2,
        action: 'play',
        cardsPlayed: [
          { id: 0, value: 1, suit: 1 },
          { id: 0, value: 2, suit: 2 },
          { id: 0, value: 3, suit: 3 },
        ],
      };
      const result = updateGameStateFromPlay(
        testPlayer2,
        playerAction,
        gameState,
      );

      expect(result.success).toBe(false);
      expect(result.updatedGameState).toStrictEqual({
        turnRotation: [testPlayer1.toString(), testPlayer2.toString()],
        currentMove: {
          cards: gameState.currentMove.cards,
          play: gameState.currentMove.play,
          player: gameState.currentMove.player.toString(),
          playersInPlay: [testPlayer1.toString(), testPlayer2.toString()],
        },
        playerStates: [
          {
            player: testPlayer1.toString(),
            cardCount: 2,
          },
          {
            player: testPlayer2.toString(),
            cardCount: 3,
          },
        ],
      });
    });

    test("can't be beat by a lower straight of same size", () => {
      gameState.currentMove.cards = [
        { id: 0, value: 4, suit: 1 },
        { id: 0, value: 5, suit: 2 },
        { id: 0, value: 6, suit: 3 },
      ];
      gameState.currentMove.play = 'straight';
      gameState.currentMove.player = testPlayer1;

      const playerAction = {
        name: testPlayer2,
        action: 'play',
        cardsPlayed: [
          { id: 0, value: 1, suit: 1 },
          { id: 0, value: 2, suit: 2 },
          { id: 0, value: 3, suit: 3 },
        ],
      };
      const result = updateGameStateFromPlay(
        testPlayer2,
        playerAction,
        gameState,
      );

      expect(result.success).toBe(false);
      expect(result.updatedGameState).toStrictEqual({
        turnRotation: [testPlayer1.toString(), testPlayer2.toString()],
        currentMove: {
          cards: gameState.currentMove.cards,
          play: gameState.currentMove.play,
          player: gameState.currentMove.player.toString(),
          playersInPlay: [testPlayer1.toString(), testPlayer2.toString()],
        },
        playerStates: [
          {
            player: testPlayer1.toString(),
            cardCount: 2,
          },
          {
            player: testPlayer2.toString(),
            cardCount: 3,
          },
        ],
      });
    });

    test('beat by a higher straight of same size', () => {
      gameState.turnRotation = [testPlayer2, testPlayer1];
      gameState.currentMove.playersInPlay = [testPlayer2, testPlayer1];
      gameState.currentMove.cards = [
        { id: 0, value: 1, suit: 1 },
        { id: 0, value: 2, suit: 2 },
        { id: 0, value: 3, suit: 3 },
        { id: 0, value: 4, suit: 4 },
      ];
      gameState.currentMove.play = 'straight';
      gameState.currentMove.player = testPlayer1;
      gameState.playerStates[1].cardCount = 10;

      const playerAction = {
        name: testPlayer2,
        action: 'play',
        cardsPlayed: [
          { id: 2, value: 5, suit: 1 },
          { id: 3, value: 6, suit: 2 },
          { id: 4, value: 7, suit: 3 },
          { id: 5, value: 8, suit: 4 },
        ],
      };
      const result = updateGameStateFromPlay(
        testPlayer2,
        playerAction,
        gameState,
      );

      expect(result.success).toBe(true);
      expect(result.updatedGameState).toStrictEqual({
        turnRotation: [testPlayer1.toString(), testPlayer2.toString()],
        currentMove: {
          cards: playerAction.cardsPlayed,
          play: gameState.currentMove.play,
          player: playerAction.name.toString(),
          playersInPlay: [testPlayer1.toString(), testPlayer2.toString()],
        },
        playerStates: [
          {
            player: testPlayer1.toString(),
            cardCount: 2,
          },
          {
            player: testPlayer2.toString(),
            cardCount: 6,
          },
        ],
      });
    });
  });

  describe('chop', () => {
    test("can't be beat by a mismatched chop size", () => {
      gameState.currentMove.cards = [
        { id: 0, value: 1, suit: 1 },
        { id: 0, value: 1, suit: 2 },
        { id: 0, value: 2, suit: 1 },
        { id: 0, value: 2, suit: 2 },
        { id: 0, value: 3, suit: 1 },
        { id: 0, value: 3, suit: 2 },
      ];
      gameState.currentMove.play = 'chop';
      gameState.currentMove.player = testPlayer1;

      const playerAction = {
        name: testPlayer2,
        action: 'play',
        cardsPlayed: [
          { id: 0, value: 4, suit: 1 },
          { id: 0, value: 4, suit: 2 },
          { id: 0, value: 5, suit: 3 },
          { id: 0, value: 5, suit: 2 },
          { id: 0, value: 6, suit: 3 },
          { id: 0, value: 6, suit: 2 },
          { id: 0, value: 7, suit: 3 },
          { id: 0, value: 7, suit: 2 },
        ],
      };
      const result = updateGameStateFromPlay(
        testPlayer2,
        playerAction,
        gameState,
      );

      expect(result.success).toBe(false);
      expect(result.updatedGameState).toStrictEqual({
        turnRotation: [testPlayer1.toString(), testPlayer2.toString()],
        currentMove: {
          cards: gameState.currentMove.cards,
          play: gameState.currentMove.play,
          player: gameState.currentMove.player.toString(),
          playersInPlay: [testPlayer1.toString(), testPlayer2.toString()],
        },
        playerStates: [
          {
            player: testPlayer1.toString(),
            cardCount: 2,
          },
          {
            player: testPlayer2.toString(),
            cardCount: 3,
          },
        ],
      });
    });

    test("can't be beat by a lower chop of same size", () => {
      gameState.currentMove.cards = [
        { id: 0, value: 7, suit: 1 },
        { id: 0, value: 7, suit: 2 },
        { id: 0, value: 8, suit: 3 },
        { id: 0, value: 8, suit: 1 },
        { id: 0, value: 9, suit: 2 },
        { id: 0, value: 9, suit: 3 },
      ];
      gameState.currentMove.play = 'chop';
      gameState.currentMove.player = testPlayer1;

      const playerAction = {
        name: testPlayer2,
        action: 'play',
        cardsPlayed: [
          { id: 0, value: 1, suit: 1 },
          { id: 0, value: 1, suit: 2 },
          { id: 0, value: 2, suit: 3 },
          { id: 0, value: 2, suit: 1 },
          { id: 0, value: 3, suit: 2 },
          { id: 0, value: 3, suit: 3 },
        ],
      };
      const result = updateGameStateFromPlay(
        testPlayer2,
        playerAction,
        gameState,
      );

      expect(result.success).toBe(false);
      expect(result.updatedGameState).toStrictEqual({
        turnRotation: [testPlayer1.toString(), testPlayer2.toString()],
        currentMove: {
          cards: gameState.currentMove.cards,
          play: gameState.currentMove.play,
          player: gameState.currentMove.player.toString(),
          playersInPlay: [testPlayer1.toString(), testPlayer2.toString()],
        },
        playerStates: [
          {
            player: testPlayer1.toString(),
            cardCount: 2,
          },
          {
            player: testPlayer2.toString(),
            cardCount: 3,
          },
        ],
      });
    });

    test('beat by a higher chop of same size', () => {
      gameState.turnRotation = [testPlayer2, testPlayer1];
      gameState.currentMove.playersInPlay = [testPlayer2, testPlayer1];
      gameState.currentMove.cards = [
        { id: 0, value: 2, suit: 1 },
        { id: 0, value: 2, suit: 2 },
        { id: 0, value: 3, suit: 3 },
        { id: 0, value: 3, suit: 4 },
        { id: 0, value: 4, suit: 1 },
        { id: 0, value: 4, suit: 2 },
        { id: 0, value: 5, suit: 3 },
        { id: 0, value: 5, suit: 4 },
        { id: 0, value: 6, suit: 3 },
        { id: 0, value: 6, suit: 4 },
      ];
      gameState.currentMove.play = 'chop';
      gameState.currentMove.player = testPlayer1;
      gameState.playerStates[1].cardCount = 13;

      const playerAction = {
        name: testPlayer2,
        action: 'play',
        cardsPlayed: [
          { id: 0, value: 7, suit: 1 },
          { id: 0, value: 7, suit: 2 },
          { id: 0, value: 8, suit: 3 },
          { id: 0, value: 8, suit: 4 },
          { id: 0, value: 9, suit: 1 },
          { id: 0, value: 9, suit: 2 },
          { id: 0, value: 10, suit: 3 },
          { id: 0, value: 10, suit: 4 },
          { id: 0, value: 11, suit: 3 },
          { id: 0, value: 11, suit: 4 },
        ],
      };
      const result = updateGameStateFromPlay(
        testPlayer2,
        playerAction,
        gameState,
      );

      expect(result.success).toBe(true);
      expect(result.updatedGameState).toStrictEqual({
        turnRotation: [testPlayer1.toString(), testPlayer2.toString()],
        currentMove: {
          cards: playerAction.cardsPlayed,
          play: gameState.currentMove.play,
          player: playerAction.name.toString(),
          playersInPlay: [testPlayer1.toString(), testPlayer2.toString()],
        },
        playerStates: [
          {
            player: testPlayer1.toString(),
            cardCount: 2,
          },
          {
            player: testPlayer2.toString(),
            cardCount: 3,
          },
        ],
      });
    });
  });
});
