import { useNavigate } from 'react-router-dom';
import { gql, useSubscription } from '@apollo/client';
import { Card, GameState } from '../schema';

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
        id
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
          cards {
            id
            value
            suit
          }
          placementRank
        }
        nextPlacementRank
      }
    }
  }
`;

const useGameStartSubscription = (
  name: string | undefined,
  playerType: string | undefined,
) => {
  const navigate = useNavigate();

  useSubscription<SubscriptionData>(GAME_START_SUBSCRIPTION, {
    onData: ({ data }) => {
      const subData = data.data?.gameStart;
      if (subData) {
        const { cards, gameState } = subData;
        navigate('/game', {
          state: {
            name,
            playerType,
            cards,
            gameState,
          },
        });
      }
    },
    onError: (error) => {
      alert(error.message);
    },
  });
};

export default useGameStartSubscription;
