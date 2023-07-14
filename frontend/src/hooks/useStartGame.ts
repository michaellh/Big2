import { gql, useMutation } from '@apollo/client';

const START_GAME = gql`
  mutation startGame {
    startGame
  }
`;

const useStartGame = () => {
  const [startGameMutation] = useMutation(START_GAME);

  const startGame = async () => {
    try {
      await startGameMutation();

      return {};
    } catch (error) {
      return { error };
    }
  };

  return startGame;
};

export default useStartGame;
