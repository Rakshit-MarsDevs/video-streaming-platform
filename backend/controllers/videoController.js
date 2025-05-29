const Video = require('../models/Video');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');

// @desc    Upload video
// @route   POST /api/videos/upload
// @access  Private
const uploadVideo = async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a video file'
      });
    }

    // Validate video file type
    const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'];
    if (!allowedTypes.includes(file.mimetype)) {
      // Delete uploaded file if invalid
      try {
        await fs.unlink(file.path);
      } catch (deleteError) {
        console.error('Error deleting invalid file:', deleteError);
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Please upload a video file.'
      });
    }

    // Create video record
    const video = await Video.create({
      title,
      description,
      filename: file.filename,
      originalName: file.originalname,
      filePath: file.path,
      fileSize: file.size,
      mimeType: file.mimetype,
      uploadedBy: req.user.id,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    });

    res.status(201).json({
      success: true,
      message: 'Video uploaded successfully',
      data: {
        video: {
          id: video._id,
          title: video.title,
          description: video.description,
          filename: video.filename,
          originalName: video.originalName,
          fileSize: video.fileSize,
          mimeType: video.mimeType,
          tags: video.tags,
          uploadedBy: video.uploadedBy,
          createdAt: video.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Upload video error:', error);

    // Delete uploaded file if database save fails
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (deleteError) {
        console.error('Error deleting file:', deleteError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Server error during video upload',
      error: error.message
    });
  }
};

// @desc    Get all videos with pagination
// @route   GET /api/videos
// @access  Public
const getVideos = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10)); // Limit max to 50
    const search = req.query.search?.trim() || '';
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    // Build search query with better performance
    let query = { isPublic: true };
    let sortOptions = { [sortBy]: sortOrder };

    if (search) {
      // Use simple regex search for better compatibility
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Use Promise.all for parallel execution
    const [videos, total] = await Promise.all([
      Video.find(query)
        .populate('uploadedBy', 'username')
        .select('-filePath') // Don't expose file path in public API
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(), // Use lean() for better performance
      Video.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: {
        videos,
        pagination: {
          currentPage: page,
          totalPages,
          totalVideos: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching videos',
      error: error.message
    });
  }
};

// @desc    Get video metadata with Redis caching
// @route   GET /api/videos/:id
// @access  Public
const getVideoMetadata = async (req, res) => {
  try {
    const videoId = req.params.id;
    const redisClient = req.app.locals.redisClient;
    const cacheKey = `video:${videoId}`;

    // Check Redis cache first
    let cachedVideo = null;
    let fromCache = false;

    try {
      cachedVideo = await redisClient.get(cacheKey);
      if (cachedVideo) {
        fromCache = true;
        cachedVideo = JSON.parse(cachedVideo);
      }
    } catch (cacheError) {
      console.error('Redis cache error:', cacheError);
    }

    let video;

    if (cachedVideo) {
      video = cachedVideo;
    } else {
      // Fetch from MongoDB
      video = await Video.findById(videoId)
        .populate('uploadedBy', 'username')
        .select('-filePath'); // Don't expose file path

      if (!video) {
        return res.status(404).json({
          success: false,
          message: 'Video not found'
        });
      }

      // Cache in Redis with TTL of 60 seconds
      try {
        await redisClient.setEx(cacheKey, 60, JSON.stringify(video));
      } catch (cacheError) {
        console.error('Redis cache set error:', cacheError);
      }
    }

    // Increment view count (only if not from cache to avoid inflating views)
    if (!fromCache) {
      try {
        await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });
        video.views = (video.views || 0) + 1;
      } catch (updateError) {
        console.error('Error updating view count:', updateError);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        video,
        fromCache
      }
    });
  } catch (error) {
    console.error('Get video metadata error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching video metadata',
      error: error.message
    });
  }
};

// @desc    Stream video file
// @route   GET /api/videos/:id/stream
// @access  Public
const streamVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    const videoPath = video.filePath;

    // Check if file exists
    let stat;
    try {
      stat = await fs.stat(videoPath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'Video file not found'
      });
    }
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      // Support for video seeking
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fsSync.createReadStream(videoPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': video.mimeType,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': video.mimeType,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      };
      res.writeHead(200, head);
      fsSync.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    console.error('Stream video error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while streaming video',
      error: error.message
    });
  }
};

// @desc    Get user's videos
// @route   GET /api/videos/my-videos
// @access  Private
const getMyVideos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Use Promise.all for parallel execution
    const [videos, total] = await Promise.all([
      Video.find({ uploadedBy: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(), // Use lean() for better performance
      Video.countDocuments({ uploadedBy: req.user.id })
    ]);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: {
        videos,
        pagination: {
          currentPage: page,
          totalPages,
          totalVideos: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get my videos error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching your videos',
      error: error.message
    });
  }
};

// @desc    Delete video
// @route   DELETE /api/videos/:id
// @access  Private
const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Check if user owns the video or is admin
    if (video.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this video'
      });
    }

    // Delete video file
    try {
      await fs.access(video.filePath);
      await fs.unlink(video.filePath);
    } catch (fileError) {
      console.error('Error deleting video file:', fileError);
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    await Video.findByIdAndDelete(req.params.id);

    // Clear cache
    const redisClient = req.app.locals.redisClient;
    try {
      await redisClient.del(`video:${req.params.id}`);
    } catch (cacheError) {
      console.error('Redis cache delete error:', cacheError);
    }

    res.status(200).json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting video',
      error: error.message
    });
  }
};

module.exports = {
  uploadVideo,
  getVideos,
  getVideoMetadata,
  streamVideo,
  getMyVideos,
  deleteVideo
};
