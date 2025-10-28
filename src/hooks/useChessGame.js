import { useState, useCallback } from 'react';
import { Chess } from 'chess.js';
import { createNewGame, getValidMoves } from '../utils/chessHelpers';

export const useChessGame = () => {
  const [game, setGame] = useState(createNewGame());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [moveHistory, setMoveHistory] = useState([]);

  const resetGame = useCallback(() => {
    setGame(createNewGame());
    setSelectedSquare(null);
    setValidMoves([]);
    setMoveHistory([]);
  }, []);

  const selectSquare = useCallback((square) => {
    const piece = game.get(square);
    
    // If clicking on own piece, select it
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
      const moves = getValidMoves(game, square);
      setValidMoves(moves.map(move => move.to));
      return { type: 'select', square, piece };
    }

    // If a square is selected and clicking on a valid move square
    if (selectedSquare && validMoves.includes(square)) {
      try {
        const move = game.move({
          from: selectedSquare,
          to: square,
          promotion: 'q' // Always promote to queen for simplicity
        });

        if (move) {
          const newGame = new Chess(game.fen());
          setGame(newGame);
          setMoveHistory(prev => [...prev, move]);
          setSelectedSquare(null);
          setValidMoves([]);
          return { type: 'move', move, success: true };
        }
      } catch (error) {
        return { type: 'move', success: false, error: 'Invalid move' };
      }
    }

    // Invalid selection or move
    setSelectedSquare(null);
    setValidMoves([]);
    return { type: 'invalid' };
  }, [game, selectedSquare, validMoves]);

  const makeMove = useCallback((from, to, promotion = 'q') => {
    try {
      const move = game.move({ from, to, promotion });
      if (move) {
        const newGame = new Chess(game.fen());
        setGame(newGame);
        setMoveHistory(prev => [...prev, move]);
        return { success: true, move };
      }
    } catch (error) {
      return { success: false, error: 'Invalid move' };
    }
    return { success: false, error: 'Move failed' };
  }, [game]);

  const updateGameState = useCallback((fen, moves = []) => {
    const newGame = new Chess(fen);
    setGame(newGame);
    if (moves.length > 0) {
      setMoveHistory(moves);
    }
  }, []);

  return {
    game,
    selectedSquare,
    validMoves,
    moveHistory,
    resetGame,
    selectSquare,
    makeMove,
    updateGameState,
    setSelectedSquare,
    setValidMoves
  };
};