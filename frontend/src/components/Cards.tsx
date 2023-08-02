import React, { MouseEventHandler } from 'react';
import { Card } from '../schema';
import CardComponent from './CardComponent';
import '../styles.css';

interface ComponentProps {
  cards: Card[];
  handleSelectCard?: MouseEventHandler<HTMLButtonElement>;
}

const Cards: React.FC<ComponentProps> = ({ cards, handleSelectCard }) => (
  <ol className='cardsAlign table'>
    {cards.map((card) => (
      <CardComponent
        key={card.id}
        card={card}
        onClick={handleSelectCard}
      />
    ))}
  </ol>
);

Cards.defaultProps = {
  handleSelectCard: undefined,
};

export default Cards;
