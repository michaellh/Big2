import { MouseEventHandler } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Divider } from '@mui/material';
import { PlayerState, GameState } from '../schema';
import Cards from './Cards';

interface GameOverProps {
  name: string | undefined;
  playerType: string | undefined;
  gameState: GameState;
}

const GameOver = ({ name, playerType, gameState }: GameOverProps) => {
  const navigate = useNavigate();

  const handleReturnToLobby: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();

    navigate('/lobby', {
      state: {
        name,
        playerType,
      },
    });
  };

  return (
    <div className='game-over playingCards fourColours'>
      <h1>Game Over!</h1>
      <div>Last move by {gameState.currentMove.player}: </div>
      <Cards cards={gameState.currentMove.cards} />
      <Divider flexItem>Rankings</Divider>
      {gameState.playerStates.map((playerState: PlayerState) => (
        <div key={playerState.player}>
          {`${playerState.player} ranked: #${playerState.placementRank}`}
        </div>
      ))}
      <br />
      <Button
        variant='contained'
        onClick={handleReturnToLobby}
      >
        Return to Lobby
      </Button>
    </div>
  );
};

export default GameOver;
