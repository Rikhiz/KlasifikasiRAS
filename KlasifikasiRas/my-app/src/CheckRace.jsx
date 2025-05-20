import React, { useState, useCallback } from 'react';
import { Upload, X, ChevronRight, AlertCircle, Check, Loader, User } from 'lucide-react';
import './CheckRace.css';

function CheckRace() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    processFile(selectedFile);
  };
  
  const processFile = (selectedFile) => {
    setError(null);
    setResults(null);
    setSelectedPerson(null);
    
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
    setSelectedPerson(null);
  };
  
  const analyzeImage = async () => {
    if (!file) return;
    
    setIsLoading(true);
    setResults(null);
    setSelectedPerson(null);
    
    try {
      // Create FormData to send the image file
      const formData = new FormData();
      formData.append('image', file);
      
      // API endpoint where the Python backend with YOLO is hosted
      const response = await fetch('http://localhost:5000/api/analyze-ethnicity', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }
      
      // Parse the response from your Python backend
      const data = await response.json();
      
      if (data.persons_count === 0) {
        setError('No persons detected in the image');
        return;
      }
      
      // Set results and select the first person by default
      setResults(data);
      setSelectedPerson(data.results[0].person_id);
      
    } catch (err) {
      console.error('Error analyzing image:', err);
      setError(err.message || 'Failed to analyze image. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get data for the currently selected person
  const getSelectedPersonData = () => {
    if (!results || !selectedPerson) return null;
    
    return results.results.find(person => person.person_id === selectedPerson);
  };
  
  // Format ethnic group data for the selected person
  const formatEthnicGroups = (personData) => {
    if (!personData || !personData.predictions) return [];
    
    return [
      { 
        name: 'Black', 
        probability: personData.predictions.Black || 0, 
        details: personData.details?.Black || 'Black features analysis' 
      },
      { 
        name: 'East Asian', 
        probability: personData.predictions['East Asian'] || 0, 
        details: personData.details?.['East Asian'] || 'East Asian features analysis' 
      },
      { 
        name: 'White', 
        probability: personData.predictions.White || 0, 
        details: personData.details?.White || 'White features analysis' 
      },
      { 
        name: 'Indian', 
        probability: personData.predictions.Indian || 0, 
        details: personData.details?.Indian || 'Indian features analysis' 
      },
      { 
        name: 'Latino/Hispanic', 
        probability: personData.predictions.Latino_Hispanic || 0, 
        details: personData.details?.Latino_Hispanic || 'Latino/Hispanic features analysis' 
      },
      { 
        name: 'Middle Eastern', 
        probability: personData.predictions['Middle Eastern'] || 0, 
        details: personData.details?.['Middle Eastern'] || 'Middle Eastern features analysis' 
      },
      { 
        name: 'Southeast Asian', 
        probability: personData.predictions['Southeast Asian'] || 0, 
        details: personData.details?.['Southeast Asian'] || 'Southeast Asian features analysis' 
      }
    ];
  };
  
  // Draw person boxes on the preview image
  const renderPersonBoxes = () => {
    if (!results || !results.results || results.results.length === 0) return null;
    
    return (
      <div className="person-boxes-container" style={{ position: 'relative' }}>
        <img src={preview} alt="Preview" className="preview-image" />
        
        {results.results.map((person) => {
          const [x, y, w, h] = person.box;
          const isSelected = selectedPerson === person.person_id;
          
          return (
            <div 
              key={person.person_id}
              className={`person-box ${isSelected ? 'selected' : ''}`}
              style={{
                position: 'absolute',
                left: `${x}px`,
                top: `${y}px`,
                width: `${w}px`,
                height: `${h}px`,
                border: `2px solid ${isSelected ? '#4CAF50' : '#FFA500'}`,
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}
              onClick={() => setSelectedPerson(person.person_id)}
            >
              <div 
                className="person-label" 
                style={{
                  position: 'absolute',
                  top: '-25px',
                  left: '0',
                  background: isSelected ? '#4CAF50' : '#FFA500',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontSize: '12px'
                }}
              >
                Person {person.person_id}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  const selectedData = getSelectedPersonData();
  
  return (
    <div className="race-checker-container">
      <div className="race-checker-card">
        <div className="race-checker-header">
          <h1 className="race-checker-title">Facial Ethnicity & Person Analysis</h1>
          <p className="race-checker-subtitle">
            Our advanced AI detects people using YOLOv4 and analyzes facial features to determine ethnic composition
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
                {results && results.results ? renderPersonBoxes() : (
                  <div className="image-preview">
                    <img 
                      src={preview} 
                      alt="Preview" 
                      className="preview-image" 
                    />
                  </div>
                )}
                <div className="image-actions">
                  <p className="image-filename">{file?.name}</p>
                  <button 
                    className="remove-image-button" 
                    onClick={clearImage}
                    aria-label="Remove image"
                  >
                    <X size={16} /> Remove
                  </button>
                </div>
                
                {!isLoading && !results && (
                  <button 
                    className="analyze-button"
                    onClick={analyzeImage}
                  >
                    Detect People & Analyze <ChevronRight size={18} />
                  </button>
                )}
              </div>
              
              {isLoading && (
                <div className="loading-container">
                  <Loader className="loading-spinner" size={40} />
                  <p className="loading-text">Detecting people and analyzing facial features...</p>
                  <div className="progress-bar">
                    <div className="progress-fill"></div>
                  </div>
                </div>
              )}
              
              {results && selectedData && (
                <div className="results-container">
                  <div className="results-header">
                    <div className="person-summary">
                      <User size={18} />
                      <span>{results.persons_count} {results.persons_count === 1 ? 'person' : 'people'} detected</span>
                      {results.persons_count > 1 && (
                        <select 
                          value={selectedPerson} 
                          onChange={(e) => setSelectedPerson(parseInt(e.target.value))}
                          className="person-selector"
                        >
                          {results.results.map(person => (
                            <option key={person.person_id} value={person.person_id}>
                              Person {person.person_id}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div className="results-confidence">
                      <div className="confidence-indicator">
                        <Check size={16} />
                      </div>
                      <div>
                        <p>Detection confidence: {Math.round(selectedData.detection_confidence * 100)}%</p>
                        <p>Analysis confidence: {Math.round(selectedData.confidence * 100)}%</p>
                        <p>
                          Dominant Ethnicity: <strong>
                            {formatEthnicGroups(selectedData)
                              .reduce((max, group) => group.probability > max.probability ? group : max, {probability: 0})
                              .name}
                          </strong>
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ethnic-distribution">
                    <h3 className="results-section-title">Ethnic Distribution</h3>

                    {formatEthnicGroups(selectedData)
                      .sort((a, b) => b.probability - a.probability)
                      .map((group, index) => (
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
                        <span className="feature-value">{selectedData.facial_features?.eye_shape || "Not analyzed"}</span>
                      </div>
                      <div className="feature">
                        <span className="feature-label">Nose Structure:</span>
                        <span className="feature-value">{selectedData.facial_features?.nose_structure || "Not analyzed"}</span>
                      </div>
                      <div className="feature">
                        <span className="feature-label">Facial Structure:</span>
                        <span className="feature-value">{selectedData.facial_features?.facial_structure || "Not analyzed"}</span>
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