import React from 'react';
import { PIECE_SYMBOLS, PIECE_NAMES } from '../utils/constants';

const CapturedPieces = ({ pieces, color, title }) => {
  const pieceValues = {
    p: 1, n: 3, b: 3, r: 5, q: 9, k: 0,
    P: 1, N: 3, B: 3, R: 5, Q: 9, K: 0
  };

  const totalValue = pieces.reduce((sum, piece) => sum + pieceValues[piece], 0);

  // Group pieces by type for better display
  const groupedPieces = pieces.reduce((groups, piece) => {
    const type = piece.toLowerCase();
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(piece);
    return groups;
  }, {});

  return (
    <div className="bg-gray-800 rounded-lg p-4 min-h-[100px] min-w-[200px]">
      <h3 className="text-center font-bold mb-2 text-white">{title}</h3>
      <div className="flex flex-wrap gap-2 justify-center items-center">
        {Object.keys(groupedPieces).length > 0 ? (
          Object.entries(groupedPieces).map(([type, piecesArray]) => (
            <div key={type} className="flex items-center gap-1">
              <span className="text-2xl">{PIECE_SYMBOLS[piecesArray[0]]}</span>
              {piecesArray.length > 1 && (
                <span className="text-sm text-gray-300">×{piecesArray.length}</span>
              )}
            </div>
          ))
        ) : (
          <span className="text-gray-500 text-sm">No pieces captured</span>
        )}
      </div>
      {totalValue > 0 && (
        <div className="text-center mt-2">
          <span className="text-xs text-gray-400">Material: +{totalValue}</span>
        </div>
      )}
    </div>
  );
};

export default CapturedPieces;