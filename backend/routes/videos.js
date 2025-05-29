const express = require('express');
const {
  uploadVideo,
  getVideos,
  getVideoMetadata,
  streamVideo,
  getMyVideos,
  deleteVideo
} = require('../controllers/videoController');
const { protect } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');

const router = express.Router();

// @route   POST /api/videos/upload
// @desc    Upload a video
// @access  Private
router.post('/upload', protect, upload.single('video'), handleMulterError, uploadVideo);

// @route   GET /api/videos
// @desc    Get all videos with pagination and search
// @access  Public
router.get('/', getVideos);

// @route   GET /api/videos/my-videos
// @desc    Get current user's videos
// @access  Private
router.get('/my-videos', protect, getMyVideos);

// @route   GET /api/videos/:id/stream
// @desc    Stream video file
// @access  Public
router.get('/:id/stream', streamVideo);

// @route   GET /api/videos/:id
// @desc    Get video metadata (with Redis caching)
// @access  Public
router.get('/:id', getVideoMetadata);

// @route   DELETE /api/videos/:id
// @desc    Delete a video
// @access  Private
router.delete('/:id', protect, deleteVideo);

module.exports = router;
