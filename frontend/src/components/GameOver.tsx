import { MouseEventHandler } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayerState } from '../schema';

interface GameOverProps {
  name: string | undefined;
  playerType: string | undefined;
  playerStates: PlayerState[];
}

const GameOver = ({ name, playerType, playerStates }: GameOverProps) => {
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
    <div>
      <div>Game Over!</div>
      {playerStates.map((playerState: PlayerState) => (
        <div key={playerState.player}>
          {`${playerState.player} Finish: ${playerState.placementRank}`}
        </div>
      ))}
      <button
        type='button'
        onClick={handleReturnToLobby}
      >
        Return to Lobby
      </button>
    </div>
  );
};

export default GameOver;
