import axios, { AxiosProgressEvent } from 'axios';

export interface FileUploadResponse {
  success: boolean;
  fileUrl?: string;
  error?: string;
}

export const uploadFile = async (file: File): Promise<FileUploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        );
        console.log(`Upload progress: ${percentCompleted}%`);
      },
    });

    return {
      success: true,
      fileUrl: response.data.fileUrl,
    };
  } catch (error) {
    console.error('File upload error:', error);
    return {
      success: false,
      error: 'Failed to upload file. Please try again.',
    };
  }
};

export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  // File size validation (10MB max)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit`,
    };
  }

  // File type validation
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'text/plain',
    'application/json',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  const isValidType = allowedTypes.some((type) => {
    if (type === 'image/*') return file.type.startsWith('image/');
    return file.type === type;
  });

  if (!isValidType) {
    return {
      isValid: false,
      error: 'File type not supported',
    };
  }

  return { isValid: true };
};

export const getFilePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    } else {
      reject(new Error('Preview not available for this file type'));
    }
  });
}; 