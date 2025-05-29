// MongoDB initialization script for VideoStream platform
print('Starting MongoDB initialization...');

// Switch to the video-streaming-platform database
db = db.getSiblingDB('video-streaming-platform');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['username', 'email', 'password'],
      properties: {
        username: {
          bsonType: 'string',
          minLength: 3,
          maxLength: 30,
          description: 'Username must be a string between 3-30 characters'
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          description: 'Email must be a valid email address'
        },
        password: {
          bsonType: 'string',
          minLength: 6,
          description: 'Password must be at least 6 characters'
        },
        createdAt: {
          bsonType: 'date',
          description: 'Creation timestamp'
        },
        updatedAt: {
          bsonType: 'date',
          description: 'Last update timestamp'
        }
      }
    }
  }
});

db.createCollection('videos', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'description', 'filename', 'originalName', 'mimeType', 'fileSize', 'uploadedBy'],
      properties: {
        title: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 100,
          description: 'Title must be a string between 1-100 characters'
        },
        description: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 500,
          description: 'Description must be a string between 1-500 characters'
        },
        filename: {
          bsonType: 'string',
          description: 'Stored filename'
        },
        originalName: {
          bsonType: 'string',
          description: 'Original filename'
        },
        mimeType: {
          bsonType: 'string',
          description: 'File MIME type'
        },
        fileSize: {
          bsonType: 'number',
          minimum: 0,
          description: 'File size in bytes'
        },
        uploadedBy: {
          bsonType: 'objectId',
          description: 'Reference to user who uploaded the video'
        },
        tags: {
          bsonType: 'array',
          items: {
            bsonType: 'string'
          },
          description: 'Array of tags'
        },
        views: {
          bsonType: 'number',
          minimum: 0,
          description: 'Number of views'
        },
        likes: {
          bsonType: 'number',
          minimum: 0,
          description: 'Number of likes'
        },
        dislikes: {
          bsonType: 'number',
          minimum: 0,
          description: 'Number of dislikes'
        },
        isPublic: {
          bsonType: 'bool',
          description: 'Whether video is public'
        },
        createdAt: {
          bsonType: 'date',
          description: 'Creation timestamp'
        },
        updatedAt: {
          bsonType: 'date',
          description: 'Last update timestamp'
        }
      }
    }
  }
});

// Create indexes for better performance
print('Creating indexes...');

// User indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ createdAt: -1 });

// Video indexes
db.videos.createIndex({ uploadedBy: 1 });
db.videos.createIndex({ createdAt: -1 });
db.videos.createIndex({ views: -1 });
db.videos.createIndex({ likes: -1 });
db.videos.createIndex({ isPublic: 1 });
db.videos.createIndex({ tags: 1 });

// Text search index for video search functionality
db.videos.createIndex(
  {
    title: 'text',
    description: 'text',
    tags: 'text'
  },
  {
    weights: {
      title: 10,
      description: 5,
      tags: 1
    },
    name: 'video_text_search'
  }
);

// Compound indexes for common queries
db.videos.createIndex({ isPublic: 1, createdAt: -1 });
db.videos.createIndex({ uploadedBy: 1, createdAt: -1 });
db.videos.createIndex({ isPublic: 1, views: -1 });

print('MongoDB initialization completed successfully!');
print('Collections created: users, videos');
print('Indexes created for optimal performance');
print('Text search enabled for videos');
