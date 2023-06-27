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
} from "../utils/resolvers_helpers";
import { deckOfCards } from "../utils/test_data";
import { Card, GameState } from "../schema";

describe("selectRandomCards", () => {
  test("with 2 players", () => {
    const result = selectRandomCards(deckOfCards, 2);

    expect(result[0]).toHaveLength(13);
    expect(result[1]).toHaveLength(13);
  });

  test("with 3 players", () => {
    const result = selectRandomCards(deckOfCards, 3);

    expect(result[0]).toHaveLength(13);
    expect(result[1]).toHaveLength(13);
    expect(result[2]).toHaveLength(13);
  });

  test("with 4 players", () => {
    const result = selectRandomCards(deckOfCards, 4);

    expect(result[0]).toHaveLength(13);
    expect(result[1]).toHaveLength(13);
    expect(result[2]).toHaveLength(13);
    expect(result[3]).toHaveLength(13);
  });

  test("with unique cards", () => {
    const result = selectRandomCards(deckOfCards, 2);

    expect(result[0][0].id).not.toBe(result[1][0].id);
  });
});

describe("isSingle", () => {
  test("with 1 card", () => {
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

  test("with 2 cards", () => {
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

describe("isPair", () => {
  test("with 1 card", () => {
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

  test("with 2 cards with the same value", () => {
    const cards: Card[] = [
      { id: 4, value: 2, suit: 3 },
      { id: 5, value: 2, suit: 4 },
    ];
    const result = isPair(cards);

    expect(result).toBe(true);
  });

  test("with 2 cards with different values", () => {
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

describe("isTriple", () => {
  test("with 1 card", () => {
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

  test("with 3 cards with the same value", () => {
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

  test("with 3 cards with different values", () => {
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

describe("isBomb", () => {
  test("with 1 card", () => {
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

  test("with 4 cards with the same value", () => {
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

  test("with 4 cards with different values", () => {
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

describe("isStraight", () => {
  test("with 1 card", () => {
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

  test("with 3 cards with sequential values", () => {
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

  test("with 4 cards with non-sequential values", () => {
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

describe("isChop", () => {
  test("with 1 card", () => {
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

  test("with 11 cards", () => {
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

  test("with 3 pairs of sequential values", () => {
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

  test("with 4 pairs with non-sequential values", () => {
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

  test("with 4 pairs of sequential values", () => {
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

  test("with 5 pairs of sequential values", () => {
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

describe("isCardHigher", () => {
  test("with one card higher in value", () => {
    const cards = [
      { id: 0, value: 2, suit: 1 },
      { id: 1, value: 1, suit: 1 },
    ];

    expect(isCardHigher(cards[0], cards[1])).toBe(true);
  });

  test("with same values, but one is higher in suit", () => {
    const cards = [
      { id: 0, value: 1, suit: 2 },
      { id: 1, value: 1, suit: 1 },
    ];

    expect(isCardHigher(cards[0], cards[1])).toBe(true);
  });
});

describe("updateCurrentMove", () => {
  let gameState: GameState = {
    turnRotation: ["Tester", "Michael"],
    currentMove: {
      cards: [],
      type: "",
      player: "",
      playersInPlay: ["Tester", "Michael"],
    },
    playerStates: [
      {
        player: "Tester",
        cardCount: 2,
      },
      {
        player: "Michael",
        cardCount: 3,
      },
    ],
  };

  test("when a player plays cards", () => {
    const playerAction = {
      name: "Tester",
      action: "play",
      cardsPlayed: [{ id: 0, value: 1, suit: 1 }],
    };
    updateCurrentMove(gameState, "single", playerAction);

    expect(gameState).toStrictEqual({
      turnRotation: ["Michael", "Tester"],
      currentMove: {
        cards: playerAction.cardsPlayed,
        type: "single",
        player: "Tester",
        playersInPlay: ["Tester", "Michael"],
      },
      playerStates: [
        {
          player: "Tester",
          cardCount: 1,
        },
        {
          player: "Michael",
          cardCount: 3,
        },
      ],
    });
  });
});

describe("updateGameStateFromPlay", () => {
  let gameState: GameState;

  beforeEach(() => {
    gameState = {
      turnRotation: ["Tester", "Michael"],
      currentMove: {
        cards: [],
        type: "",
        player: "",
        playersInPlay: ["Tester", "Michael"],
      },
      playerStates: [
        {
          player: "Tester",
          cardCount: 2,
        },
        {
          player: "Michael",
          cardCount: 3,
        },
      ],
    };
  });

  test("when no cards have been played yet", () => {
    const playerAction = {
      name: "Tester",
      action: "play",
      cardsPlayed: [{ id: 0, value: 1, suit: 1 }],
    };
    const result = updateGameStateFromPlay(playerAction, gameState);

    expect(result.updatedGameState).toStrictEqual({
      turnRotation: ["Michael", "Tester"],
      currentMove: {
        cards: playerAction.cardsPlayed,
        type: "single",
        player: "Tester",
        playersInPlay: ["Tester", "Michael"],
      },
      playerStates: [
        {
          player: "Tester",
          cardCount: 1,
        },
        {
          player: "Michael",
          cardCount: 3,
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  describe("single", () => {
    test("can't be beat by a lower single", () => {
      gameState.currentMove.cards = [{ id: 0, value: 2, suit: 1 }];
      gameState.currentMove.type = "single";
      gameState.currentMove.player = "Tester";

      const playerAction = {
        name: "Michael",
        action: "play",
        cardsPlayed: [{ id: 0, value: 1, suit: 1 }],
      };
      const result = updateGameStateFromPlay(playerAction, gameState);

      expect(result.updatedGameState).toMatchObject(gameState);
      expect(result.success).toBe(false);
    });

    test("beat by a higher single", () => {
      gameState.turnRotation = ["Michael", "Tester"];
      gameState.currentMove.cards = [{ id: 0, value: 2, suit: 1 }];
      gameState.currentMove.type = "single";
      gameState.currentMove.player = "Tester";

      const playerAction = {
        name: "Michael",
        action: "play",
        cardsPlayed: [{ id: 4, value: 2, suit: 2 }],
      };
      const result = updateGameStateFromPlay(playerAction, gameState);

      expect(result.updatedGameState).toStrictEqual({
        turnRotation: ["Tester", "Michael"],
        currentMove: {
          cards: playerAction.cardsPlayed,
          type: gameState.currentMove.type,
          player: playerAction.name,
          playersInPlay: gameState.currentMove.playersInPlay,
        },
        playerStates: [
          {
            player: "Tester",
            cardCount: 2,
          },
          {
            player: "Michael",
            cardCount: 2,
          },
        ],
      });
      expect(result.success).toBe(true);
    });

    test("when current move = single 2 & is beat by a chop", () => {
      gameState.turnRotation = ["Michael", "Tester"];
      gameState.currentMove.cards = [{ id: 0, value: 15, suit: 1 }];
      gameState.currentMove.type = "single";
      gameState.currentMove.player = "Tester";
      gameState.playerStates[1].cardCount = 7;

      const playerAction = {
        name: "Michael",
        action: "play",
        cardsPlayed: [
          { id: 4, value: 2, suit: 2 },
          { id: 5, value: 2, suit: 3 },
          { id: 6, value: 3, suit: 2 },
          { id: 7, value: 3, suit: 3 },
          { id: 8, value: 4, suit: 2 },
          { id: 9, value: 4, suit: 3 },
        ],
      };
      const result = updateGameStateFromPlay(playerAction, gameState);

      expect(result.updatedGameState).toStrictEqual({
        turnRotation: ["Tester", "Michael"],
        currentMove: {
          cards: playerAction.cardsPlayed,
          type: "chop",
          player: playerAction.name,
          playersInPlay: gameState.currentMove.playersInPlay,
        },
        playerStates: [
          {
            player: "Tester",
            cardCount: 2,
          },
          {
            player: "Michael",
            cardCount: 1,
          },
        ],
      });
      expect(result.success).toBe(true);
    });

    test("when current move = single 2 & is beat by a bomb", () => {
      gameState.turnRotation = ["Michael", "Tester"];
      gameState.currentMove.cards = [{ id: 0, value: 15, suit: 1 }];
      gameState.currentMove.type = "single";
      gameState.currentMove.player = "Tester";
      gameState.playerStates[1].cardCount = 7;

      const playerAction = {
        name: "Michael",
        action: "play",
        cardsPlayed: [
          { id: 4, value: 4, suit: 1 },
          { id: 5, value: 4, suit: 2 },
          { id: 6, value: 4, suit: 3 },
          { id: 7, value: 4, suit: 4 },
        ],
      };
      const result = updateGameStateFromPlay(playerAction, gameState);

      expect(result.updatedGameState).toStrictEqual({
        turnRotation: ["Tester", "Michael"],
        currentMove: {
          cards: playerAction.cardsPlayed,
          type: "bomb",
          player: playerAction.name,
          playersInPlay: gameState.currentMove.playersInPlay,
        },
        playerStates: [
          {
            player: "Tester",
            cardCount: 2,
          },
          {
            player: "Michael",
            cardCount: 3,
          },
        ],
      });
      expect(result.success).toBe(true);
    });
  });

  describe("pair", () => {
    test("can't be beat by a lower pair", () => {
      gameState.currentMove.cards = [
        { id: 0, value: 2, suit: 3 },
        { id: 0, value: 2, suit: 4 },
      ];
      gameState.currentMove.type = "pair";
      gameState.currentMove.player = "Tester";

      const playerAction = {
        name: "Michael",
        action: "play",
        cardsPlayed: [
          { id: 0, value: 2, suit: 1 },
          { id: 0, value: 2, suit: 2 },
        ],
      };
      const result = updateGameStateFromPlay(playerAction, gameState);

      expect(result.updatedGameState).toMatchObject(gameState);
      expect(result.success).toBe(false);
    });

    test("beat by a higher pair", () => {
      gameState.turnRotation = ["Michael", "Tester"];
      gameState.currentMove.cards = [
        { id: 0, value: 2, suit: 1 },
        { id: 0, value: 2, suit: 2 },
      ];
      gameState.currentMove.type = "pair";
      gameState.currentMove.player = "Tester";

      const playerAction = {
        name: "Michael",
        action: "play",
        cardsPlayed: [
          { id: 4, value: 2, suit: 3 },
          { id: 5, value: 2, suit: 4 },
        ],
      };
      const result = updateGameStateFromPlay(playerAction, gameState);

      expect(result.updatedGameState).toStrictEqual({
        turnRotation: ["Tester", "Michael"],
        currentMove: {
          cards: playerAction.cardsPlayed,
          type: gameState.currentMove.type,
          player: playerAction.name,
          playersInPlay: gameState.currentMove.playersInPlay,
        },
        playerStates: [
          {
            player: "Tester",
            cardCount: 2,
          },
          {
            player: "Michael",
            cardCount: 1,
          },
        ],
      });
      expect(result.success).toBe(true);
    });

    test("when current move = pair 2s & is beat by a 4 chop", () => {
      gameState.turnRotation = ["Michael", "Tester"];
      gameState.currentMove.cards = [
        { id: 0, value: 15, suit: 1 },
        { id: 0, value: 15, suit: 2 },
      ];
      gameState.currentMove.type = "pair";
      gameState.currentMove.player = "Tester";
      gameState.playerStates[1].cardCount = 10;

      const playerAction = {
        name: "Michael",
        action: "play",
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
      const result = updateGameStateFromPlay(playerAction, gameState);

      expect(result.updatedGameState).toStrictEqual({
        turnRotation: ["Tester", "Michael"],
        currentMove: {
          cards: playerAction.cardsPlayed,
          type: "chop",
          player: playerAction.name,
          playersInPlay: gameState.currentMove.playersInPlay,
        },
        playerStates: [
          {
            player: "Tester",
            cardCount: 2,
          },
          {
            player: "Michael",
            cardCount: 2,
          },
        ],
      });
      expect(result.success).toBe(true);
    });
  });

  describe("triple", () => {
    test("can't be beat by a lower triple", () => {
      gameState.currentMove.cards = [
        { id: 0, value: 5, suit: 2 },
        { id: 0, value: 5, suit: 3 },
        { id: 0, value: 5, suit: 4 },
      ];
      gameState.currentMove.type = "triple";
      gameState.currentMove.player = "Tester";

      const playerAction = {
        name: "Michael",
        action: "play",
        cardsPlayed: [
          { id: 0, value: 3, suit: 1 },
          { id: 0, value: 3, suit: 2 },
          { id: 0, value: 3, suit: 3 },
        ],
      };
      const result = updateGameStateFromPlay(playerAction, gameState);

      expect(result.updatedGameState).toMatchObject(gameState);
      expect(result.success).toBe(false);
    });

    test("beat by a higher triple", () => {
      gameState.turnRotation = ["Michael", "Tester"];
      gameState.currentMove.cards = [
        { id: 0, value: 2, suit: 1 },
        { id: 0, value: 2, suit: 2 },
        { id: 0, value: 2, suit: 3 },
      ];
      gameState.currentMove.type = "triple";
      gameState.currentMove.player = "Tester";

      const playerAction = {
        name: "Michael",
        action: "play",
        cardsPlayed: [
          { id: 3, value: 7, suit: 2 },
          { id: 4, value: 7, suit: 3 },
          { id: 5, value: 7, suit: 4 },
        ],
      };
      const result = updateGameStateFromPlay(playerAction, gameState);

      expect(result.updatedGameState).toStrictEqual({
        turnRotation: ["Tester", "Michael"],
        currentMove: {
          cards: playerAction.cardsPlayed,
          type: gameState.currentMove.type,
          player: playerAction.name,
          playersInPlay: gameState.currentMove.playersInPlay,
        },
        playerStates: [
          {
            player: "Tester",
            cardCount: 2,
          },
          {
            player: "Michael",
            cardCount: 0,
          },
        ],
      });
      expect(result.success).toBe(true);
    });

    test("when current move = triple 2s & is beat by a 5 chop", () => {
      gameState.turnRotation = ["Michael", "Tester"];
      gameState.currentMove.cards = [
        { id: 0, value: 15, suit: 1 },
        { id: 0, value: 15, suit: 2 },
        { id: 0, value: 15, suit: 3 },
      ];
      gameState.currentMove.type = "triple";
      gameState.currentMove.player = "Tester";
      gameState.playerStates[1].cardCount = 10;

      const playerAction = {
        name: "Michael",
        action: "play",
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
      const result = updateGameStateFromPlay(playerAction, gameState);

      expect(result.updatedGameState).toStrictEqual({
        turnRotation: ["Tester", "Michael"],
        currentMove: {
          cards: playerAction.cardsPlayed,
          type: "chop",
          player: playerAction.name,
          playersInPlay: gameState.currentMove.playersInPlay,
        },
        playerStates: [
          {
            player: "Tester",
            cardCount: 2,
          },
          {
            player: "Michael",
            cardCount: 0,
          },
        ],
      });
      expect(result.success).toBe(true);
    });
  });

  describe("bomb", () => {
    test("can't be beat by a lower bomb", () => {
      gameState.currentMove.cards = [
        { id: 0, value: 5, suit: 1 },
        { id: 0, value: 5, suit: 2 },
        { id: 0, value: 5, suit: 3 },
        { id: 0, value: 5, suit: 4 },
      ];
      gameState.currentMove.type = "bomb";
      gameState.currentMove.player = "Tester";

      const playerAction = {
        name: "Michael",
        action: "play",
        cardsPlayed: [
          { id: 0, value: 3, suit: 1 },
          { id: 0, value: 3, suit: 2 },
          { id: 0, value: 3, suit: 3 },
          { id: 0, value: 3, suit: 4 },
        ],
      };
      const result = updateGameStateFromPlay(playerAction, gameState);

      expect(result.updatedGameState).toMatchObject(gameState);
      expect(result.success).toBe(false);
    });

    test("beat by a higher bomb", () => {
      gameState.turnRotation = ["Michael", "Tester"];
      gameState.currentMove.cards = [
        { id: 0, value: 2, suit: 1 },
        { id: 0, value: 2, suit: 2 },
        { id: 0, value: 2, suit: 3 },
        { id: 0, value: 2, suit: 4 },
      ];
      gameState.currentMove.type = "bomb";
      gameState.currentMove.player = "Tester";
      gameState.playerStates[1].cardCount = 10;

      const playerAction = {
        name: "Michael",
        action: "play",
        cardsPlayed: [
          { id: 2, value: 7, suit: 1 },
          { id: 3, value: 7, suit: 2 },
          { id: 4, value: 7, suit: 3 },
          { id: 5, value: 7, suit: 4 },
        ],
      };
      const result = updateGameStateFromPlay(playerAction, gameState);

      expect(result.updatedGameState).toStrictEqual({
        turnRotation: ["Tester", "Michael"],
        currentMove: {
          cards: playerAction.cardsPlayed,
          type: gameState.currentMove.type,
          player: playerAction.name,
          playersInPlay: gameState.currentMove.playersInPlay,
        },
        playerStates: [
          {
            player: "Tester",
            cardCount: 2,
          },
          {
            player: "Michael",
            cardCount: 6,
          },
        ],
      });
      expect(result.success).toBe(true);
    });
  });

  describe("straight", () => {
    test("can't be beat by a mismatched straight size", () => {
      gameState.currentMove.cards = [
        { id: 0, value: 4, suit: 1 },
        { id: 0, value: 5, suit: 2 },
        { id: 0, value: 6, suit: 3 },
        { id: 0, value: 7, suit: 3 },
      ];
      gameState.currentMove.type = "straight";
      gameState.currentMove.player = "Tester";

      const playerAction = {
        name: "Michael",
        action: "play",
        cardsPlayed: [
          { id: 0, value: 1, suit: 1 },
          { id: 0, value: 2, suit: 2 },
          { id: 0, value: 3, suit: 3 },
        ],
      };
      const result = updateGameStateFromPlay(playerAction, gameState);

      expect(result.updatedGameState).toMatchObject(gameState);
      expect(result.success).toBe(false);
    });

    test("can't be beat by a lower straight of same size", () => {
      gameState.currentMove.cards = [
        { id: 0, value: 4, suit: 1 },
        { id: 0, value: 5, suit: 2 },
        { id: 0, value: 6, suit: 3 },
      ];
      gameState.currentMove.type = "straight";
      gameState.currentMove.player = "Tester";

      const playerAction = {
        name: "Michael",
        action: "play",
        cardsPlayed: [
          { id: 0, value: 1, suit: 1 },
          { id: 0, value: 2, suit: 2 },
          { id: 0, value: 3, suit: 3 },
        ],
      };
      const result = updateGameStateFromPlay(playerAction, gameState);

      expect(result.updatedGameState).toMatchObject(gameState);
      expect(result.success).toBe(false);
    });

    test("beat by a higher straight of same size", () => {
      gameState.turnRotation = ["Michael", "Tester"];
      gameState.currentMove.cards = [
        { id: 0, value: 1, suit: 1 },
        { id: 0, value: 2, suit: 2 },
        { id: 0, value: 3, suit: 3 },
        { id: 0, value: 4, suit: 4 },
      ];
      gameState.currentMove.type = "straight";
      gameState.currentMove.player = "Tester";
      gameState.playerStates[1].cardCount = 10;

      const playerAction = {
        name: "Michael",
        action: "play",
        cardsPlayed: [
          { id: 2, value: 5, suit: 1 },
          { id: 3, value: 6, suit: 2 },
          { id: 4, value: 7, suit: 3 },
          { id: 5, value: 8, suit: 4 },
        ],
      };
      const result = updateGameStateFromPlay(playerAction, gameState);

      expect(result.updatedGameState).toStrictEqual({
        turnRotation: ["Tester", "Michael"],
        currentMove: {
          cards: playerAction.cardsPlayed,
          type: gameState.currentMove.type,
          player: playerAction.name,
          playersInPlay: gameState.currentMove.playersInPlay,
        },
        playerStates: [
          {
            player: "Tester",
            cardCount: 2,
          },
          {
            player: "Michael",
            cardCount: 6,
          },
        ],
      });
      expect(result.success).toBe(true);
    });
  });

  describe("chop", () => {
    test("can't be beat by a mismatched chop size", () => {
      gameState.currentMove.cards = [
        { id: 0, value: 1, suit: 1 },
        { id: 0, value: 1, suit: 2 },
        { id: 0, value: 2, suit: 1 },
        { id: 0, value: 2, suit: 2 },
        { id: 0, value: 3, suit: 1 },
        { id: 0, value: 3, suit: 2 },
      ];
      gameState.currentMove.type = "chop";
      gameState.currentMove.player = "Tester";

      const playerAction = {
        name: "Michael",
        action: "play",
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
      const result = updateGameStateFromPlay(playerAction, gameState);

      expect(result.updatedGameState).toMatchObject(gameState);
      expect(result.success).toBe(false);
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
      gameState.currentMove.type = "chop";
      gameState.currentMove.player = "Tester";

      const playerAction = {
        name: "Michael",
        action: "play",
        cardsPlayed: [
          { id: 0, value: 1, suit: 1 },
          { id: 0, value: 1, suit: 2 },
          { id: 0, value: 2, suit: 3 },
          { id: 0, value: 2, suit: 1 },
          { id: 0, value: 3, suit: 2 },
          { id: 0, value: 3, suit: 3 },
        ],
      };
      const result = updateGameStateFromPlay(playerAction, gameState);

      expect(result.updatedGameState).toMatchObject(gameState);
      expect(result.success).toBe(false);
    });

    test("beat by a higher chop of same size", () => {
      gameState.turnRotation = ["Michael", "Tester"];
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
      gameState.currentMove.type = "chop";
      gameState.currentMove.player = "Tester";
      gameState.playerStates[1].cardCount = 10;

      const playerAction = {
        name: "Michael",
        action: "play",
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
      const result = updateGameStateFromPlay(playerAction, gameState);

      expect(result.updatedGameState).toStrictEqual({
        turnRotation: ["Tester", "Michael"],
        currentMove: {
          cards: playerAction.cardsPlayed,
          type: gameState.currentMove.type,
          player: playerAction.name,
          playersInPlay: gameState.currentMove.playersInPlay,
        },
        playerStates: [
          {
            player: "Tester",
            cardCount: 2,
          },
          {
            player: "Michael",
            cardCount: 0,
          },
        ],
      });
      expect(result.success).toBe(true);
    });
  });
});
