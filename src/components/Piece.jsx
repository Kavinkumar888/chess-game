import React from 'react';
import { PIECE_SYMBOLS } from '../utils/constants';

const Piece = ({ 
  piece, 
  square, 
  isDraggable = true,
  onDragStart 
}) => {
  if (!piece) return null;

  const handleDragStart = (e) => {
    if (isDraggable && onDragStart) {
      e.dataTransfer.setData('text/plain', square);
      onDragStart(square, piece);
    }
  };

  return (
    <div
      draggable={isDraggable}
      onDragStart={handleDragStart}
      className="text-3xl cursor-grab select-none w-full h-full flex items-center justify-center piece active:cursor-grabbing"
      data-piece={piece}
      data-square={square}
    >
      {PIECE_SYMBOLS[piece]}
    </div>
  );
};

export default Piece;