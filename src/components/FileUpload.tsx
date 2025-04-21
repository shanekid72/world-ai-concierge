import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, Image, File, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  acceptedFileTypes?: string[];
  maxSize?: number;
}

const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
  'text/plain': ['.txt'],
  'application/json': ['.json'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  acceptedFileTypes = Object.keys(ACCEPTED_FILE_TYPES),
  maxSize = MAX_FILE_SIZE,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-6 h-6" />;
    if (file.type === 'application/pdf') return <FileText className="w-6 h-6" />;
    return <File className="w-6 h-6" />;
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      // Validate file size
      if (file.size > maxSize) {
        setError(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
        return;
      }

      // Validate file type
      if (!acceptedFileTypes.some(type => {
        if (type === 'image/*') return file.type.startsWith('image/');
        return file.type === type;
      })) {
        setError('File type not supported');
        return;
      }

      setError(null);
      setUploadedFile(file);

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }

      onFileUpload(file);
    }
  }, [onFileUpload, maxSize, acceptedFileTypes]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => ({
      ...acc,
      [type]: ACCEPTED_FILE_TYPES[type as keyof typeof ACCEPTED_FILE_TYPES] || []
    }), {}),
    maxFiles: 1,
    multiple: false,
  });

  return (
    <motion.div 
      className="w-full space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        {...getRootProps()}
        className={`p-6 border-2 border-dashed rounded-lg transition-all duration-200
          ${isDragActive ? 'border-cyber-blue bg-cyber-blue/10' : 'border-cyber-border hover:border-cyber-blue'}
          ${error ? 'border-red-500 bg-red-50' : ''}
          cursor-pointer`}
        onMouseEnter={() => setIsDragging(true)}
        onMouseLeave={() => setIsDragging(false)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input {...getInputProps()} />
        <motion.div 
          className="flex flex-col items-center justify-center space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <AnimatePresence mode="wait">
            {uploadedFile ? (
              <motion.div
                key="uploaded"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center space-x-2 text-cyber-green"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                >
                  <Check className="w-6 h-6" />
                </motion.div>
                <span className="text-sm">{uploadedFile.name}</span>
              </motion.div>
            ) : (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center space-y-3"
              >
                <motion.div
                  animate={{ 
                    y: isDragActive ? [0, -5, 0] : 0,
                    transition: { 
                      duration: 1,
                      repeat: isDragActive ? Infinity : 0,
                      ease: "easeInOut"
                    }
                  }}
                >
                  <Upload className={`w-8 h-8 ${isDragActive ? 'text-cyber-blue' : 'text-cyber-secondary'}`} />
                </motion.div>
                <motion.p 
                  className="text-sm text-cyber-secondary"
                  animate={{ 
                    scale: isDragActive ? 1.05 : 1,
                    transition: { duration: 0.2 }
                  }}
                >
                  {isDragActive
                    ? 'Drop the file here'
                    : 'Drag and drop a file here, or click to select'}
                </motion.p>
                <motion.div
                  className="flex flex-col items-center space-y-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="text-xs text-cyber-secondary/70">
                    Supported formats: PDF, Images, Text, JSON, Word
                  </p>
                  <p className="text-xs text-cyber-secondary/70">
                    Max size: {maxSize / (1024 * 1024)}MB
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4"
          >
            <h3 className="text-sm font-medium text-cyber-secondary mb-2">Preview</h3>
            <motion.div 
              className="relative rounded-lg overflow-hidden border border-cyber-border"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <motion.img
                src={preview}
                alt="File preview"
                className="w-full h-48 object-contain bg-cyber-darker"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 flex items-center text-red-500 text-sm"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
            >
              <X className="w-4 h-4 mr-1" />
            </motion.div>
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {uploadedFile && !preview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-4 flex items-center space-x-2 p-3 bg-cyber-darker/50 rounded-lg border border-cyber-border"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
            >
              {getFileIcon(uploadedFile)}
            </motion.div>
            <div className="flex-1 min-w-0">
              <motion.p 
                className="text-sm text-cyber-secondary truncate"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {uploadedFile.name}
              </motion.p>
              <motion.p 
                className="text-xs text-cyber-secondary/70"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {(uploadedFile.size / 1024).toFixed(1)} KB
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}; 