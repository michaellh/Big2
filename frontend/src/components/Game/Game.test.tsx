import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import Game from './Game';
import { Card, GameState } from '../../schema';
import { PLAYER_MOVE_SUBSCRIPTION } from '../../hooks/usePlayerMoveSubscription';
import usePlayerMove from '../../hooks/usePlayerMove';

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: '/game',
    search: '',
    hash: '',
    state: {
      name: 'tester',
      playerType: 'host',
    },
  }),
}));

jest.mock('../../hooks/usePlayerMove', () => ({
  __esModule: true,
  default: jest.fn(() => jest.fn()),
}));

const mockUseState = <T,>(initialState: T) => {
  const setState = jest.fn();
  return [initialState, setState] as const;
};

describe('Game', () => {
  const mockQueries = [
    {
      request: {
        query: PLAYER_MOVE_SUBSCRIPTION,
      },
      result: {
        data: {
          playerMove: {
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
            nextPlacementRank: 0,
          },
        },
      },
    },
  ];

  test('should render default Game', async () => {
    const [playCardsMockValue, setPlayCardsMock] = mockUseState<Card[]>([]);
    const [handCardsMockValue, setHandCardsMock] = mockUseState([]);
    const [gameStateMockValue, setGameStateMock] = mockUseState<GameState>({
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
      nextPlacementRank: 0,
    });

    jest
      .spyOn(React, 'useState')
      .mockReturnValueOnce([playCardsMockValue, setPlayCardsMock])
      .mockReturnValueOnce([handCardsMockValue, setHandCardsMock])
      .mockReturnValueOnce([gameStateMockValue, setGameStateMock]);

    const { getByTestId } = render(
      <MockedProvider
        mocks={mockQueries}
        addTypename={false}
      >
        <Game />
      </MockedProvider>,
    );

    expect(getByTestId('play')).toBeTruthy();
    expect(getByTestId('pass')).toBeTruthy();
  });

  test('play button should be disabled if no cards in play section', async () => {
    const [playCardsMockValue, setPlayCardsMock] = mockUseState<Card[]>([]);
    const [handCardsMockValue, setHandCardsMock] = mockUseState([]);
    const [gameStateMockValue, setGameStateMock] = mockUseState<GameState>({
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
      nextPlacementRank: 0,
    });

    jest
      .spyOn(React, 'useState')
      .mockReturnValueOnce([playCardsMockValue, setPlayCardsMock])
      .mockReturnValueOnce([handCardsMockValue, setHandCardsMock])
      .mockReturnValueOnce([gameStateMockValue, setGameStateMock]);

    const { getByTestId } = render(
      <MockedProvider
        mocks={mockQueries}
        addTypename={false}
      >
        <Game />
      </MockedProvider>,
    );

    const disabledPlayButton = getByTestId('play');
    expect(disabledPlayButton).toBeInTheDocument();
    expect(disabledPlayButton).toBeDisabled();
  });

  test('should see play and pass disabled if not player turn', async () => {
    const [playCardsMockValue, setPlayCardsMock] = mockUseState<Card[]>([
      { id: 0, value: 3, suit: 1 },
    ]);
    const [handCardsMockValue, setHandCardsMock] = mockUseState([]);
    const [gameStateMockValue, setGameStateMock] = mockUseState<GameState>({
      turnRotation: [],
      currentMove: {
        cards: [{ id: 1, value: 3, suit: 2 }],
        play: 'single',
        player: 'tester',
        playersInPlay: ['a', 'tester'],
      },
      playerStates: [
        {
          player: '',
          cards: [],
          placementRank: 0,
        },
      ],
      nextPlacementRank: 0,
    });

    jest
      .spyOn(React, 'useState')
      .mockReturnValueOnce([playCardsMockValue, setPlayCardsMock])
      .mockReturnValueOnce([handCardsMockValue, setHandCardsMock])
      .mockReturnValueOnce([gameStateMockValue, setGameStateMock]);

    const { getByTestId } = render(
      <MockedProvider
        mocks={mockQueries}
        addTypename={false}
      >
        <Game />
      </MockedProvider>,
    );

    const disabledPlayButton = getByTestId('play');
    expect(disabledPlayButton).toBeInTheDocument();
    expect(disabledPlayButton).toBeDisabled();

    const disabledPassButton = getByTestId('pass');
    expect(disabledPassButton).toBeInTheDocument();
    expect(disabledPassButton).toBeDisabled();
  });

  test('should see pass disabled if player has a free turn', async () => {
    const [playCardsMockValue, setPlayCardsMock] = mockUseState<Card[]>([
      { id: 0, value: 3, suit: 1 },
    ]);
    const [handCardsMockValue, setHandCardsMock] = mockUseState([]);
    const [gameStateMockValue, setGameStateMock] = mockUseState<GameState>({
      turnRotation: [],
      currentMove: {
        cards: [],
        play: '',
        player: 'tester',
        playersInPlay: ['tester', 'a'],
      },
      playerStates: [
        {
          player: '',
          cards: [],
          placementRank: 0,
        },
      ],
      nextPlacementRank: 0,
    });

    jest
      .spyOn(React, 'useState')
      .mockReturnValueOnce([playCardsMockValue, setPlayCardsMock])
      .mockReturnValueOnce([handCardsMockValue, setHandCardsMock])
      .mockReturnValueOnce([gameStateMockValue, setGameStateMock]);

    const { getByTestId } = render(
      <MockedProvider
        mocks={mockQueries}
        addTypename={false}
      >
        <Game />
      </MockedProvider>,
    );

    const disabledPassButton = getByTestId('pass');
    expect(disabledPassButton).toBeInTheDocument();
    expect(disabledPassButton).toBeDisabled();
  });

  test('should click play and pass', async () => {
    const [playCardsMockValue, setPlayCardsMock] = mockUseState<Card[]>([
      { id: 0, value: 3, suit: 1 },
    ]);
    const [handCardsMockValue, setHandCardsMock] = mockUseState([]);
    const [gameStateMockValue, setGameStateMock] = mockUseState<GameState>({
      turnRotation: [],
      currentMove: {
        cards: [{ id: 1, value: 3, suit: 2 }],
        play: 'single',
        player: 'a',
        playersInPlay: ['tester'],
      },
      playerStates: [
        {
          player: '',
          cards: [],
          placementRank: 0,
        },
      ],
      nextPlacementRank: 0,
    });

    jest
      .spyOn(React, 'useState')
      .mockReturnValueOnce([playCardsMockValue, setPlayCardsMock])
      .mockReturnValueOnce([handCardsMockValue, setHandCardsMock])
      .mockReturnValueOnce([gameStateMockValue, setGameStateMock]);

    const playerPlayMoveMock = jest.fn();
    const playerPassMoveMock = jest.fn();

    (usePlayerMove as jest.Mock)
      .mockReturnValueOnce(playerPlayMoveMock)
      .mockReturnValueOnce(playerPassMoveMock);

    const { getByTestId } = render(
      <MockedProvider
        mocks={mockQueries}
        addTypename={false}
      >
        <Game />
      </MockedProvider>,
    );

    fireEvent.click(getByTestId('play'));
    expect(playerPlayMoveMock).toHaveBeenCalledTimes(1);
    expect(playerPlayMoveMock).toHaveReturnedWith(undefined);
    fireEvent.click(getByTestId('pass'));
    expect(playerPassMoveMock).toHaveBeenCalledTimes(1);
    expect(playerPassMoveMock).toHaveReturnedWith(undefined);
  });
});
