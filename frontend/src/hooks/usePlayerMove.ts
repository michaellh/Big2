import { gql, useMutation } from '@apollo/client';
import { Card } from '../schema';

export const PLAYER_MOVE = gql`
  mutation playerMove($playerAction: PlayerAction!) {
    playerMove(playerAction: $playerAction)
  }
`;

interface PlayerMoveMutationData {
  __typename: undefined;
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
      await playerMoveMutation({
        variables: {
          playerAction: {
            cardsPlayed,
            action,
          },
        },
      });
    } catch (error) {
      return error;
    }

    return undefined;
  };

  return playerMove;
};

export default usePlayerMove;
