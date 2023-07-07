/* eslint-disable no-console */
import { useNavigate } from 'react-router-dom';
import { gql, useMutation, useSubscription } from '@apollo/client';

interface Card {
  id: number;
  value: number;
  suit: number;
}
interface CurrentMove {
  cards: [Card];
  play: string;
  player: string;
  playersInPlay: [string];
}
interface PlayerState {
  player: string;
  cardCount: number;
}
interface GameState {
  turnRotation: [string];
  currentMove: CurrentMove;
  playerStates: [PlayerState];
}
interface SubscriptionData {
  gameStart: {
    cards: Card[];
    gameState: GameState;
  };
}

const GAME_START_SUBSCRIPTION = gql`
  subscription OnStartGame {
    gameStart {
      cards {
        value
        suit
      }
      gameState {
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
        }
        playerStates {
          player
          cardCount
        }
      }
    }
  }
`;
const START_GAME = gql`
  mutation startGame {
    startGame
  }
`;

// pass prop to specify if user is the host or not
// if yes then show start game otherwise show waiting to start game or something
const Lobby = () => {
  const navigate = useNavigate();
  const [startGame] = useMutation(START_GAME);
  console.log('Lobby token', localStorage.getItem('user-token'));
  console.log('subscribed to game start');
  useSubscription<SubscriptionData>(GAME_START_SUBSCRIPTION, {
    onData: ({ data }) => {
      console.log('sub data', data);
      const subData = data.data?.gameStart;
      if (subData) {
        const { cards, gameState } = subData;
        navigate('/game', {
          state: {
            cards,
            gameState,
          },
        });
      }
    },
  });
  console.log('subscribed');

  const handleStartGame = async () => {
    console.log('start game clicked');
    // starting a game returns the gamestate and cards
    // gamestate should be returned with its id
    // navigate(`/game:${event.target.value}`);
    const data = await startGame();
    console.log('startGame', data);
    // navigate('/game');
  };

  return (
    <div>
      <header className='App-header'>
        <p>Big 2</p>
      </header>
      <button
        type='button'
        onClick={() => handleStartGame}
      >
        Start Game
      </button>
      {/* <p>{!loading && data.gameStart}</p> */}
    </div>
  );
};

export default Lobby;
