import React from 'react';
import { PIECE_SYMBOLS } from '../utils/constants';

const ChessBoard = ({ 
  game, 
  selectedSquare, 
  validMoves, 
  onSquareClick, 
  orientation = 'white',
  isInteractive = true 
}) => {
  const renderSquare = (square, piece, isSelected, isValidMove) => {
    const file = square[0];
    const rank = square[1];
    const row = 8 - parseInt(rank);
    const col = file.charCodeAt(0) - 97;
    const isLight = (row + col) % 2 === 0;

    return (
      <div
        key={square}
        data-square={square}
        className={`w-12 h-12 flex items-center justify-center relative ${
          isLight ? 'bg-amber-200' : 'bg-amber-800'
        } ${isSelected ? 'ring-2 ring-blue-500' : ''} ${
          isValidMove ? 'ring-2 ring-green-500' : ''
        } ${isInteractive ? 'cursor-pointer' : 'cursor-default'} transition-all duration-200`}
        onClick={() => isInteractive && onSquareClick(square)}
      >
        {/* Board coordinates */}
        {(file === 'a' || rank === '1') && orientation === 'white' && (
          <>
            {file === 'a' && (
              <span className="square-coordinate rank">{rank}</span>
            )}
            {rank === '1' && (
              <span className="square-coordinate file">{file}</span>
            )}
          </>
        )}
        {(file === 'h' || rank === '8') && orientation === 'black' && (
          <>
            {file === 'h' && (
              <span className="square-coordinate rank">{rank}</span>
            )}
            {rank === '8' && (
              <span className="square-coordinate file">{file}</span>
            )}
          </>
        )}
        
        {piece && (
          <span className={`text-3xl select-none piece ${isInteractive ? 'cursor-pointer' : 'cursor-default'}`}>
            {PIECE_SYMBOLS[piece]}
          </span>
        )}
        {isValidMove && !piece && (
          <div className="w-3 h-3 bg-green-500 rounded-full opacity-50"></div>
        )}
      </div>
    );
  };

  const renderBoard = () => {
    const squares = [];
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = orientation === 'white' ? ['8', '7', '6', '5', '4', '3', '2', '1'] : ['1', '2', '3', '4', '5', '6', '7', '8'];

    for (let rank of ranks) {
      for (let file of files) {
        const square = orientation === 'white' ? 
          file + rank : 
          String.fromCharCode(97 + (7 - files.indexOf(file))) + (9 - parseInt(rank));
        const piece = game.get(square);
        const isSelected = selectedSquare === square;
        const isValidMove = validMoves.includes(square);
        
        squares.push(renderSquare(square, piece, isSelected, isValidMove));
      }
    }

    return squares;
  };

  return (
    <div 
      className="grid grid-cols-8 border-4 border-amber-900 rounded shadow-2xl bg-amber-900"
      style={{ width: '400px', height: '400px' }}
    >
      {renderBoard()}
    </div>
  );
};

export default ChessBoard;