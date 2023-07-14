import { gql, useMutation } from '@apollo/client';

const HOST_GAME = gql`
  mutation hostGame($gameInput: GameInput!) {
    hostGame(gameInput: $gameInput) {
      token
    }
  }
`;

interface Token {
  token: string;
}

interface HostGameMutationData {
  hostGame: Token;
}

interface HostGameMutationVariables {
  gameInput: {
    name: string;
    roomName: string;
  };
}

const useHostGame = (name: string, roomName: string) => {
  const [hostGameMutation] = useMutation<
    HostGameMutationData,
    HostGameMutationVariables
  >(HOST_GAME);

  const hostGame = async () => {
    try {
      const { data } = await hostGameMutation({
        variables: {
          gameInput: {
            name,
            roomName,
          },
        },
      });

      return { data: data?.hostGame };
    } catch (error) {
      return { error };
    }
  };

  return hostGame;
};

export default useHostGame;
