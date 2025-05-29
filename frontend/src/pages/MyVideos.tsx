import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Video } from '../types/index.ts';
import { videoAPI } from '../services/api.ts';
import VideoCard from '../components/VideoCard.tsx';
import Pagination from '../components/Pagination.tsx';
import '../css/pages/MyVideos.css';

const MyVideos: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVideos, setTotalVideos] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchMyVideos = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await videoAPI.getMyVideos({
        page,
        limit: 12,
      });

      if (response.success) {
        setVideos(response.data.videos);
        setCurrentPage(response.data.pagination.currentPage);
        setTotalPages(response.data.pagination.totalPages);
        setTotalVideos(response.data.pagination.totalVideos);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch your videos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyVideos(currentPage);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteVideo = async (videoId: string, videoTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${videoTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(videoId);
      const response = await videoAPI.deleteVideo(videoId);

      if (response.success) {
        // Remove the video from the current list
        setVideos(videos.filter(video => video._id !== videoId));
        setTotalVideos(prev => prev - 1);

        // If this was the last video on the current page and we're not on page 1,
        // go to the previous page
        if (videos.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          // Refresh the current page to get updated data
          fetchMyVideos(currentPage);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete video');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading && videos.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading your videos...</div>
      </div>
    );
  }

  return (
    <div className="my-videos-container">
      <div className="my-videos-header">
        <h1>My Videos</h1>
        <p>Manage your uploaded content</p>
        <Link to="/upload" className="upload-new-btn">
          + Upload New Video
        </Link>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => fetchMyVideos(currentPage)}>
            Try Again
          </button>
        </div>
      )}

      {videos.length === 0 && !loading ? (
        <div className="no-videos">
          <div className="no-videos-icon">📹</div>
          <h3>No videos uploaded yet</h3>
          <p>Start sharing your content with the community!</p>
          <Link to="/upload" className="upload-first-btn">
            Upload Your First Video
          </Link>
        </div>
      ) : (
        <>
          <div className="videos-info">
            <p>
              {totalVideos} video{totalVideos !== 1 ? 's' : ''} uploaded
            </p>
          </div>

          <div className="my-videos-grid">
            {videos.map((video) => (
              <div key={video._id} className="my-video-item">
                <VideoCard video={video} />

                <div className="video-actions">
                  <Link
                    to={`/video/${video._id}`}
                    className="action-btn view-btn"
                  >
                    👁️ View
                  </Link>

                  <button
                    onClick={() => handleDeleteVideo(video._id, video.title)}
                    className="action-btn delete-btn"
                    disabled={deletingId === video._id}
                  >
                    {deletingId === video._id ? '⏳ Deleting...' : '🗑️ Delete'}
                  </button>
                </div>

                <div className="video-stats-detailed">
                  <div className="stat-item">
                    <span className="stat-label">Views:</span>
                    <span className="stat-value">{video.views}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Likes:</span>
                    <span className="stat-value">{video.likes}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Size:</span>
                    <span className="stat-value">{formatFileSize(video.fileSize)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Uploaded:</span>
                    <span className="stat-value">{formatDate(video.createdAt)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Status:</span>
                    <span className={`stat-value ${video.isPublic ? 'public' : 'private'}`}>
                      {video.isPublic ? '🌐 Public' : '🔒 Private'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {loading && videos.length > 0 && (
        <div className="loading-overlay">
          <div className="loading-spinner">Loading...</div>
        </div>
      )}
    </div>
  );
};

export default MyVideos;
