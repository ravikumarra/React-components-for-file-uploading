import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

const FileUploadBox = () => {
  const [files, setFiles] = useState([]);
  const [invalidFiles, setInvalidFiles] = useState([]);

  const onDrop = useCallback(acceptedFiles => {
    const updatedFiles = acceptedFiles.map(file => ({
      file: file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      size: (file.size / 1024).toFixed(2) + ' KB',
      progress: 0,
      conversionType: null
    }));

    const validatedFiles = validateFiles(updatedFiles);
    const validFiles = validatedFiles.validFiles;
    const invalidFiles = validatedFiles.invalidFiles;

    setFiles(prevFiles => [...prevFiles, ...validFiles]);
    setInvalidFiles(prevInvalidFiles => [...prevInvalidFiles, ...invalidFiles]);

    validFiles.forEach(uploadFile);
  }, []);

  const validateFiles = (files) => {
    let validFiles = [];
    let invalidFiles = [];

    files.forEach(file => {
      if (file.file.type === 'application/json') {
        validFiles.push(file);
      } else {
        // Check if it's JSON text format
        try {
          JSON.parse(file.file.name); // Try parsing filename as JSON
          validFiles.push(file);
        } catch (error) {
          invalidFiles.push(file);
        }
      }
    });

    return { validFiles, invalidFiles };
  };

  const uploadFile = (file) => {
    const uploadProgress = setInterval(() => {
      setFiles(prevFiles => prevFiles.map(prevFile => {
        if (prevFile.file === file.file) {
          const newProgress = prevFile.progress + 10;
          if (newProgress >= 100) {
            clearInterval(uploadProgress);
            return { ...prevFile, progress: 100 };
          }
          return { ...prevFile, progress: newProgress };
        }
        return prevFile;
      }));
    }, 200);
  };

  useEffect(() => {
    // Clean up function to revoke object URLs
    return () => {
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  const handleConversionTypeChange = (file, conversionType) => {
    setFiles(prevFiles =>
      prevFiles.map(prevFile =>
        prevFile.file === file ? { ...prevFile, conversionType } : prevFile
      )
    );
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: '.json,application/json,text/plain',
    multiple: true
  });

  return (
    <div className="upload-container">
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'active' : ''}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop files here ...</p>
        ) : (
          <p>Drop JSON files here / Click to select JSON files</p>
        )}
      </div>
      {invalidFiles.length > 0 && (
        <div className="invalid-files">
          <h3>Invalid Files:</h3>
          <ul>
            {invalidFiles.map((invalidFile, index) => (
              <li key={index}>{invalidFile.file.name}</li>
            ))}
          </ul>
          <p>Accepted formats: JSON file, JSON text</p>
        </div>
      )}
      {files.map(file => (
        <div className="file-container" key={file.file.name}>
          <div className="file-preview">
            {file.preview ? (
              <img
                src={file.preview}
                alt={file.file.name}
                className="preview-image"
              />
            ) : (
              <div className="file-icon">
                <p>{file.file.name}</p>
              </div>
            )}
            <div className="file-details">
              <div className="file-detail">
                <strong>Name:</strong> {file.file.name}
              </div>
              <div className="file-detail">
                <strong>Size:</strong> {file.size}
              </div>
              <div className="file-detail">
                <strong>Status:</strong> {file.progress}%
              </div>
              <div className="progress-bar">
                <div
                  className="progress"
                  style={{ width: `${file.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="conversion-options">
            <label>Convert to:</label>
            <select
              value={file.conversionType || ''}
              onChange={(e) => handleConversionTypeChange(file, e.target.value)}
            >
              <option value="">Select...</option>
              <option value="csv">CSV</option>
              <option value="txt">TXT</option>
              <option value="xml">XML</option>
              <option value="pdf">PDF</option>
              <option value="doc">DOC</option>
            </select>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FileUploadBox;