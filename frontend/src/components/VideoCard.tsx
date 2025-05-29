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
    const date = new Date(video.createdAt);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, [video.createdAt]);

  const truncatedDescription = useMemo(() => {
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
    return video.mimeType.split('/')[1].toUpperCase();
  }, [video.mimeType]);

  const formattedFileSize = useMemo(() => {
    return formatFileSize(video.fileSize);
  }, [video.fileSize]);

  const formattedDuration = useMemo(() => {
    return video.duration ? formatDuration(video.duration) : '';
  }, [video.duration]);

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
          <h3 className="video-title" title={video.title}>
            {video.title}
          </h3>

          <p className="video-description" title={video.description}>
            {truncatedDescription}
          </p>

          <div className="video-meta">
            <div className="video-uploader">
              By {video.uploadedBy.username}
            </div>
            <div className="video-stats">
              <span className="views">{video.views || 0} views</span>
              <span className="upload-date">
                {formattedDate}
              </span>
              <span className="views">
                {formattedFileSize} {fileType}
              </span>
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
