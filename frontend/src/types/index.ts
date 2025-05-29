export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface Video {
  _id: string;
  title: string;
  description: string;
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  duration?: number;
  thumbnail?: string;
  views: number;
  likes: number;
  dislikes: number;
  uploadedBy: {
    _id: string;
    username: string;
  };
  isPublic: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface VideoResponse {
  success: boolean;
  data: {
    video: Video;
    fromCache?: boolean;
  };
}

export interface VideosResponse {
  success: boolean;
  data: {
    videos: Video[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalVideos: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface VideoUploadData {
  title: string;
  description: string;
  tags: string;
  video: File;
}
