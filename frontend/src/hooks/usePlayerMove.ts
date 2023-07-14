import { gql, useMutation } from '@apollo/client';
import { Card, GameState } from '../schema';

const PLAYER_MOVE = gql`
  mutation playerMove($playerAction: PlayerAction!) {
    playerMove(playerAction: $playerAction)
  }
`;

interface PlayerMoveMutationData {
  playerMove: GameState;
}

interface PlayerMoveMutationVariables {
  playerAction: {
    cardsPlayed: Card[];
    action: string;
  };
}

const usePlayerMove = (cardsPlayed: Card[], action: string) => {
  const [playerMoveMutation] = useMutation<
    PlayerMoveMutationData,
    PlayerMoveMutationVariables
  >(PLAYER_MOVE);

  const playerMove = async () => {
    try {
      const { data } = await playerMoveMutation({
        variables: {
          playerAction: {
            cardsPlayed,
            action,
          },
        },
      });

      return { data: data?.playerMove };
    } catch (error) {
      return { error };
    }
  };

  return playerMove;
};

export default usePlayerMove;
