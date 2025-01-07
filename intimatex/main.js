// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Initialize App
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
const mongoURI = 'mongodb+srv://oseitutunelson11:y1YzxB8izPQdczZk@cluster0.ryf7h.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Define Schema
const videoSchema = new mongoose.Schema({
  videoId: { type: String, required: true, unique: true },
  views: { type: Number, default: 0 },
});

const Video = mongoose.model('Video', videoSchema);

// Routes

// Increment View Count
app.post('/api/videos/view', async (req, res) => {
  const { videoId } = req.body;

  try {
    const video = await Video.findOneAndUpdate(
      { videoId },
      { $inc: { views: 1 } },
      { new: true, upsert: true } // Create a new entry if it doesn't exist
    );
    res.status(200).json(video);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update view count' });
  }
});

// Get View Count
app.get('/api/videos/:videoId', async (req, res) => {
  const { videoId } = req.params;

  try {
    const video = await Video.findOne({ videoId });
    if (!video) return res.status(404).json({ error: 'Video not found' });
    res.status(200).json(video);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch view count' });
  }
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
