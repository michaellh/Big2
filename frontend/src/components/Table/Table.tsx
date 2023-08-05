import React, { MouseEventHandler } from 'react';
import { Divider } from '@mui/material';
import { GameState, Card } from '../../schema';
import Cards from '../Cards';

export interface ComponentProps {
  gameState: GameState;
  playCards: Card[];
  handCards: Card[];
  handleSelectPlayCard: MouseEventHandler<HTMLButtonElement>;
  handleSelectHandCard: MouseEventHandler<HTMLButtonElement>;
}

const Table: React.FC<ComponentProps> = ({
  gameState,
  playCards,
  handCards,
  handleSelectPlayCard,
  handleSelectHandCard,
}) => {
  const { playerStates, currentMove } = gameState;

  return (
    <div className='playTable playingCards fourColours'>
      <div className='playerRotation'>
        {playerStates.map((playerState) => {
          const { player, cards } = playerState;

          if (playerState) {
            return (
              <h4
                key={player}
                data-testid={player}
                className={
                  currentMove.playersInPlay[0] === player
                    ? 'currentTurnPlayer'
                    : 'player'
                }
              >
                {`${player} # of Cards: ${cards.length}`}
              </h4>
            );
          }
          return null;
        })}
      </div>
      <Divider flexItem>Current Play</Divider>
      <Cards cards={currentMove.cards} />
      {currentMove.cards.length > 0 ? (
        <p>{`Played by ${currentMove.player}`}</p>
      ) : null}
      <Divider flexItem>Your Play</Divider>
      <Cards
        cards={playCards}
        handleSelectCard={handleSelectPlayCard}
      />
      <Divider flexItem>Your Hand</Divider>
      <Cards
        cards={handCards}
        handleSelectCard={handleSelectHandCard}
      />
    </div>
  );
};

export default Table;
