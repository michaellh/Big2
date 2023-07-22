import { MouseEventHandler } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayerState, GameState } from '../schema';

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
    <div>
      <div>Game Over!</div>
      <div>Last Move: </div>
      {gameState.currentMove.cards.map(
        (card: { id: number; value: number; suit: number }) => (
          <div key={card.id}>
            {card.value} {card.suit}
          </div>
        ),
      )}
      {gameState.playerStates.map((playerState: PlayerState) => (
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
