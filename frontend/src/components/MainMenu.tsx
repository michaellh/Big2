import { useState, FormEvent, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField } from '@mui/material';
import useHostGame from '../hooks/useHostGame';
import useJoinGame from '../hooks/useJoinGame';
import '../styles.css';

interface FormError {
  message: string;
}

const MainMenu = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [formError, setFormError] = useState('');
  const hostGame = useHostGame(name, roomName);
  const joinGame = useJoinGame(name, roomName);
  const prevRoomNameRef = useRef<string>('');

  useEffect(() => {
    if (roomName !== prevRoomNameRef.current) {
      setFormError('');
      prevRoomNameRef.current = roomName;
    }
  }, [roomName]);

  const handleGameOption = useCallback(
    async (event: FormEvent, option: string) => {
      event.preventDefault();
      localStorage.removeItem('user-token');

      const { data, error } = await (option === 'host'
        ? hostGame()
        : joinGame());

      if (error || !data) {
        if (error && (error as FormError).message) {
          setFormError((error as FormError).message);
        } else {
          setFormError('An unknown error occurred.');
        }
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
    <div className='main-menu'>
      <h1>Big 2</h1>
      <form className='game-form'>
        <TextField
          variant='outlined'
          label='Your Name'
          onChange={({ target }) => setName(target.value)}
        />
        <TextField
          variant='outlined'
          label='Room Name'
          onChange={({ target }) => setRoomName(target.value)}
          error={formError !== '' && roomName !== ''}
          helperText={formError !== '' && roomName !== '' ? formError : ''}
        />
        <br />
        <Button
          variant='contained'
          onClick={(event) => handleGameOption(event, 'host')}
        >
          Host Game
        </Button>
        <br />
        <Button
          variant='contained'
          onClick={(event) => handleGameOption(event, 'join')}
        >
          Join Game
        </Button>
      </form>
    </div>
  );
};

export default MainMenu;
