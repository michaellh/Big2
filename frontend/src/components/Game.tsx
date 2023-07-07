/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable no-console */
import { useLocation } from 'react-router-dom';
import { gql, useSubscription, useMutation } from '@apollo/client';
import {
  ReactElement,
  JSXElementConstructor,
  ReactNode,
  ReactPortal,
  // useState,
} from 'react';

const PLAYER_MOVE_SUBSCRIPTION = gql`
  subscription OnPlayerMove {
    playerMove {
      turnRotation
      currentMove {
        cards {
          id
          value
          suit
        }
        play
        player
        playersInPlay
      }
      playerStates {
        player
        cardCount
      }
    }
  }
`;
const PLAYER_MOVE = gql`
  mutation playerMove($playerAction: PlayerAction!) {
    playerMove(playerAction: $playerAction) {
      turnRotation
      currentMove {
        cards {
          id
          value
          suit
        }
        play
        player
        playersInPlay
      }
      playerStates {
        player
        cardCount
      }
    }
  }
`;

const Game = () => {
  // const [actionCards, setActionCards] = useState<string[]>([]);
  // const [turnRotation, setTurnRotation] = useState([]);
  // const [currentMove, setCurrentMove] = useState({});
  // const [playerStates, setPlayerStates] = useState({});
  const location = useLocation();
  console.log('location', location);

  console.log('subscribe to player move');
  useSubscription(PLAYER_MOVE_SUBSCRIPTION, {
    onData: ({ data }) => {
      console.log('player move sub data', data);
    },
  });
  console.log('subscribed');
  const [playerMove] = useMutation(PLAYER_MOVE);

  const handlePlayCards = async () => {
    console.log('play cards clicked');
    // call playermove with playeraction
    await playerMove({
      variables: {
        playerAction: {
          cardsPlayed: [],
          action: 'play',
        },
      },
    });
  };

  const handlePass = async () => {
    console.log('pass clicked');
    // call playermove with playeraction
    await playerMove({
      variables: {
        playerAction: {
          cardsPlayed: [],
          action: 'pass',
        },
      },
    });
  };

  const handleSelectCard = () => {
    // const updateCardsSelected = actionCards.shift(event.target.innerText);
    // console.log(event.target.innerText);
    // setActionCards(updateCardsSelected);
  };

  return (
    <div>
      <header className='App-header'>
        <p>Big 2</p>
      </header>
      <button
        type='button'
        onClick={() => handlePlayCards}
      >
        Play Cards
      </button>
      <button
        type='button'
        onClick={() => handlePass}
      >
        Pass
      </button>
      {location.state.cards.map(
        (card: {
          value:
            | string
            | number
            | boolean
            | ReactElement<any, string | JSXElementConstructor<any>>
            | Iterable<ReactNode>
            | ReactPortal
            | null
            | undefined;
          suit:
            | string
            | number
            | boolean
            | ReactElement<any, string | JSXElementConstructor<any>>
            | Iterable<ReactNode>
            | ReactPortal
            | null
            | undefined;
        }) => (
          <div>
            <button
              type='button'
              data-value={JSON.stringify({
                value: card.value,
                suit: card.suit,
              })}
              onClick={handleSelectCard}
            >
              {card.value} {card.suit}
            </button>
          </div>
        ),
      )}
    </div>
  );
};

export default Game;
