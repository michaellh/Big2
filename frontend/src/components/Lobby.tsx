import { useLocation } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import { Button } from '@mui/material';
import useStartGame from '../hooks/useStartGame';
import useGameStartSubscription from '../hooks/useGameStartSubscription';
import '../styles.css';

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
    <div className='lobby'>
      <h3>{`Room code: ${data?.getLobby.code}`}</h3>
      <h4>{`Host: ${data?.getLobby.host}`}</h4>
      <p>{`You are ${state?.name}`}</p>
      <p>Player rotation:</p>
      {data?.getLobby.players.map((player) => (
        <div key={player}>{player}</div>
      ))}
      <br />
      {state?.playerType === 'host' ? (
        <Button
          variant='contained'
          onClick={handleStartGame}
        >
          Start Game
        </Button>
      ) : (
        <p>Please wait for the host to start the game...</p>
      )}
    </div>
  );
};

export default Lobby;
