/* eslint-disable react/jsx-props-no-spreading */
import { render } from '@testing-library/react';
import Table, { ComponentProps } from './Table';

describe('Table', () => {
  const mockProps: ComponentProps = {
    gameState: {
      turnRotation: [],
      currentMove: {
        cards: [],
        play: '',
        player: '',
        playersInPlay: [],
      },
      playerStates: [
        {
          player: '',
          cards: [],
          placementRank: 0,
        },
      ],
      nextPlacementRank: 1,
    },
    playCards: [],
    handCards: [],
    handleSelectPlayCard: jest.fn(),
    handleSelectHandCard: jest.fn(),
  };

  test('should render default Table', async () => {
    render(<Table {...mockProps} />);
  });

  test('should render start of game', async () => {
    const turnRotation = ['c', 'd', 'a', 'b'];
    const currentMove = {
      cards: [],
      play: '',
      player: 'c',
      playersInPlay: turnRotation,
    };
    const playerStates = [
      {
        player: 'a',
        cards: [
          {
            id: 5,
            value: 4,
            suit: 2,
          },
          {
            id: 6,
            value: 4,
            suit: 3,
          },
        ],
        placementRank: 0,
      },
      {
        player: 'b',
        cards: [
          {
            id: 7,
            value: 4,
            suit: 4,
          },
          {
            id: 8,
            value: 5,
            suit: 1,
          },
        ],
        placementRank: 0,
      },
      {
        player: 'c',
        cards: [
          {
            id: 0,
            value: 3,
            suit: 1,
          },
          {
            id: 3,
            value: 3,
            suit: 4,
          },
        ],
        placementRank: 0,
      },
      {
        player: 'd',
        cards: [
          {
            id: 11,
            value: 5,
            suit: 4,
          },
          {
            id: 12,
            value: 6,
            suit: 1,
          },
        ],
        placementRank: 0,
      },
    ];
    const mockPropsCopy: ComponentProps = {
      ...mockProps,
      gameState: {
        ...mockProps.gameState,
        turnRotation,
        currentMove,
        playerStates,
      },
    };

    const { getByTestId } = render(<Table {...mockPropsCopy} />);

    turnRotation.forEach((player) => {
      const playerElem = getByTestId(player);

      if (player === 'c') {
        expect(playerElem).toHaveClass('currentTurnPlayer');
      } else {
        expect(playerElem).toHaveClass('player');
      }
    });
  });

  test('should render move played and passed', async () => {
    const turnRotation = ['a', 'b', 'c', 'd'];
    const currentMove = {
      cards: [{ id: 0, value: 3, suit: 1 }],
      play: 'single',
      player: 'c',
      playersInPlay: ['a', 'b', 'c'],
    };
    const playerStates = [
      {
        player: 'a',
        cards: [
          {
            id: 5,
            value: 4,
            suit: 2,
          },
          {
            id: 6,
            value: 4,
            suit: 3,
          },
        ],
        placementRank: 0,
      },
      {
        player: 'b',
        cards: [
          {
            id: 7,
            value: 4,
            suit: 4,
          },
          {
            id: 8,
            value: 5,
            suit: 1,
          },
        ],
        placementRank: 0,
      },
      {
        player: 'c',
        cards: [
          {
            id: 3,
            value: 3,
            suit: 4,
          },
        ],
        placementRank: 0,
      },
      {
        player: 'd',
        cards: [
          {
            id: 11,
            value: 5,
            suit: 4,
          },
          {
            id: 12,
            value: 6,
            suit: 1,
          },
        ],
        placementRank: 0,
      },
    ];
    const mockPropsCopy: ComponentProps = {
      ...mockProps,
      gameState: {
        ...mockProps.gameState,
        turnRotation,
        currentMove,
        playerStates,
      },
    };

    const { getByTestId } = render(<Table {...mockPropsCopy} />);

    turnRotation.forEach((player) => {
      const playerElem = getByTestId(player);

      expect(playerElem).toBeInTheDocument();

      if (player === currentMove.playersInPlay[0]) {
        expect(playerElem).toHaveClass('currentTurnPlayer');
      } else {
        expect(playerElem).toHaveClass('player');
      }
    });
  });

  test('should render current play section', async () => {
    const currentMove = {
      cards: [
        {
          id: 3,
          value: 3,
          suit: 4,
        },
      ],
      play: '',
      player: 'c',
      playersInPlay: ['c', 'd', 'a', 'b'],
    };
    const mockPropsCopy: ComponentProps = {
      ...mockProps,
      gameState: {
        ...mockProps.gameState,
        currentMove,
      },
    };

    const { getByText } = render(<Table {...mockPropsCopy} />);

    expect(getByText('Current Play')).toBeInTheDocument();
  });

  test('should render play cards section', async () => {
    const playCards = [
      {
        id: 3,
        value: 3,
        suit: 4,
      },
    ];
    const mockPropsCopy: ComponentProps = {
      ...mockProps,
      playCards,
    };

    const { getByText } = render(<Table {...mockPropsCopy} />);

    expect(getByText('Your Play')).toBeInTheDocument();
  });

  test('should render your hand section', async () => {
    const { getByText } = render(<Table {...mockProps} />);

    expect(getByText('Your Hand')).toBeInTheDocument();
  });
});
