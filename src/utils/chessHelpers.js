import { Chess } from 'chess.js';

export const createNewGame = () => {
  return new Chess();
};

export const getValidMoves = (game, square) => {
  return game.moves({ square, verbose: true });
};

export const isGameOver = (game) => {
  return game.isGameOver();
};

export const getGameStatus = (game) => {
  if (game.isCheckmate()) return 'checkmate';
  if (game.isStalemate()) return 'stalemate';
  if (game.isDraw()) return 'draw';
  if (game.isCheck()) return 'check';
  return 'active';
};

export const getPieceColor = (piece) => {
  return piece === piece.toUpperCase() ? 'white' : 'black';
};

export const getSquareColor = (square) => {
  const file = square.charCodeAt(0) - 97;
  const rank = parseInt(square[1]);
  return (file + rank) % 2 === 0 ? 'light' : 'dark';
};

export const getBoardOrientation = (playerColor) => {
  return playerColor === 'white' ? 'white' : 'black';
};

export const getSquareCoordinates = (square, orientation = 'white') => {
  const file = square[0];
  const rank = square[1];
  
  if (orientation === 'black') {
    const files = ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];
    const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];
    const fileIndex = files.indexOf(file);
    const rankIndex = ranks.indexOf(rank);
    return { file: files[7 - fileIndex], rank: ranks[7 - rankIndex] };
  }
  
  return { file, rank };
};