/* eslint-disable no-console */
import { useLocation } from 'react-router-dom';
import { useState, MouseEventHandler } from 'react';
import { Card, GameState, PlayerState } from '../schema';
import usePlayerMove from '../hooks/usePlayerMove';
import usePlayerMoveSubscription from '../hooks/usePlayerMoveSubscription';
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
        cardCount: 0,
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
        playerStates={gameState.playerStates}
      />
    );
  }

  return (
    <div>
      <p>{`You are ${state?.name}`}</p>
      <h3>Table</h3>
      <div>{`Current Player's Turn: ${gameState.turnRotation.at(0)}`}</div>
      {gameState.playerStates.map((playerState: PlayerState) => (
        <div key={playerState.player}>
          {`${playerState.player} # of Cards: ${playerState.cardCount} Finish: ${playerState.placementRank}`}
        </div>
      ))}
      <h3>Played Cards</h3>
      {gameState.currentMove.cards.map(
        (card: { id: number; value: number; suit: number }) => (
          <div key={card.id}>
            {card.value} {card.suit}
          </div>
        ),
      )}
      <p>{`Played by ${gameState.currentMove.player}`}</p>
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
