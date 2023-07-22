import { GameState, PlayerState } from '../schema';

const Table = ({ gameState }: { gameState: GameState }) => {
  const { turnRotation, playerStates, currentMove } = gameState;

  return (
    <div>
      <h3>Table</h3>
      <div>{`Current Player's Turn: ${turnRotation.at(0)}`}</div>
      {playerStates.map((playerState: PlayerState) => (
        <div key={playerState.player}>
          {`${playerState.player} # of Cards: ${playerState.cards.length}`}
        </div>
      ))}
      <h3>Played Cards</h3>
      {currentMove.cards.map(
        (card: { id: number; value: number; suit: number }) => (
          <div key={card.id}>
            {card.value} {card.suit}
          </div>
        ),
      )}
      {currentMove.cards.length > 0 ? (
        <p>{`Played by ${currentMove.player}`}</p>
      ) : null}
    </div>
  );
};

export default Table;
