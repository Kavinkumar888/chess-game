import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import io from 'socket.io-client';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [gameStatus, setGameStatus] = useState('idle'); // idle, waiting, playing
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
    
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('gameStart', (data) => {
      setGameStatus('playing');
      navigate(`/game/${data.gameId}`);
    });

    newSocket.on('waitingForOpponent', () => {
      setGameStatus('waiting');
    });

    newSocket.on('error', (data) => {
      alert(data.message);
      setGameStatus('idle');
    });

    return () => {
      newSocket.close();
    };
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFindGame = () => {
    if (socket) {
      socket.emit('joinGame', {
        userId: user.id,
        username: user.username
      });
      setGameStatus('waiting');
    }
  };

  const handleCancelSearch = () => {
    if (socket) {
      // Note: You might need to implement a cancel event on the backend
      setGameStatus('idle');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sortedUsers = users.sort((a, b) => b.points - a.points);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Chess Dashboard</h1>
        <div className="flex items-center space-x-4">
          <span className="text-gray-300">Welcome, <strong>{user?.username}</strong> (Points: {user?.points})</span>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition duration-200"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Game Controls */}
        <div className="col-span-1 bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-white">Play Chess</h2>
          <button
            onClick={handleFindGame}
            disabled={gameStatus === 'waiting'}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded mb-4 transition duration-200"
          >
            {gameStatus === 'waiting' ? 'Waiting for opponent...' : 'Find Game'}
          </button>
          
          {gameStatus === 'waiting' && (
            <button
              onClick={handleCancelSearch}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded transition duration-200"
            >
              Cancel Search
            </button>
          )}
          
          <div className="mt-6">
            <h3 className="font-bold mb-2 text-white">Your Stats</h3>
            <div className="space-y-2 text-gray-300">
              <p>Games Played: {user?.gamesPlayed || 0}</p>
              <p>Games Won: {user?.gamesWon || 0}</p>
              <p>Win Rate: {user?.gamesPlayed ? Math.round((user.gamesWon / user.gamesPlayed) * 100) : 0}%</p>
              <p>Points: {user?.points || 0}</p>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="col-span-1 lg:col-span-2 bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-white">Leaderboard</h2>
          {loading ? (
            <div className="text-center text-gray-300">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-300">Rank</th>
                    <th className="text-left py-3 px-4 text-gray-300">Username</th>
                    <th className="text-left py-3 px-4 text-gray-300">Points</th>
                    <th className="text-left py-3 px-4 text-gray-300">Games Won</th>
                    <th className="text-left py-3 px-4 text-gray-300">Games Played</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedUsers.map((userData, index) => (
                    <tr 
                      key={userData._id || userData.id} 
                      className={`border-b border-gray-700 hover:bg-gray-750 ${
                        userData.username === user?.username ? 'bg-blue-900 bg-opacity-30' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-gray-300">
                        {index + 1}
                        {index === 0 && ' 🥇'}
                        {index === 1 && ' 🥈'}
                        {index === 2 && ' 🥉'}
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {userData.username}
                        {userData.username === user?.username && ' (You)'}
                      </td>
                      <td className="py-3 px-4 text-gray-300">{userData.points}</td>
                      <td className="py-3 px-4 text-gray-300">{userData.gamesWon}</td>
                      <td className="py-3 px-4 text-gray-300">{userData.gamesPlayed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;