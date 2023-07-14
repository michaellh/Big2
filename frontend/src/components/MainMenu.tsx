import { useState, FormEvent, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useHostGame from '../hooks/useHostGame';
import useJoinGame from '../hooks/useJoinGame';

const MainMenu = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [roomName, setRoomName] = useState('');
  const hostGame = useHostGame(name, roomName);
  const joinGame = useJoinGame(name, roomName);

  const handleGameOption = useCallback(
    async (event: FormEvent, option: string) => {
      event.preventDefault();
      localStorage.removeItem('user-token');

      const { data, error } = await (option === 'host'
        ? hostGame()
        : joinGame());

      if (error || !data) {
        alert(error);
      } else {
        localStorage.setItem('user-token', data.token);
        navigate('/lobby', {
          state: {
            name,
            playerType: option,
          },
        });
      }
    },
    [hostGame, joinGame, name, navigate],
  );

  return (
    <div>
      <h1>Lobby</h1>
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
        onClick={(event) => handleGameOption(event, 'host')}
      >
        Host Game
      </button>
      <button
        type='button'
        onClick={(event) => handleGameOption(event, 'join')}
      >
        Join Game
      </button>
    </div>
  );
};

export default MainMenu;
