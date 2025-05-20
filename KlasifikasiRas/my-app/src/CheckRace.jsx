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
      setError('Silakan unggah file gambar yang valid (JPG, PNG)');
      return;
    }
    
    // Validate file size (5MB max)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('Ukuran file tidak boleh melebihi 5MB');
      return;
    }
    
    setFile(selectedFile);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.onerror = () => {
      setError('Error membaca file');
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
        setError('Tidak ada orang yang terdeteksi dalam gambar');
        return;
      }
      
      // Set results and select the first person by default
      setResults(data);
      setSelectedPerson(data.results[0].person_id);
      
    } catch (err) {
      console.error('Error analyzing image:', err);
      setError(err.message || 'Gagal menganalisis gambar. Silakan coba lagi nanti.');
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
        name: 'Negro/Hitam', 
        probability: personData.predictions.Black || 0, 
        details: personData.details?.Black || 'Analisis fitur ras Negro/Hitam' 
      },
      { 
        name: 'Asia Timur', 
        probability: personData.predictions['East Asian'] || 0, 
        details: personData.details?.['East Asian'] || 'Analisis fitur ras Asia Timur' 
      },
      { 
        name: 'Kaukasia', 
        probability: personData.predictions.White || 0, 
        details: personData.details?.White || 'Analisis fitur ras Kaukasia' 
      },
      { 
        name: 'India', 
        probability: personData.predictions.Indian || 0, 
        details: personData.details?.Indian || 'Analisis fitur ras India' 
      },
      { 
        name: 'Latin/Hispanik', 
        probability: personData.predictions.Latino_Hispanic || 0, 
        details: personData.details?.Latino_Hispanic || 'Analisis fitur ras Latin/Hispanik' 
      },
      { 
        name: 'Timur Tengah', 
        probability: personData.predictions['Middle Eastern'] || 0, 
        details: personData.details?.['Middle Eastern'] || 'Analisis fitur ras Timur Tengah' 
      },
      { 
        name: 'Asia Tenggara', 
        probability: personData.predictions['Southeast Asian'] || 0, 
        details: personData.details?.['Southeast Asian'] || 'Analisis fitur ras Asia Tenggara' 
      }
    ];
  };
  
  // Draw person boxes on the preview image
  const renderPersonBoxes = () => {
    if (!results || !results.results || results.results.length === 0) return null;
    
    return (
      <div className="person-boxes-container" style={{ position: 'relative' }}>
        <img src={preview} alt="Pratinjau" className="preview-image" />
        
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
                Orang {person.person_id}
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
          <h1 className="race-checker-title">Analisis Etnis Wajah & Identifikasi Orang</h1>
          <p className="race-checker-subtitle">
            AI canggih kami mendeteksi orang menggunakan YOLOv4 dan menganalisis fitur wajah untuk menentukan komposisi etnis
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
                <p className="upload-primary-text">Tarik dan letakkan gambar Anda di sini</p>
                <p className="upload-secondary-text">atau</p>
                <label htmlFor="upload-photo" className="upload-button">
                  Pilih File
                  <input 
                    id="upload-photo" 
                    type="file" 
                    accept="image/jpeg, image/png" 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              <p className="upload-formats">Format yang didukung: JPG, PNG (maksimal 5MB)</p>
            </div>
          ) : (
            <div className="analysis-container">
              <div className="image-preview-container">
                {results && results.results ? renderPersonBoxes() : (
                  <div className="image-preview">
                    <img 
                      src={preview} 
                      alt="Pratinjau" 
                      className="preview-image" 
                    />
                  </div>
                )}
                <div className="image-actions">
                  <p className="image-filename">{file?.name}</p>
                  <button 
                    className="remove-image-button" 
                    onClick={clearImage}
                    aria-label="Hapus gambar"
                  >
                    <X size={16} /> Hapus
                  </button>
                </div>
                
                {!isLoading && !results && (
                  <button 
                    className="analyze-button"
                    onClick={analyzeImage}
                  >
                    Deteksi Orang & Analisis <ChevronRight size={18} />
                  </button>
                )}
              </div>
              
              {isLoading && (
                <div className="loading-container">
                  <Loader className="loading-spinner" size={40} />
                  <p className="loading-text">Mendeteksi orang dan menganalisis fitur wajah...</p>
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
                      <span>{results.persons_count} {results.persons_count === 1 ? 'orang' : 'orang'} terdeteksi</span>
                      {results.persons_count > 1 && (
                        <select 
                          value={selectedPerson} 
                          onChange={(e) => setSelectedPerson(parseInt(e.target.value))}
                          className="person-selector"
                        >
                          {results.results.map(person => (
                            <option key={person.person_id} value={person.person_id}>
                              Orang {person.person_id}
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
                        <p>Kepercayaan deteksi: {Math.round(selectedData.detection_confidence * 100)}%</p>
                        <p>Kepercayaan analisis: {Math.round(selectedData.confidence * 100)}%</p>
                        <p>
                          Etnis Dominan: <strong>
                            {formatEthnicGroups(selectedData)
                              .reduce((max, group) => group.probability > max.probability ? group : max, {probability: 0})
                              .name}
                          </strong>
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ethnic-distribution">
                    <h3 className="results-section-title">Distribusi Etnis</h3>

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
                  
                 
                  
                  <div className="results-disclaimer">
                    <AlertCircle size={14} />
                    <p>
                      Hasil hanya untuk tujuan informasi. Etnis adalah hal yang kompleks dan lebih dari sekadar tampilan fisik.
                    </p>
                  </div>
                  
                  <button 
                    className="new-analysis-button"
                    onClick={clearImage}
                  >
                    Analisis Baru
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
          <p>Catatan privasi: Gambar tidak disimpan di server kami dan diproses dengan aman.</p>
        </div>
      </div>
    </div>
  );
}

export default CheckRace;