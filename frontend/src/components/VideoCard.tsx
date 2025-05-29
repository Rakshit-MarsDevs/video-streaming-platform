import React, { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Video } from '../types/index.ts';
import { formatFileSize, formatDuration } from '../utils/performance.ts';
import '../css/components/VideoCard.css';

interface VideoCardProps {
  video: Video;
}

const VideoCard: React.FC<VideoCardProps> = memo(({ video }) => {
  // Memoize expensive computations
  const formattedDate = useMemo(() => {
    if (!video.createdAt) return null;
    const date = new Date(video.createdAt);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, [video.createdAt]);

  const truncatedDescription = useMemo(() => {
    if (!video.description) return null;
    return video.description.length > 100
      ? `${video.description.substring(0, 100)}...`
      : video.description;
  }, [video.description]);

  const visibleTags = useMemo(() => {
    if (!video.tags || video.tags.length === 0) return null;
    return {
      visible: video.tags.slice(0, 3),
      remaining: video.tags.length > 3 ? video.tags.length - 3 : 0
    };
  }, [video.tags]);

  const fileType = useMemo(() => {
    if (!video.mimeType) return null;
    return video.mimeType.split('/')[1].toUpperCase();
  }, [video.mimeType]);

  const formattedFileSize = useMemo(() => {
    if (!video.fileSize) return null;
    return formatFileSize(video.fileSize);
  }, [video.fileSize]);

  const formattedDuration = useMemo(() => {
    if (!video.duration) return null;
    return formatDuration(video.duration);
  }, [video.duration]);

  const userInitial = useMemo(() => {
    if (!video.uploadedBy?.username) return null;
    return video.uploadedBy.username.charAt(0).toUpperCase();
  }, [video.uploadedBy]);

  const hasUserInfo = useMemo(() => {
    return Boolean(video.uploadedBy?.username);
  }, [video.uploadedBy]);

  return (
    <div className="video-card">
      <Link to={`/video/${video._id}`} className="video-card-link">
        <div className="video-thumbnail">
          {video.thumbnail ? (
            <img src={video.thumbnail} alt={video.title} />
          ) : (
            <div className="video-placeholder">
              <div className="play-icon">▶</div>
            </div>
          )}
          {formattedDuration && (
            <div className="video-duration">
              {formattedDuration}
            </div>
          )}
        </div>

        <div className="video-info">
          <div className="video-main-info">
            <h3 className="video-title" title={video.title}>
              {video.title}
            </h3>

            {truncatedDescription && (
              <div className="video-description-container">
                <span className="description-label">Description - </span>
                <p className="video-description" title={video.description}>
                  {truncatedDescription}
                </p>
              </div>
            )}
            
            {hasUserInfo && (
              <div className="video-uploader">
                {userInitial && (
                  <div className="uploader-avatar">
                    {userInitial}
                  </div>
                )}
                <span className="uploader-name">
                  By {video.uploadedBy.username}
                </span>
              </div>
            )}
          </div>

          <div className="video-meta">
            <div className="video-stats">
              <span>{video.views || 0} views</span>
              {formattedDate && <span>{formattedDate}</span>}
              {formattedFileSize && <span>{formattedFileSize}</span>}
            </div>
          </div>

          {visibleTags && (
            <div className="video-tags">
              {visibleTags.visible.map((tag, index) => (
                <span key={`${video._id}-tag-${index}`} className="tag">
                  {tag}
                </span>
              ))}
              {visibleTags.remaining > 0 && (
                <span className="tag-more">+{visibleTags.remaining}</span>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
});

// Add display name for debugging
VideoCard.displayName = 'VideoCard';

export default VideoCard;
