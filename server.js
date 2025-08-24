const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Game Schema
const gameSchema = new mongoose.Schema({
  player1Id: Number,
  player2Id: Number,
  scores: {
    player1: [Number],
    player2: [Number]
  },
  winnerId: Number,
  date: Date
});

const Game = mongoose.model('Game', gameSchema);

// API Endpoint to save game data
app.post('/api/games', async (req, res) => {
  try {
    const gameData = new Game(req.body);
    await gameData.save();
    res.status(201).json({ message: 'Game saved successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error saving game', error: err.message });
  }
});

// API Endpoint to retrieve all games
app.get('/api/games', async (req, res) => {
  try {
    const games = await Game.find();
    res.status(200).json(games);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving games', error: err.message });
  }
});

// API Endpoint to retrieve player stats
app.get('/api/player-stats', async (req, res) => {
  try {
    const games = await Game.find();
    const members = [
      { id: 1, name: 'Matt' },
      { id: 2, name: 'Greg' },
      { id: 3, name: 'Doug' },
      { id: 4, name: 'Dean' },
      { id: 5, name: 'Rob' },
      { id: 6, name: 'Ryan' },
      { id: 7, name: 'Colten' },
      { id: 8, name: 'Bry' },
      { id: 9, name: 'Mike' },
      { id: 10, name: 'Connor' },
      { id: 11, name: 'Spencer' },
      { id: 12, name: 'Jeremy' },
      { id: 13, name: 'Branden' },
      { id: 14, name: 'Mouse' }
    ];

    const stats = members.map(player => {
      let wins = 0;
      let losses = 0;
      let totalScores = [];
      let gamesPlayed = 0;
      let numberOf180s = 0;

      games.forEach(game => {
        const isPlayer1 = game.player1Id === player.id;
        const isPlayer2 = game.player2Id === player.id;

        if (isPlayer1 || isPlayer2) {
          gamesPlayed++;
          if (game.winnerId === player.id) {
            wins++;
          } else if (game.winnerId && game.winnerId !== player.id) {
            losses++;
          }
          const playerScores = isPlayer1 ? game.scores.player1 : game.scores.player2;
          totalScores.push(...playerScores);
          numberOf180s += playerScores.filter(score => score === 180).length;
        }
      });

      const avgScore = totalScores.length > 0 
        ? (totalScores.reduce((sum, score) => sum + score, 0) / totalScores.length).toFixed(2)
        : 0;
      const ppd = avgScore > 0 ? (avgScore / 3).toFixed(2) : 0;
      const bestThrow = totalScores.length > 0 ? Math.max(...totalScores) : 0;
      const winLossRatio = gamesPlayed > 0 ? `${wins}/${losses}` : '0/0';

      return {
        id: player.id,
        name: player.name,
        wins,
        losses,
        avgScore,
        ppd,
        bestThrow,
        numberOf180s,
        winLossRatio,
        gamesPlayed
      };
    });

    res.status(200).json(stats);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving player stats', error: err.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});