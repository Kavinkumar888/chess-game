import React from 'react';
import { PIECE_SYMBOLS } from '../utils/constants';

const Square = ({ 
  square, 
  piece, 
  isSelected, 
  isValidMove, 
  onClick, 
  orientation = 'white',
  isInteractive = true 
}) => {
  const file = square[0];
  const rank = square[1];
  const row = 8 - parseInt(rank);
  const col = file.charCodeAt(0) - 97;
  const isLight = (row + col) % 2 === 0;

  const handleClick = () => {
    if (isInteractive) {
      onClick(square);
    }
  };

  return (
    <div
      className={`w-12 h-12 flex items-center justify-center relative ${
        isLight ? 'bg-amber-200' : 'bg-amber-800'
      } ${isSelected ? 'ring-2 ring-blue-500' : ''} ${
        isValidMove ? 'ring-2 ring-green-500' : ''
      } ${isInteractive ? 'cursor-pointer hover:brightness-110' : 'cursor-default'} transition-all duration-200`}
      onClick={handleClick}
      data-square={square}
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
        <span className={`text-3xl select-none piece ${isInteractive ? 'cursor-grab' : 'cursor-default'}`}>
          {PIECE_SYMBOLS[piece]}
        </span>
      )}
      {isValidMove && !piece && (
        <div className="w-3 h-3 bg-green-500 rounded-full opacity-70"></div>
      )}
      {isValidMove && piece && (
        <div className="absolute inset-0 ring-2 ring-red-500 rounded opacity-70"></div>
      )}
    </div>
  );
};

export default Square;