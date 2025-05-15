import React, { useState, useCallback } from 'react';
import { Upload, X, ChevronRight, AlertCircle, Check, Loader } from 'lucide-react';
import './CheckRace.css';

function CheckRace() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    processFile(selectedFile);
  };
  
  const processFile = (selectedFile) => {
    setError(null);
    
    if (!selectedFile) return;
    
    // Validate file type
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG)');
      return;
    }
    
    // Validate file size (5MB max)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size should not exceed 5MB');
      return;
    }
    
    setFile(selectedFile);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.onerror = () => {
      setError('Error reading file');
    };
    reader.readAsDataURL(selectedFile);
  };
  
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);
  
  const clearImage = () => {
    setFile(null);
    setPreview(null);
    setResults(null);
  };
  
  const analyzeImage = () => {
    if (!file) return;
    
    setIsLoading(true);
    setResults(null);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setResults({
        ethnicGroups: [
          { name: 'Asian', probability: 0.78, details: 'East Asian features predominant' },
          { name: 'European', probability: 0.15, details: 'Minor European features detected' },
          { name: 'South Asian', probability: 0.05, details: 'Slight South Asian characteristics' },
          { name: 'African', probability: 0.02, details: 'Minimal African features' }
        ],
        confidence: 0.92,
        analysis: {
          facialFeatures: {
            eyeShape: 'Almond',
            noseStructure: 'Medium, straight',
            facialStructure: 'Oval with prominent cheekbones'
          }
        }
      });
    }, 2500);
  };
  
  return (
    <div className="race-checker-container">
      <div className="race-checker-card">
        <div className="race-checker-header">
          <h1 className="race-checker-title">Facial Ethnicity Analysis</h1>
          <p className="race-checker-subtitle">
            Our advanced AI analyzes facial features to determine ethnic composition with high accuracy
          </p>
        </div>
        
        <div className="race-checker-content">
          {!preview ? (
            <div 
              className={`upload-area ${isDragging ? 'dragging' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="upload-icon">
                <Upload size={40} />
              </div>
              <div className="upload-text">
                <p className="upload-primary-text">Drag and drop your image here</p>
                <p className="upload-secondary-text">or</p>
                <label htmlFor="upload-photo" className="upload-button">
                  Choose File
                  <input 
                    id="upload-photo" 
                    type="file" 
                    accept="image/jpeg, image/png" 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              <p className="upload-formats">Supported formats: JPG, PNG (max 5MB)</p>
            </div>
          ) : (
            <div className="analysis-container">
              <div className="image-preview-container">
                <div className="image-preview">
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="preview-image" 
                  />
                  <button 
                    className="remove-image-button" 
                    onClick={clearImage}
                    aria-label="Remove image"
                  >
                    <X size={16} />
                  </button>
                </div>
                <p className="image-filename">{file?.name}</p>
                
                {!isLoading && !results && (
                  <button 
                    className="analyze-button"
                    onClick={analyzeImage}
                  >
                    Analyze Image <ChevronRight size={18} />
                  </button>
                )}
              </div>
              
              {isLoading && (
                <div className="loading-container">
                  <Loader className="loading-spinner" size={40} />
                  <p className="loading-text">Analyzing facial features...</p>
                  <div className="progress-bar">
                    <div className="progress-fill"></div>
                  </div>
                </div>
              )}
              
              {results && (
                <div className="results-container">
                  <div className="results-header">
                    <div className="results-confidence">
                      <div className="confidence-indicator">
                        <Check size={16} />
                      </div>
                      <p>Analysis confidence: {Math.round(results.confidence * 100)}%</p>
                    </div>
                  </div>
                  
                  <div className="ethnic-distribution">
                    <h3 className="results-section-title">Ethnic Distribution</h3>
                    
                    {results.ethnicGroups.map((group, index) => (
                      <div key={index} className="ethnic-group">
                        <div className="ethnic-group-header">
                          <span className="ethnic-group-name">{group.name}</span>
                          <span className="ethnic-group-percentage">{Math.round(group.probability * 100)}%</span>
                        </div>
                        <div className="ethnic-group-bar">
                          <div 
                            className="ethnic-group-fill"
                            style={{ width: `${group.probability * 100}%` }}
                          ></div>
                        </div>
                        <p className="ethnic-group-details">{group.details}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="facial-features">
                    <h3 className="results-section-title">Detected Facial Characteristics</h3>
                    <div className="features-grid">
                      <div className="feature">
                        <span className="feature-label">Eye Shape:</span>
                        <span className="feature-value">{results.analysis.facialFeatures.eyeShape}</span>
                      </div>
                      <div className="feature">
                        <span className="feature-label">Nose Structure:</span>
                        <span className="feature-value">{results.analysis.facialFeatures.noseStructure}</span>
                      </div>
                      <div className="feature">
                        <span className="feature-label">Facial Structure:</span>
                        <span className="feature-value">{results.analysis.facialFeatures.facialStructure}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="results-disclaimer">
                    <AlertCircle size={14} />
                    <p>
                      Results are for informational purposes only. Ethnicity is complex and goes beyond physical appearance.
                    </p>
                  </div>
                  
                  <button 
                    className="new-analysis-button"
                    onClick={clearImage}
                  >
                    New Analysis
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {error && (
          <div className="error-message">
            <AlertCircle size={16} />
            <p>{error}</p>
          </div>
        )}
        
        <div className="race-checker-footer">
          <p>Privacy note: Images are not stored on our servers and are processed securely.</p>
        </div>
      </div>
    </div>
  );
}

export default CheckRace;