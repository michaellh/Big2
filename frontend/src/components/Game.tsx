import { useLocation } from 'react-router-dom';
import { useState, MouseEventHandler } from 'react';
import { Button } from '@mui/material';
import { Card, GameState } from '../schema';
import usePlayerMove from '../hooks/usePlayerMove';
import usePlayerMoveSubscription from '../hooks/usePlayerMoveSubscription';
import Table from './Table';
import GameOver from './GameOver';
import '../styles.css';

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
    <div className='game'>
      <h4>{`You are: ${state?.name}`}</h4>
      <Table
        gameState={gameState}
        playCards={playCards}
        handCards={handCards}
        handleSelectPlayCard={handleSelectPlayCard}
        handleSelectHandCard={handleSelectHandCard}
      />
      <br />
      <div>
        <Button
          variant='contained'
          onClick={handlePlayCards}
          disabled={playCards.length === 0}
        >
          Play
        </Button>
        <Button
          variant='contained'
          onClick={handlePass}
        >
          Pass
        </Button>
      </div>
    </div>
  );
};

export default Game;
