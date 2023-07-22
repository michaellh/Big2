/* eslint-disable no-console */
import { useLocation } from 'react-router-dom';
import { useState, MouseEventHandler } from 'react';
import { Card, GameState } from '../schema';
import usePlayerMove from '../hooks/usePlayerMove';
import usePlayerMoveSubscription from '../hooks/usePlayerMoveSubscription';
import Table from './Table';
import GameOver from './GameOver';

const Game = () => {
  const [playCards, setPlayCards] = useState<Card[]>([]);
  const [handCards, setHandCards] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    turnRotation: [],
    currentMove: {
      cards: [],
      play: '',
      player: '',
      playersInPlay: [],
    },
    playerStates: [
      {
        player: '',
        cards: [],
        placementRank: 0,
      },
    ],
    nextPlacementRank: 0,
  });
  const location = useLocation();
  const playerPlayMove = usePlayerMove(playCards, 'play');
  const playerPassMove = usePlayerMove(playCards, 'pass');

  usePlayerMoveSubscription(setGameState);

  const state = location.state as
    | { name: string; playerType: string; cards: Card[]; gameState: GameState }
    | undefined;
  if (state && handCards.length === 0 && gameState.nextPlacementRank === 0) {
    const { cards, gameState: startGameState } = state;

    setHandCards(cards);
    setGameState(startGameState);
  }

  const handlePlayCards = async () => {
    const { error } = await playerPlayMove();

    if (error) {
      alert(error);
    } else {
      setPlayCards([]);
    }
  };

  const handlePass = async () => {
    const { error } = await playerPassMove();

    if (error) {
      alert(error);
    } else {
      const returnedCards = handCards.concat(playCards);
      setPlayCards([]);
      returnedCards.sort((a, b) => a.id - b.id);
      setHandCards(returnedCards);
    }
  };

  const handleSelectPlayCard: MouseEventHandler<HTMLButtonElement> = (
    event,
  ) => {
    event.preventDefault();
    const target = event.currentTarget;
    const dataValue = target.getAttribute('data-value');

    if (dataValue) {
      const { id, value, suit } = JSON.parse(dataValue) as Card;
      const updatedHandCards = [...handCards, { id, value, suit }];
      updatedHandCards.sort((a, b) => a.id - b.id);
      setHandCards(updatedHandCards);
      const updatedPlayCards = playCards.filter((card) => card.id !== id);
      setPlayCards(updatedPlayCards);
    }
  };

  const handleSelectHandCard: MouseEventHandler<HTMLButtonElement> = (
    event,
  ) => {
    event.preventDefault();
    const target = event.currentTarget;
    const dataValue = target.getAttribute('data-value');

    if (dataValue) {
      const { id, value, suit } = JSON.parse(dataValue) as Card;
      const updatedPlayCards = [...playCards, { id, value, suit }];
      updatedPlayCards.sort((a, b) => a.id - b.id);
      setPlayCards(updatedPlayCards);
      const updatedHandCards = handCards.filter((card) => card.id !== id);
      setHandCards(updatedHandCards);
    }
  };

  if (gameState.turnRotation.length === 1) {
    return (
      <GameOver
        name={state?.name}
        playerType={state?.playerType}
        gameState={gameState}
      />
    );
  }

  return (
    <div>
      <p>{`You are ${state?.name}`}</p>
      <Table gameState={gameState} />
      <h3>Your Cards</h3>
      {playCards.map((card: { id: number; value: number; suit: number }) => (
        <div key={card.id}>
          <button
            type='button'
            data-value={JSON.stringify({
              id: card.id,
              value: card.value,
              suit: card.suit,
            })}
            onClick={handleSelectPlayCard}
          >
            {card.value} {card.suit}
          </button>
        </div>
      ))}
      <button
        type='button'
        onClick={handlePlayCards}
      >
        Play Cards
      </button>
      <button
        type='button'
        onClick={handlePass}
      >
        Pass
      </button>
      <h3>Your Hand</h3>
      {handCards.map((card: { id: number; value: number; suit: number }) => (
        <div key={card.id}>
          <button
            type='button'
            data-value={JSON.stringify({
              id: card.id,
              value: card.value,
              suit: card.suit,
            })}
            onClick={handleSelectHandCard}
          >
            {card.value} {card.suit}
          </button>
        </div>
      ))}
    </div>
  );
};

export default Game;
