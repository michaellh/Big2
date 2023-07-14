import { useLocation } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import useStartGame from '../hooks/useStartGame';
import useGameStartSubscription from '../hooks/useGameStartSubscription';

interface ILobby {
  getLobby: {
    _id: string;
    code: string;
    host: string;
    players: string[];
  };
}

const GET_LOBBY = gql`
  query getLobby {
    getLobby {
      _id
      code
      host
      players
    }
  }
`;

const Lobby = () => {
  const location = useLocation();
  const state = location.state as
    | { name: string; playerType: string }
    | undefined;
  const startGame = useStartGame();
  const {
    loading,
    error: lobbyError,
    data,
  } = useQuery<ILobby>(GET_LOBBY, {
    fetchPolicy: 'cache-and-network',
  });

  useGameStartSubscription(state?.name, state?.playerType);

  const handleStartGame = async () => {
    const { error } = await startGame();

    if (error) {
      alert(error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (lobbyError) {
    alert(lobbyError.message);
  }

  return (
    <div>
      <header className='App-header'>
        <p>Big 2</p>
      </header>
      <p>{`Room code: ${data?.getLobby.code}`}</p>
      <p>{`Room host: ${data?.getLobby.host}`}</p>
      <p>{`Hello ${state?.name}`}</p>
      <p>Player rotation:</p>
      {data?.getLobby.players.map((player) => (
        <div>{player}</div>
      ))}
      {state?.playerType === 'host' ? (
        <button
          type='button'
          onClick={handleStartGame}
        >
          Start Game
        </button>
      ) : (
        <p>Please wait for the host to start the game...</p>
      )}
    </div>
  );
};

export default Lobby;
