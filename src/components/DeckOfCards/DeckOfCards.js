import { useCallback, useEffect, useRef, useState } from 'react';

import styles from './DeckOfCards.module.css';

import { drawCard, shuffleCards } from '../../services/deck-of-cards';

const DRAW_CARD_DELAY = 1000; // time in milliseconds

const MAX_CARDS_PER_ROW = Math.floor(window.innerWidth / 100) - 1;

const CARD_RANKS = {
  ace: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 10,
  jack: 11,
  queen: 12,
  king: 13
};

const CARD_SUITS = {
  spades: 0,
  hearts: 1,
  clubs: 2,
  diamonds: 3
};

const CARD_RANK_NEEDED = { rank: 12, total: 4 };

/*global Deck*/
const deck = Deck();

const DeckOfCards = () => {
  const [drawnCards, setDrawnCards] = useState([]);
  const [drawButtonClick, setDrawButtonClick] = useState(null);
  const [cardsFound, setCardsFound] = useState(0);

  const deckId = useRef(null);
  const orderedCards = useRef([[], [], [], []]);

  const getCardFromDeck = useCallback((rank, suit) => {
    const pickedCard = deck.cards.find((card) => {
      return card.rank === rank && card.suit === suit;
    });

    pickedCard.value = pickedCard.rank === 1 ? 14 : pickedCard.rank;

    return pickedCard;
  }, []);

  const endGame = useCallback(() => {
    orderedCards.current.forEach((cardsBySuit, suit) => {
      const sortedCards = cardsBySuit.sort((a, b) => a.value - b.value);

      sortedCards.forEach((card, index) => {
        card.animateTo({
          delay: 500,
          duration: 500,
          ease: 'quartOut',
          x: (index + 1) * 100 - window.innerWidth / 2,
          y: suit * 120 + 150
        });
      });
    });
  }, [orderedCards]);

  useEffect(() => {
    const init = async () => {
      const {
        data: { deck_id }
      } = await shuffleCards();

      deckId.current = deck_id;

      deck.shuffle();
      deck.mount(document.getElementById('container'));
    };

    init();
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (drawButtonClick === null) {
        return;
      }

      const {
        data: {
          cards: [card]
        }
      } = await drawCard(deckId.current);

      const drawnCard = getCardFromDeck(
        CARD_RANKS[card.value.toLowerCase()],
        CARD_SUITS[card.suit.toLowerCase()]
      );

      const totalDrawnCards = drawnCards.length + 1;
      let marginX = totalDrawnCards % MAX_CARDS_PER_ROW;
      let marginY = totalDrawnCards % MAX_CARDS_PER_ROW;

      marginX = marginX === 0 ? MAX_CARDS_PER_ROW : marginX;
      marginX *= 100;

      marginY =
        marginY === 0
          ? totalDrawnCards / MAX_CARDS_PER_ROW - 1
          : Math.floor(totalDrawnCards / MAX_CARDS_PER_ROW);
      marginY *= 120;

      drawnCard.animateTo({
        delay: 0,
        duration: 500,
        ease: 'quartOut',
        x: marginX - window.innerWidth / 2,
        y: marginY + 150
      });

      orderedCards.current[drawnCard.suit].push(drawnCard);

      setDrawnCards((prevDrawnCards) => [...prevDrawnCards, drawnCard]);
    }, DRAW_CARD_DELAY);

    return () => {
      clearTimeout(timer);
    };
  }, [deckId, drawButtonClick, getCardFromDeck]);

  useEffect(() => {
    const lastCard = drawnCards.length
      ? drawnCards[drawnCards.length - 1]
      : null;

    if (!lastCard) {
      return;
    }

    setTimeout(() => {
      lastCard.setSide('front');

      if (lastCard.rank === CARD_RANK_NEEDED.rank) {
        setCardsFound((prevCardsFound) => prevCardsFound + 1);
      }
    }, 1000);
  }, [drawnCards]);

  useEffect(() => {
    if (cardsFound === CARD_RANK_NEEDED.total) {
      endGame();
    }
  }, [cardsFound, endGame]);

  const toggleDrawButtonHandler = async () => {
    setDrawButtonClick((prevDrawButtonClick) => !prevDrawButtonClick);
  };

  return (
    <div>
      <button
        className={styles['draw-card-button']}
        disabled={cardsFound === CARD_RANK_NEEDED.total ? true : false}
        onClick={toggleDrawButtonHandler}
      >
        Draw a Card
      </button>
      <div id="container" className={styles['deck-container']}></div>
    </div>
  );
};

export default DeckOfCards;
