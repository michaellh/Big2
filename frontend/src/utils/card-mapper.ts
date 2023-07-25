import { Card } from '../schema';
import { CARD_VALUES, SUIT_VALUES } from './enums';

const cardMapper = (card: Card) => {
  const rank = CARD_VALUES[card.value.toString()];
  const suit = SUIT_VALUES[card.suit.toString()];

  return {
    value: rank,
    suit,
  };
};

export default cardMapper;
