import React, { MouseEventHandler } from 'react';
import '../misc/selfthinker-CSS-Playing-Cards-7e0e0f2/cards.css';
import { Card } from '../schema';
import cardMapper from '../utils/card-mapper';

interface ComponentProps {
  card: Card;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

const CardComponent: React.FC<ComponentProps> = ({ card, onClick }) => {
  const { id, value, suit } = card;
  const { value: mappedValue, suit: mappedSuit } = cardMapper(card);

  const suitSymbols: { [key: string]: string } = {
    hearts: '♥',
    diams: '♦',
    clubs: '♣',
    spades: '♠',
  };

  return (
    <button
      key={id}
      className={`card rank-${mappedValue} ${mappedSuit}`}
      type='button'
      data-value={JSON.stringify({
        id,
        value,
        suit,
      })}
      onClick={onClick}
      disabled={!onClick}
    >
      <span className='rank'>{mappedValue}</span>
      <span className='suit'>{suitSymbols[mappedSuit]}</span>
    </button>
  );
};

CardComponent.defaultProps = {
  onClick: undefined,
};

export default CardComponent;
