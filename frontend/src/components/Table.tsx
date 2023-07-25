import React, { MouseEventHandler } from 'react';
import { Divider } from '@mui/material';
import { GameState, Card } from '../schema';
import Cards from './Cards';
import '../styles.css';

interface ComponentProps {
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
  const { playerStates, currentMove, turnRotation } = gameState;

  return (
    <div className='playTable playingCards fourColours'>
      <div className='playerRotation'>
        {turnRotation.map((player) => {
          const foundPlayerState = playerStates.find(
            (playerState) => playerState.player === player,
          );

          if (foundPlayerState) {
            return (
              <h4
                key={player}
                className={
                  currentMove.player === foundPlayerState.player
                    ? 'currentTurnPlayer'
                    : 'player'
                }
              >
                {`${player} # of Cards: ${foundPlayerState.cards.length}`}
              </h4>
            );
          }
          return null;
        })}
      </div>
      {currentMove.cards.length > 0 ? (
        <Divider flexItem>Current Play</Divider>
      ) : null}
      <Cards cards={currentMove.cards} />
      {currentMove.cards.length > 0 ? (
        <p>{`Played by ${currentMove.player}`}</p>
      ) : null}
      {playCards.length > 0 ? <Divider flexItem>Your Play</Divider> : null}
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