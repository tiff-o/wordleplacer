import Board, { BoardType } from '../components/Board'
// import BoardType from '../components/Board';
import Head from 'next/head'
import Image from 'next/image'
import Keyboard from '../components/Keyboard'
import React, { useEffect, useState } from 'react';
import styles from '../styles/Home.module.css'
import type { GetServerSideProps, NextPage } from 'next'

const BOARD_WIDTH = 5;
const MAX_GUESSES = 6;
interface State {
  wordToGuess: string,
  guessesSoFar: string[],
  currentGuess: string
}

function boardFromState (state: State) {
  const board = emptyBoard();
  const { wordToGuess, guessesSoFar, currentGuess } = state;
  guessesSoFar.forEach((guess: string, row: number) => {
    let col = 0;
    for (let c of guess) {
      board[row][col].letter = c;
      // set green color if letter is in the right place
      if (c === wordToGuess[col]) board[row][col].color = 'green';
      // set orange if the letter is in the word, but not the right place
      else if (wordToGuess.includes(c)) board[row][col].color = 'orange';
      col++;
    }
  });

  const rowForPartialGuess = guessesSoFar.length;
  let col = 0;
  for (let c of currentGuess) {
    board[rowForPartialGuess][col].letter = c;
    col++;
  }

  return board;
}

function emptyBoard () {
  return new Array(MAX_GUESSES).fill(null).map(() =>
    new Array(BOARD_WIDTH).fill(null).map(() => ({ letter: '', color: 'white' }))
  );
}

function debugState (state: State) {
  console.log(state);
  console.log(boardFromState(state));
}

interface HomeProps {
  randomWord: string
}

const Home: NextPage<HomeProps> = ({ randomWord }) => {
  // FIXME wordToGuess selected from list...
  const [state, setState] = useState<State>({ wordToGuess: randomWord, guessesSoFar: [], currentGuess: '' });
  var board: BoardType = emptyBoard();

  const onKeyPress = (key: string) => {
    const { wordToGuess, guessesSoFar, currentGuess } = state;

    switch(key) {
      case '{enter}':
        if (currentGuess.length < BOARD_WIDTH) return;
        return setState({wordToGuess, guessesSoFar: guessesSoFar.concat(currentGuess), currentGuess: '' });
      case '{bksp}':
        if (currentGuess.length === 0) return;
        return setState({wordToGuess, guessesSoFar: guessesSoFar, currentGuess: currentGuess.slice(0,-1) });
    }
    if (currentGuess.length >= BOARD_WIDTH) return;
    setState({wordToGuess, guessesSoFar, currentGuess: currentGuess + key })
  }

  useEffect(() => {
    debugState(state);
  });

  return (
    <div className={styles.container}>
      <Board board={boardFromState(state)}></Board>
      <Keyboard onKeyPress={onKeyPress}></Keyboard>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const protocol = req.headers['x-forwarded-proto'] || 'http'
  const baseUrl = req ? `${protocol}://${req.headers.host}` : ''

  const res = await fetch(baseUrl + '/api/random-word')
  const json = await res.json();
  return { props: { randomWord: json.word } };
}

export default Home
