import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { gql, useMutation } from '@apollo/client';

const HOST_GAME = gql`
  mutation hostGame($gameInput: GameInput!) {
    hostGame(gameInput: $gameInput) {
      lobbyId
      token
    }
  }
`;
const JOIN_GAME = gql`
  mutation joinGame($gameInput: GameInput!) {
    joinGame(gameInput: $gameInput) {
      lobbyId
      token
    }
  }
`;

const MainMenu = () => {
  const [name, setName] = useState('');
  const [roomName, setRoomName] = useState('');
  const navigate = useNavigate();
  const [hostGame] = useMutation(HOST_GAME);
  const [joinGame] = useMutation(JOIN_GAME);

  const handleHostGame = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    localStorage.removeItem('user-token');

    const response = await hostGame({
      variables: {
        gameInput: {
          name,
          roomName,
        },
      },
    });

    const { data } = response as {
      data: {
        hostGame: {
          token: string;
          lobbyId: string;
        };
      };
    };

    if (data) {
      localStorage.setItem('user-token', data.hostGame.token);
      navigate(`/lobby/${data.hostGame.lobbyId}`, {
        state: {
          name,
        },
      });
    }
  };

  const handleJoinGame = async (event: FormEvent) => {
    event.preventDefault();
    localStorage.removeItem('user-token');

    const response = await joinGame({
      variables: {
        gameInput: {
          name,
          roomName,
        },
      },
    });

    const { data } = response as {
      data: {
        joinGame: {
          token: string;
          lobbyId: string;
        };
      };
    };

    if (data) {
      localStorage.setItem('user-token', data.joinGame.token);
      navigate(`/lobby/${data.joinGame.lobbyId}`, {
        state: {
          name,
        },
      });
    }
  };

  return (
    <div>
      <header className='App-header'>
        <p>Big 2</p>
      </header>
      <h1>Lobby</h1>
      <h3>Host Game</h3>
      <div>
        Name
        <input
          type='text'
          value={name}
          onChange={({ target }) => setName(target.value)}
        />
      </div>
      <div>
        Room Name
        <input
          type='text'
          value={roomName}
          onChange={({ target }) => setRoomName(target.value)}
        />
      </div>
      <button
        type='button'
        onClick={handleHostGame}
      >
        Host Game
      </button>
      <button
        type='button'
        onClick={handleJoinGame}
      >
        Join Game
      </button>
    </div>
  );
};

export default MainMenu;
