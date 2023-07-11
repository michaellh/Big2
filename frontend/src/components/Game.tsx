/* eslint-disable no-console */
import { useLocation, useNavigate } from 'react-router-dom';
import { gql, useSubscription, useMutation } from '@apollo/client';
import { useState, MouseEventHandler } from 'react';
import { Card, CurrentMove, GameState, PlayerState } from '../schema';

const PLAYER_MOVE_SUBSCRIPTION = gql`
  subscription OnPlayerMove {
    playerMove {
      turnRotation
      currentMove {
        cards {
          id
          value
          suit
        }
        play
        player
        playersInPlay
      }
      playerStates {
        player
        cardCount
        placementRank
      }
      nextPlacementRank
    }
  }
`;
const PLAYER_MOVE = gql`
  mutation playerMove($playerAction: PlayerAction!) {
    playerMove(playerAction: $playerAction) {
      turnRotation
      currentMove {
        cards {
          id
          value
          suit
        }
        play
        player
        playersInPlay
      }
      playerStates {
        player
        cardCount
        placementRank
      }
      nextPlacementRank
    }
  }
`;

const Game = () => {
  const [playCards, setPlayCards] = useState<Card[]>([]);
  const [handCards, setHandCards] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<GameState>({
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
        cardCount: 0,
        placementRank: 0,
      },
    ],
    nextPlacementRank: 0,
  });

  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as
    | { cards: Card[]; gameState: GameState }
    | undefined;
  if (
    state &&
    state.cards &&
    handCards.length === 0 &&
    gameState.nextPlacementRank === 0
  ) {
    console.log('set cards');
    const { cards, gameState: startGameState } = state;
    setHandCards(cards);
    setGameState(startGameState);
  }

  console.log('subscribe to player move');
  useSubscription<{
    playerMove: {
      currentMove: CurrentMove;
      playerStates: PlayerState[];
      turnRotation: string[];
      nextPlacementRank: number;
    };
  }>(PLAYER_MOVE_SUBSCRIPTION, {
    onData: ({ data }) => {
      console.log('player move sub data', data.data);
      if (data.data) {
        const { turnRotation, currentMove, playerStates, nextPlacementRank } =
          data.data.playerMove;

        setGameState({
          turnRotation,
          currentMove,
          playerStates,
          nextPlacementRank,
        });
      } else {
        /* empty */
      }
    },
  });
  console.log('subscribed');
  const [playerMove] = useMutation(PLAYER_MOVE);

  const handlePlayCards = async () => {
    console.log('play cards clicked');
    // call playermove with playeraction
    await playerMove({
      variables: {
        playerAction: {
          cardsPlayed: playCards,
          action: 'play',
        },
      },
    });
    setPlayCards([]);
  };

  const handlePass = async () => {
    console.log('pass clicked');
    // call playermove with playeraction
    await playerMove({
      variables: {
        playerAction: {
          cardsPlayed: [],
          action: 'pass',
        },
      },
    });
    // if there were any cards in the play area then return them back to hand
    const returnedCards = handCards.concat(playCards);
    setPlayCards([]);
    returnedCards.sort((a, b) => a.id - b.id);
    setHandCards(returnedCards);
  };

  const handleSelectPlayCard: MouseEventHandler<HTMLButtonElement> = (
    event,
  ) => {
    event.preventDefault();
    const target = event.currentTarget;
    const dataValue = target.getAttribute('data-value');

    if (dataValue) {
      const { id, value, suit } = JSON.parse(dataValue) as Card;
      const updatedHandCards = [...handCards, { id, value, suit }];
      updatedHandCards.sort((a, b) => a.id - b.id);
      setHandCards(updatedHandCards);
      const updatedPlayCards = playCards.filter((card) => card.id !== id);
      setPlayCards(updatedPlayCards);
    }
  };

  const handleSelectHandCard: MouseEventHandler<HTMLButtonElement> = (
    event,
  ) => {
    event.preventDefault();
    const target = event.currentTarget;
    const dataValue = target.getAttribute('data-value');

    if (dataValue) {
      const { id, value, suit } = JSON.parse(dataValue) as Card;
      const updatedPlayCards = [...playCards, { id, value, suit }];
      updatedPlayCards.sort((a, b) => a.id - b.id);
      setPlayCards(updatedPlayCards);
      const updatedHandCards = handCards.filter((card) => card.id !== id);
      setHandCards(updatedHandCards);
    }
  };

  const handleReturnToLobby: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();

    // call mutation to delete game state/end game
    navigate('/lobby');
  };

  if (gameState.nextPlacementRank === gameState.playerStates.length) {
    return (
      <div>
        <div>Game Over!</div>
        {gameState.playerStates.map((playerState: PlayerState) => (
          <div key={playerState.player}>
            {`${playerState.player} Finish: ${playerState.placementRank}`}
          </div>
        ))}
        <button
          type='button'
          onClick={handleReturnToLobby}
        >
          Return to Lobby
        </button>
      </div>
    );
  }

  return (
    <div>
      <header className='App-header'>
        <p>Big 2</p>
      </header>
      <h3>Table</h3>
      <div>{`Current Player's Turn: ${gameState.turnRotation.at(0)}`}</div>
      {gameState.playerStates.map((playerState: PlayerState) => (
        <div key={playerState.player}>
          {`${playerState.player} # of Cards: ${playerState.cardCount} Finish: ${playerState.placementRank}`}
        </div>
      ))}
      <h3>Played Cards</h3>
      {gameState.currentMove.cards.map(
        (card: { id: number; value: number; suit: number }) => (
          <div key={card.id}>
            {card.value} {card.suit}
          </div>
        ),
      )}
      <p>{`Played by ${gameState.currentMove.player}`}</p>
      <h3>Your Cards</h3>
      {playCards.map((card: { id: number; value: number; suit: number }) => (
        <div key={card.id}>
          <button
            type='button'
            data-value={JSON.stringify({
              id: card.id,
              value: card.value,
              suit: card.suit,
            })}
            onClick={handleSelectPlayCard}
          >
            {card.value} {card.suit}
          </button>
        </div>
      ))}
      <button
        type='button'
        onClick={handlePlayCards}
      >
        Play Cards
      </button>
      <button
        type='button'
        onClick={handlePass}
      >
        Pass
      </button>
      <h3>Your Hand</h3>
      {handCards.map((card: { id: number; value: number; suit: number }) => (
        <div key={card.id}>
          <button
            type='button'
            data-value={JSON.stringify({
              id: card.id,
              value: card.value,
              suit: card.suit,
            })}
            onClick={handleSelectHandCard}
          >
            {card.value} {card.suit}
          </button>
        </div>
      ))}
    </div>
  );
};

export default Game;
