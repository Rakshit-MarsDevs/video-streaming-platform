import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { Video } from '../types/index.ts';
import { videoAPI } from '../services/api.ts';
import '../css/pages/VideoPlayer.css';

const VideoPlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fromCache, setFromCache] = useState(false);

  useEffect(() => {
    const fetchVideo = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await videoAPI.getVideo(id);

        if (response.success) {
          setVideo(response.data.video);
          setFromCache(response.data.fromCache || false);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load video');
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading video...</div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="error-container">
        <h2>Video Not Found</h2>
        <p>{error || 'The video you are looking for does not exist.'}</p>
        <Link to="/" className="back-home-btn">
          Back to Home
        </Link>
      </div>
    );
  }

  const videoUrl = videoAPI.getVideoStreamUrl(video._id);

  return (
    <div className="video-player-container">
      <div className="video-player-wrapper">
        <div className="player-container">
          <ReactPlayer
            url={videoUrl}
            controls
            width="100%"
            height="100%"
            config={{
              file: {
                attributes: {
                  controlsList: 'nodownload',
                },
              },
            }}
          />
        </div>

        {fromCache && (
          <div className="cache-indicator">
            <span className="cache-badge">📦 Served from cache</span>
          </div>
        )}
      </div>

      <div className="video-details">
        <div className="video-header">
          <h1 className="video-title">{video.title}</h1>
          <div className="video-stats">
            <span className="views">{video.views} views</span>
            <span className="upload-date">
              Uploaded on {formatDate(video.createdAt)}
            </span>
          </div>
        </div>

        <div className="video-meta">
          <div className="uploader-info">
            <div className="uploader-avatar">
              {video.uploadedBy.username.charAt(0).toUpperCase()}
            </div>
            <div className="uploader-details">
              <h3 className="uploader-name">{video.uploadedBy.username}</h3>
              <p className="uploader-role">Content Creator</p>
            </div>
          </div>

          <div className="video-actions">
            <button className="action-btn like-btn">
              👍 {video.likes}
            </button>
            <button className="action-btn dislike-btn">
              👎 {video.dislikes}
            </button>
          </div>
        </div>

        <div className="video-description">
          <h3>Description</h3>
          <p>{video.description}</p>
        </div>

        {video.tags && video.tags.length > 0 && (
          <div className="video-tags">
            <h3>Tags</h3>
            <div className="tags-list">
              {video.tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="video-technical-info">
          <h3>Technical Information</h3>
          <div className="tech-info-grid">
            <div className="tech-info-item">
              <span className="label">File Size:</span>
              <span className="value">{formatFileSize(video.fileSize)}</span>
            </div>
            <div className="tech-info-item">
              <span className="label">Format:</span>
              <span className="value">{video.mimeType}</span>
            </div>
            <div className="tech-info-item">
              <span className="label">Original Name:</span>
              <span className="value">{video.originalName}</span>
            </div>
            <div className="tech-info-item">
              <span className="label">Upload Date:</span>
              <span className="value">{formatDate(video.createdAt)}</span>
            </div>
            {video.updatedAt !== video.createdAt && (
              <div className="tech-info-item">
                <span className="label">Last Updated:</span>
                <span className="value">{formatDate(video.updatedAt)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="back-navigation">
        <Link to="/" className="back-btn">
          ← Back to Videos
        </Link>
      </div>
    </div>
  );
};

export default VideoPlayer;
