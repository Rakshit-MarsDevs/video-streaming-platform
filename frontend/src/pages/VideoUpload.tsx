import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { videoAPI } from '../services/api.ts';
import '../css/pages/VideoUpload.css';

const VideoUpload: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a valid video file (MP4, AVI, MOV, WMV, WebM)');
        return;
      }

      // Validate file size (100MB limit)
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        setError('File size must be less than 100MB');
        return;
      }

      setSelectedFile(file);
      setError('');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.title.trim()) {
      setError('Please enter a video title');
      return;
    }

    if (!formData.description.trim()) {
      setError('Please enter a video description');
      return;
    }

    if (!selectedFile) {
      setError('Please select a video file');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        tags: formData.tags.trim(),
        video: selectedFile,
      };

      // Simulate upload progress (since we can't track real progress easily with current setup)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const response = await videoAPI.uploadVideo(uploadData);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success) {
        setSuccess('Video uploaded successfully!');
        setTimeout(() => {
          navigate('/my-videos');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload video');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      tags: '',
    });
    setSelectedFile(null);
    setError('');
    setSuccess('');
    setUploadProgress(0);
  };

  return (
    <div className="upload-container">
      <div className="upload-card">
        <h2>Upload Video</h2>
        <p>Share your content with the community</p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label htmlFor="title">Video Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter a descriptive title for your video"
              maxLength={100}
              required
              disabled={uploading}
            />
            <small className="char-count">{formData.title.length}/100</small>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your video content..."
              maxLength={500}
              rows={4}
              required
              disabled={uploading}
            />
            <small className="char-count">{formData.description.length}/500</small>
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="Enter tags separated by commas (e.g., tutorial, coding, javascript)"
              disabled={uploading}
            />
            <small className="help-text">
              Add relevant tags to help people discover your video
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="video">Video File *</label>
            <div className="file-input-container">
              <input
                type="file"
                id="video"
                accept="video/*"
                onChange={handleFileChange}
                required
                disabled={uploading}
                className="file-input"
              />
              <label htmlFor="video" className="file-input-label">
                {selectedFile ? selectedFile.name : 'Choose video file'}
              </label>
            </div>
            {selectedFile && (
              <div className="file-info">
                <p>
                  <strong>File:</strong> {selectedFile.name}
                </p>
                <p>
                  <strong>Size:</strong> {formatFileSize(selectedFile.size)}
                </p>
                <p>
                  <strong>Type:</strong> {selectedFile.type}
                </p>
              </div>
            )}
            <small className="help-text">
              Supported formats: MP4, AVI, MOV, WMV, WebM (Max: 100MB)
            </small>
          </div>

          {uploading && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p>Uploading... {uploadProgress}%</p>
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={resetForm}
              className="reset-btn"
              disabled={uploading}
            >
              Reset
            </button>
            <button
              type="submit"
              className="upload-btn"
              disabled={uploading || !selectedFile}
            >
              {uploading ? 'Uploading...' : 'Upload Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VideoUpload;
