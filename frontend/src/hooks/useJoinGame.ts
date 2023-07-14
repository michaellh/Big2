import { gql, useMutation } from '@apollo/client';

const JOIN_GAME = gql`
  mutation joinGame($gameInput: GameInput!) {
    joinGame(gameInput: $gameInput) {
      token
    }
  }
`;

interface Token {
  token: string;
}

interface JoinGameMutationData {
  joinGame: Token;
}

interface JoinGameMutationVariables {
  gameInput: {
    name: string;
    roomName: string;
  };
}

const useJoinGame = (name: string, roomName: string) => {
  const [joinGameMutation] = useMutation<
    JoinGameMutationData,
    JoinGameMutationVariables
  >(JOIN_GAME);

  const joinGame = async () => {
    try {
      const { data } = await joinGameMutation({
        variables: {
          gameInput: {
            name,
            roomName,
          },
        },
      });

      return { data: data?.joinGame };
    } catch (error) {
      return { error };
    }
  };

  return joinGame;
};

export default useJoinGame;
