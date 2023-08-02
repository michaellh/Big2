import { gql, useSubscription } from '@apollo/client';
import { CurrentMove, PlayerState, GameState } from '../schema';

interface SubscriptionData {
  playerMove: {
    currentMove: CurrentMove;
    playerStates: PlayerState[];
    turnRotation: string[];
    nextPlacementRank: number;
  };
}

export const PLAYER_MOVE_SUBSCRIPTION = gql`
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
`;

const usePlayerMoveSubscription = (
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
) => {
  useSubscription<SubscriptionData>(PLAYER_MOVE_SUBSCRIPTION, {
    onData: ({ data }) => {
      if (data.data) {
        const { turnRotation, currentMove, playerStates, nextPlacementRank } =
          data.data.playerMove;

        setGameState({
          turnRotation,
          currentMove,
          playerStates,
          nextPlacementRank,
        });
      }
    },
    onError: (error) => {
      alert(error.message);
    },
  });
};

export default usePlayerMoveSubscription;
