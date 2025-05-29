import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Video } from '../types/index.ts';
import { videoAPI } from '../services/api.ts';
import VideoCard from '../components/VideoCard.tsx';
import SearchBar from '../components/SearchBar.tsx';
import Pagination from '../components/Pagination.tsx';
import { SparkleIcon, ChartIcon, WarningIcon, LearnIcon, GridIcon, ListIcon, VideoIcon, RocketIcon, SearchIcon } from '../assets/icons/index.tsx';
import '../css/pages/Home.css';

const Home: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVideos, setTotalVideos] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeFilter, setActiveFilter] = useState<'all' | 'recent' | 'popular' | 'trending'>('all');

  const fetchVideos = useCallback(async (page: number = 1, search: string = '', sort: string = 'createdAt', order: string = 'desc') => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors

      const response = await videoAPI.getVideos({
        page,
        limit: 12,
        search,
        sortBy: sort,
        sortOrder: order,
      });

      if (response.success) {
        setVideos(response.data.videos);
        setCurrentPage(response.data.pagination.currentPage);
        setTotalPages(response.data.pagination.totalPages);
        setTotalVideos(response.data.pagination.totalVideos);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch videos';
      setError(errorMessage);
      console.error('Fetch videos error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos(currentPage, searchQuery, sortBy, sortOrder);
  }, [fetchVideos, currentPage, searchQuery, sortBy, sortOrder]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handleSort = useCallback((field: string, order: string) => {
    setSortBy(field);
    setSortOrder(order);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const retryFetch = useCallback(() => {
    fetchVideos(currentPage, searchQuery, sortBy, sortOrder);
  }, [fetchVideos, currentPage, searchQuery, sortBy, sortOrder]);

  // Memoize expensive computations
  const noVideosMessage = useMemo(() => {
    if (searchQuery) {
      return `No videos match your search for "${searchQuery}"`;
    }
    return 'No videos have been uploaded yet.';
  }, [searchQuery]);

  if (loading && videos.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="home">
      <div className="home-container">
        <div className="hero-section">
          <div className="hero-content">
            <div className="hero-badge">
              <SparkleIcon />
              Next-Generation Video Platform
            </div>
            <h1 className="hero-title">Discover Videos</h1>
            <p className="hero-subtitle">Explore amazing content from our community with our AI-powered discovery engine</p>
            <div className="hero-cta">
              <button
                className="btn btn-primary btn-lg"
                onClick={() => {
                  const searchSection = document.querySelector('.search-section');
                  searchSection?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <RocketIcon /> Start Exploring
              </button>
              <button
                className="btn btn-ghost btn-lg"
                onClick={() => {
                  window.open('https://github.com', '_blank');
                }}
              >
                <LearnIcon /> Learn More
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">{totalVideos}</span>
                <span className="stat-label"><VideoIcon /> Videos</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">1K+</span>
                <span className="stat-label"><ChartIcon /> Creators</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">10K+</span>
                <span className="stat-label"><ChartIcon /> Views</span>
              </div>
            </div>
          </div>
        </div>

        <div className="search-section">
          <div className="search-header">
            <h2 className="search-title">
              <SearchIcon />
              Find Your Content
            </h2>
            <div className="search-controls">
              <div className="sort-control">
                <label htmlFor="sort-select">Sort by:</label>
                <select
                  id="sort-select"
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    handleSort(field, order);
                  }}
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="views-desc">Most Viewed</option>
                  <option value="views-asc">Least Viewed</option>
                  <option value="title-asc">Title A-Z</option>
                  <option value="title-desc">Title Z-A</option>
                </select>
              </div>
              <div className="view-toggle">
                <button
                  className={viewMode === 'grid' ? 'active' : ''}
                  onClick={() => setViewMode('grid')}
                >
                  <GridIcon /> Grid
                </button>
                <button
                  className={viewMode === 'list' ? 'active' : ''}
                  onClick={() => setViewMode('list')}
                >
                  <ListIcon /> List
                </button>
              </div>
            </div>
          </div>
          <SearchBar onSearch={handleSearch} />
        </div>

        {error && (
          <div className="error-state">
            <WarningIcon />
            <h3>Oops! Something went wrong</h3>
            <p>{error}</p>
            <button onClick={retryFetch} className="btn btn-primary">
              Try Again
            </button>
          </div>
        )}

        {videos.length === 0 && !loading ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <VideoIcon />
            </div>
            <h3>No videos found</h3>
            <p>{noVideosMessage}</p>
            {searchQuery && (
              <button onClick={() => handleSearch('')} className="btn btn-primary">
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="results-section">

              <div className={viewMode === 'grid' ? 'videos-grid' : 'videos-list'}>
                {videos.map((video) => (
                  <VideoCard key={video._id} video={video} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination-container">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>
          </>
        )}

        {loading && videos.length > 0 && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
