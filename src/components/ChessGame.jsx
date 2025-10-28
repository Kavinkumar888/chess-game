import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Chess } from 'chess.js';
import io from 'socket.io-client';
import { gsap } from 'gsap';
import { useSound } from '../hooks/useSound';
import { useChessGame } from '../hooks/useChessGame';
import { PIECE_SYMBOLS } from '../utils/constants';
import { animatePieceCapture, animateCheck } from '../utils/animations';

function ChessGame() {
  const { gameId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const {
    game,
    selectedSquare,
    validMoves,
    selectSquare,
    updateGameState
  } = useChessGame();
  
  const { playCaptureSound, playMoveSound, playCheckSound } = useSound();
  
  const [playerColor, setPlayerColor] = useState('white');
  const [opponent, setOpponent] = useState('');
  const [gameStatus, setGameStatus] = useState('active');
  const [capturedPieces, setCapturedPieces] = useState({ white: [], black: [] });
  const [isMyTurn, setIsMyTurn] = useState(false);
  
  const socketRef = useRef();
  const boardRef = useRef();
  const previousFenRef = useRef('');

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
    
    socketRef.current.emit('joinGame', {
      userId: user.id,
      username: user.username
    });

    socketRef.current.on('gameStart', (data) => {
      setPlayerColor(data.color);
      setOpponent(data.opponent);
      setIsMyTurn(data.color === 'white');
    });

    socketRef.current.on('opponentMove', (data) => {
      updateGameState(data.fen);
      setIsMyTurn(true);
      
      // Check for captures
      const previousGame = new Chess(previousFenRef.current);
      const currentGame = new Chess(data.fen);
      
      if (data.move.captured) {
        handleCaptureAnimation(data.move, false);
      }
      
      // Check for check
      if (currentGame.in_check() && !previousGame.in_check()) {
        const kingSquare = findKingSquare(currentGame, playerColor[0]);
        if (kingSquare) {
          const kingElement = document.querySelector(`[data-square="${kingSquare}"]`);
          animateCheck(kingElement);
          playCheckSound();
        }
      }
      
      previousFenRef.current = data.fen;
    });

    socketRef.current.on('moveMade', (data) => {
      setIsMyTurn(false);
      previousFenRef.current = data.fen;
    });

    socketRef.current.on('gameOver', (data) => {
      setGameStatus('finished');
      setTimeout(() => {
        if (data.winner) {
          if (data.winner === playerColor) {
            alert('Congratulations! You won!');
          } else {
            alert('Game over! You lost.');
          }
        } else {
          alert('Game ended in a draw!');
        }
        navigate('/dashboard');
      }, 1000);
    });

    socketRef.current.on('invalidMove', (data) => {
      alert(data.message);
    });

    socketRef.current.on('error', (data) => {
      alert(data.message);
      navigate('/dashboard');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user, navigate, playerColor, updateGameState, playCheckSound]);

  const findKingSquare = (chessGame, color) => {
    const fen = chessGame.fen();
    const board = fen.split(' ')[0];
    const rows = board.split('/');
    
    for (let i = 0; i < rows.length; i++) {
      for (let j = 0; j < rows[i].length; j++) {
        const char = rows[i][j];
        if (char === (color === 'w' ? 'K' : 'k')) {
          const file = String.fromCharCode(97 + j);
          const rank = 8 - i;
          return file + rank;
        }
      }
    }
    return null;
  };

  const handleSquareClick = (square) => {
    if (gameStatus !== 'active' || !isMyTurn) return;

    const result = selectSquare(square);
    
    if (result.type === 'move' && result.success) {
      playMoveSound();
      
      // Check for capture
      if (result.move.captured) {
        handleCaptureAnimation(result.move, true);
      }
      
      // Check for check
      if (game.in_check()) {
        const kingSquare = findKingSquare(game, game.turn());
        if (kingSquare) {
          const kingElement = document.querySelector(`[data-square="${kingSquare}"]`);
          animateCheck(kingElement);
          playCheckSound();
        }
      }
      
      // Emit move to server
      socketRef.current.emit('makeMove', {
        gameId,
        from: result.move.from,
        to: result.move.to,
        promotion: result.move.promotion || 'q'
      });
    }
  };

  const handleCaptureAnimation = (move, isMyCapture) => {
    playCaptureSound();
    
    const capturedPieceElement = document.querySelector(`[data-square="${move.to}"]`);
    if (capturedPieceElement) {
      const targetX = isMyCapture ? 
        (playerColor === 'white' ? window.innerWidth - 100 : 100) :
        (playerColor === 'white' ? 100 : window.innerWidth - 100);
      
      const targetY = isMyCapture ? 
        (playerColor === 'white' ? 50 : window.innerHeight - 50) :
        (playerColor === 'white' ? window.innerHeight - 50 : 50);

      animatePieceCapture(capturedPieceElement, targetX, targetY, () => {
        // Add to captured pieces display
        const capturedBy = isMyCapture ? playerColor : (playerColor === 'white' ? 'black' : 'white');
        setCapturedPieces(prev => ({
          ...prev,
          [capturedBy]: [...prev[capturedBy], move.captured]
        }));
      });
    }
  };

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
        } transition-all duration-200`}
        onClick={() => handleSquareClick(square)}
      >
        {/* Board coordinates */}
        {(file === 'a' || rank === '1') && playerColor === 'white' && (
          <>
            {file === 'a' && (
              <span className="square-coordinate rank">{rank}</span>
            )}
            {rank === '1' && (
              <span className="square-coordinate file">{file}</span>
            )}
          </>
        )}
        {(file === 'h' || rank === '8') && playerColor === 'black' && (
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
          <span className="text-3xl cursor-pointer select-none piece">
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
    const ranks = playerColor === 'white' ? ['8', '7', '6', '5', '4', '3', '2', '1'] : ['1', '2', '3', '4', '5', '6', '7', '8'];

    for (let rank of ranks) {
      for (let file of files) {
        const square = playerColor === 'white' ? file + rank : String.fromCharCode(97 + (7 - files.indexOf(file))) + (9 - parseInt(rank));
        const piece = game.get(square);
        const isSelected = selectedSquare === square;
        const isValidMove = validMoves.includes(square);
        
        squares.push(renderSquare(square, piece, isSelected, isValidMove));
      }
    }

    return squares;
  };

  const getGameStatusText = () => {
    if (game.isCheckmate()) return 'Checkmate!';
    if (game.isStalemate()) return 'Stalemate!';
    if (game.isDraw()) return 'Draw!';
    if (game.isCheck()) return 'Check!';
    if (!isMyTurn) return "Opponent's turn";
    return 'Your turn';
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 p-4 bg-gray-800 rounded-lg">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition duration-200"
          >
            ← Back to Dashboard
          </button>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">Chess Game</h2>
            <p className="text-gray-300">
              You are <strong className={playerColor === 'white' ? 'text-amber-200' : 'text-amber-800'}>{playerColor}</strong> 
              {' vs '} 
              <strong>{opponent}</strong>
            </p>
          </div>

          <div className="text-right">
            <p className={`text-lg font-bold ${isMyTurn ? 'text-green-400' : 'text-red-400'}`}>
              {getGameStatusText()}
            </p>
            {gameStatus === 'finished' && (
              <p className="text-red-500 font-bold">Game Over</p>
            )}
          </div>
        </div>

        {/* Game Board and Captured Pieces */}
        <div className="flex flex-col lg:flex-row items-center justify-center space-y-8 lg:space-y-0 lg:space-x-8">
          {/* Captured pieces - White */}
          <div className="order-2 lg:order-1">
            <div className="bg-gray-800 rounded-lg p-4 min-h-[100px] min-w-[200px]">
              <h3 className="text-center font-bold mb-2 text-white">White Captured</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {capturedPieces.white.map((piece, index) => (
                  <span key={index} className="text-2xl">
                    {PIECE_SYMBOLS[piece]}
                  </span>
                ))}
                {capturedPieces.white.length === 0 && (
                  <span className="text-gray-500 text-sm">No pieces captured</span>
                )}
              </div>
            </div>
          </div>

          {/* Chess Board */}
          <div className="order-1 lg:order-2">
            <div 
              ref={boardRef}
              className="grid grid-cols-8 border-4 border-amber-900 rounded shadow-2xl"
              style={{ width: '400px', height: '400px' }}
            >
              {renderBoard()}
            </div>
          </div>

          {/* Captured pieces - Black */}
          <div className="order-3">
            <div className="bg-gray-800 rounded-lg p-4 min-h-[100px] min-w-[200px]">
              <h3 className="text-center font-bold mb-2 text-white">Black Captured</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {capturedPieces.black.map((piece, index) => (
                  <span key={index} className="text-2xl">
                    {PIECE_SYMBOLS[piece]}
                  </span>
                ))}
                {capturedPieces.black.length === 0 && (
                  <span className="text-gray-500 text-sm">No pieces captured</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Game info */}
        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <h4 className="font-bold text-white">Game Info</h4>
              <p className="text-gray-300">Turn: {game.turn() === 'w' ? 'White' : 'Black'}</p>
              <p className="text-gray-300">Full moves: {game.history().length}</p>
            </div>
            <div>
              <h4 className="font-bold text-white">Players</h4>
              <p className="text-gray-300">You: {user?.username} ({playerColor})</p>
              <p className="text-gray-300">Opponent: {opponent}</p>
            </div>
            <div>
              <h4 className="font-bold text-white">Status</h4>
              <p className={game.isCheck() ? 'text-yellow-400' : 'text-gray-300'}>
                {getGameStatusText()}
              </p>
              {!isMyTurn && gameStatus === 'active' && (
                <p className="text-blue-400 text-sm">Waiting for opponent...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChessGame;