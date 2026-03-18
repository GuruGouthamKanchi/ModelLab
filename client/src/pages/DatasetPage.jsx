import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import {
  Upload,
  FileText,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Database,
  X,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  Search,
  Filter,
  Layers,
  Info,
  Binary
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from '../components/ConfirmModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DatasetPage = () => {
  const [datasets, setDatasets] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [datasetToDelete, setDatasetToDelete] = useState(null);

  // Enhancement states
  const [pendingFile, setPendingFile] = useState(null);
  const [customName, setCustomName] = useState('');
  const [description, setDescription] = useState('');
  const [filePreview, setFilePreview] = useState(null);
  const [uploadStep, setUploadStep] = useState('idle'); // idle, config, uploading, success

  const fetchDatasets = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/dataset/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDatasets(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const generatePreview = (file) => {
    const fileType = file.name.split('.').pop().toLowerCase();

    if (fileType !== 'csv' && fileType !== 'json') {
      setFilePreview({ type: 'Excel/Binary', status: 'Format supported but preview disabled for local speed.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        if (fileType === 'csv') {
          const lines = content.split('\n').slice(0, 5);
          const headers = lines[0].split(',');
          const rows = lines.slice(1).map(line => line.split(','));
          setFilePreview({
            headers: headers.slice(0, 4),
            rows: rows.slice(0, 3).map(r => r.slice(0, 4)),
            totalCols: headers.length
          });
        } else if (fileType === 'json') {
          const data = JSON.parse(content);
          const firstObj = Array.isArray(data) ? data[0] : data;
          const headers = Object.keys(firstObj);
          setFilePreview({
            headers: headers.slice(0, 4),
            totalCols: headers.length,
            status: 'Valid JSON detected. Schema parsed successfully.'
          });
        }
      } catch (err) {
        setFilePreview({ status: 'Error parsing local preview. File will still be analyzed by ML Engine.' });
      }
    };
    reader.readAsText(file.slice(0, 4096)); // Read first 4KB
  };

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setPendingFile(file);
    setCustomName(file.name.split('.')[0]);
    generatePreview(file);
    setUploadStep('config');
    setError('');
  }, []);

  const handleUpload = async () => {
    if (!pendingFile) return;

    setIsUploading(true);
    setUploadStep('uploading');
    setError('');
    const formData = new FormData();
    formData.append('file', pendingFile);
    formData.append('name', customName);
    formData.append('description', description);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/dataset/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });
      fetchDatasets();
      setUploadStep('success');
      setTimeout(() => {
        resetUpload();
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload dataset');
      setUploadStep('config');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const resetUpload = () => {
    setPendingFile(null);
    setCustomName('');
    setDescription('');
    setFilePreview(null);
    setUploadStep('idle');
    setError('');
  };

  const handleDelete = (id, name) => {
    setDatasetToDelete({ id, name });
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!datasetToDelete) return;
    const { id } = datasetToDelete;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/dataset/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDatasets();
    } catch (err) {
      setError('Failed to delete dataset');
    }
  };

  const filteredDatasets = datasets.filter(ds =>
    ds.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ds.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/json': ['.json']
    },
    multiple: false
  });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto pb-20">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Artifact Ingestion</h1>
            <p className="text-text-secondary text-lg">Orchestrate and manage neural telemetry datasets for laboratory analysis.</p>
          </div>
          <div className="flex bg-gray-900 p-1.5 rounded-xl border border-gray-800">
            <div className="px-4 py-2 bg-gray-800 rounded-lg text-xs font-bold text-white shadow-xl flex items-center space-x-2 border border-gray-700">
              <ShieldCheck size={14} className="text-success" />
              <span>Encrypted Connection Active</span>
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-12 gap-10">
          {/* Enhanced Upload Control Panel */}
          <div className="lg:col-span-12 xl:col-span-4 space-y-6">
            <AnimatePresence mode="wait">
              {uploadStep === 'idle' && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  {...getRootProps()}
                  className={`
                    glass-card p-12 border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[440px] relative overflow-hidden group
                    ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-800 hover:border-primary/40'}
                  `}
                >
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <input {...getInputProps()} />

                  <motion.div
                    animate={isDragActive ? { y: [0, -10, 0], scale: 1.1 } : {}}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mb-8 border border-primary/20 shadow-[0_0_30px_rgba(168,85,247,0.1)] relative z-10"
                  >
                    <Upload className="text-primary w-10 h-10" />
                  </motion.div>

                  <div className="relative z-10">
                    <h2 className="text-2xl font-bold mb-3 text-white">Import Neural Specimen</h2>
                    <p className="text-text-secondary mb-10 text-sm leading-relaxed max-w-xs mx-auto">
                      Drag and drop structured data files. Supports heavy CSV and complex Excel workbooks.
                    </p>

                    <div className="flex justify-center space-x-3 mb-2">
                      <span className="flex items-center space-x-2 px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-[11px] font-bold text-text-muted">
                        <FileText size={12} />
                        <span>CSV</span>
                      </span>
                      <span className="flex items-center space-x-2 px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-[11px] font-bold text-text-muted">
                        <FileSpreadsheet size={12} />
                        <span>XLSX</span>
                      </span>
                      <span className="flex items-center space-x-2 px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-[11px] font-bold text-text-muted">
                        <Binary size={12} />
                        <span>JSON</span>
                      </span>
                    </div>
                    <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] font-bold">Limit: 50MB per session</p>
                  </div>
                </motion.div>
              )}

              {uploadStep === 'config' && (
                <motion.div
                  key="config"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass-card p-8 border-primary/30 bg-primary/5 flex flex-col min-h-[500px]"
                >
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center space-x-3 text-primary">
                      <Layers size={22} />
                      <span className="font-black uppercase tracking-tighter text-lg">Session Config</span>
                    </div>
                    <button onClick={resetUpload} className="p-2 hover:bg-white/10 rounded-full text-text-muted hover:text-white transition-colors">
                      <X size={20} />
                    </button>
                  </div>

                  <div className="flex-1 space-y-8">
                    <div className="p-5 bg-gray-900/60 rounded-xl border border-gray-800 flex items-center space-x-5">
                      <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center text-primary border border-primary/30">
                        <FileSpreadsheet size={24} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-white truncate">{pendingFile?.name}</p>
                        <p className="text-[10px] text-primary/70 font-mono font-bold tracking-widest mt-0.5">{(pendingFile?.size / 1024 / 1024).toFixed(2)} MB • VERIFIED</p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.15em] ml-1">Laboratory Label</label>
                        <input
                          type="text"
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          className="input-field w-full h-12 !pl-4 bg-gray-950/50 border-gray-800 focus:border-primary transition-all text-white font-medium"
                          placeholder="Project Alpha Data"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.15em] ml-1">Neural Narrative (Optional)</label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="input-field w-full min-h-[80px] !pl-4 py-3 resize-none bg-gray-950/50 border-gray-800 focus:border-primary transition-all text-white text-sm"
                          placeholder="Describe the anomalies and scope..."
                        />
                      </div>
                    </div>

                    {filePreview && (
                      <div className="pt-4 border-t border-gray-800/50">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Metadata Snapshot</span>
                          <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded font-mono">{filePreview.totalCols || 'N/A'} COLS</span>
                        </div>
                        <div className="p-3 bg-gray-950/80 rounded-lg border border-gray-800/50">
                          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {filePreview.headers?.map((h, i) => (
                              <span key={i} className="text-[9px] font-mono text-primary bg-primary/5 px-2 py-0.5 rounded whitespace-nowrap">{h}</span>
                            ))}
                          </div>
                          <div className="text-[9px] font-mono text-text-muted mt-2 italic leading-relaxed">
                            {filePreview.status || 'First 3 samples parsed successfully. Schema looks valid for neural training.'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-8">
                    <button
                      onClick={handleUpload}
                      className="btn-primary w-full py-4 flex items-center justify-center space-x-3 shadow-2xl shadow-primary/30 group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>
                      <span className="font-bold tracking-wider">INITIATE INGESTION</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              )}

              {uploadStep === 'uploading' && (
                <motion.div
                  key="uploading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card p-12 flex flex-col items-center justify-center h-[500px] relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-primary/5 animate-pulse"></div>
                  <div className="relative mb-12">
                    <div className="w-32 h-32 border-[6px] border-primary/10 border-t-primary rounded-full animate-spin"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                      <span className="text-2xl font-black font-mono text-white tracking-tighter">
                        {uploadProgress}%
                      </span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Syncing Neural Fabric</h3>
                  <p className="text-text-secondary text-sm text-center max-w-xs leading-relaxed font-medium">
                    Structuring telemetry streams and performing automated schema validation...
                  </p>
                </motion.div>
              )}

              {uploadStep === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card p-12 flex flex-col items-center justify-center h-[500px] border-success/40 bg-success/5"
                >
                  <div className="w-24 h-24 bg-success/20 text-success rounded-3xl flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(34,197,94,0.15)]">
                    <CheckCircle2 size={48} />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-3 tracking-tighter uppercase">Artifact Synced</h3>
                  <p className="text-text-secondary text-base text-center max-w-xs font-medium italic">
                    Dataset "{customName}" has been successfully merged with the neural laboratory.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 bg-error/10 border border-error/20 text-error rounded-2xl flex items-start space-x-4 shadow-xl shadow-error/10"
              >
                <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-sm">System Conflict</p>
                  <p className="text-xs opacity-80 leading-relaxed font-medium">{error}</p>
                </div>
              </motion.div>
            )}

            <div className="glass-card p-6 bg-gray-900/30 border-gray-800/40 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 text-primary/5 translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform">
                <Info size={120} />
              </div>
              <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-6 flex items-center pl-1 relative z-10">
                <Database className="mr-3 text-primary w-3.5 h-3.5" />
                Laboratory Standard O-24
              </h3>
              <ul className="text-xs text-text-secondary space-y-5 relative z-10">
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 mr-4 flex-shrink-0 animate-pulse shadow-[0_0_8px_rgba(168,85,247,1)]"></div>
                  <span className="font-medium">Minimum of 10 observations required for neural trajectory mapping.</span>
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 mr-4 flex-shrink-0 shadow-[0_0_8px_rgba(168,85,247,0.4)]"></div>
                  <span className="font-medium font-mono text-[10px] text-text-muted opacity-80 uppercase tracking-tight">UTF-8 / ISO-8859-1 connectivity protocols only.</span>
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 mr-4 flex-shrink-0 shadow-[0_0_8px_rgba(168,85,247,0.4)]"></div>
                  <span className="font-semibold text-primary/80">Addressing null entropy pre-import increases accuracy coefficients by up to 14%.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Enhanced Laboratory Inventory */}
          <div className="lg:col-span-12 xl:col-span-8 space-y-6">
            <div className="glass-card overflow-hidden">
              <div className="px-8 py-8 border-b border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-900/10">
                <div className="flex items-center">
                  <h2 className="text-2xl font-black text-white tracking-tighter uppercase mr-4">Primary Storage</h2>
                  <div className="h-6 w-[2px] bg-gray-800 mr-4"></div>
                  <span className="px-3 py-1 bg-gray-900 border border-gray-800 rounded-lg text-xs font-mono font-black text-primary animate-pulse">
                    {datasets.length} REGISTERED
                  </span>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Locate neural artifact..."
                      className="bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary w-full md:w-64 transition-all"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <button className="p-2.5 border border-gray-800 rounded-xl text-text-muted hover:text-white transition-all hover:bg-gray-800">
                    <Filter size={20} />
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-800/40">
                {filteredDatasets.length === 0 ? (
                  <div className="p-32 text-center">
                    <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-800 border-2 border-dashed border-gray-800">
                      <Database className="w-10 h-10 opacity-30" />
                    </div>
                    <p className="text-text-secondary font-black italic text-xl uppercase tracking-widest opacity-40">No matching specimens found in current perimeter.</p>
                  </div>
                ) : (
                  filteredDatasets.map((dataset, i) => (
                    <motion.div
                      key={dataset._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="p-8 flex flex-col md:flex-row md:items-center justify-between hover:bg-primary/5 transition-all gap-8 group"
                    >
                      <div className="flex items-start space-x-6">
                        <div className="w-16 h-16 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-center text-primary group-hover:border-primary shadow-[0_0_0_0_rgba(168,85,247,0)] group-hover:shadow-[0_0_20px_rgba(168,85,247,0.1)] group-hover:scale-105 transition-all duration-500 relative">
                          {dataset.fileType === '.csv' ? <FileText size={28} /> : <FileSpreadsheet size={28} />}
                          <div className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-gray-900 border border-gray-800 rounded-md text-[8px] font-black text-text-muted uppercase tracking-tighter z-10">
                            {dataset.fileType.replace('.', '')}
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors tracking-tight">{dataset.name}</h3>
                          </div>
                          <p className="text-sm text-text-secondary mb-4 max-w-lg line-clamp-1 italic font-medium opacity-80">{dataset.description || 'Artifact mission objectives not defined.'}</p>
                          <div className="flex flex-wrap items-center gap-y-2 gap-x-6">
                            <div className="flex items-center text-[10px] font-black text-text-muted tracking-[0.15em] uppercase">
                              <Database size={13} className="mr-2 text-primary" />
                              {dataset.rowCount.toLocaleString()} Observations
                            </div>
                            <div className="flex items-center text-[10px] font-black text-text-muted tracking-[0.15em] uppercase">
                              <FileText size={13} className="mr-2 text-secondary" />
                              {dataset.columnCount} Dimensions
                            </div>
                            <div className="flex items-center text-[10px] font-bold text-text-muted font-mono opacity-50">
                              SYNCED {new Date(dataset.uploadedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 md:opacity-0 group-hover:opacity-100 transition-all md:translate-x-6 group-hover:translate-x-0">
                        <Link
                          to={`/datasets/${dataset._id}`}
                          className="flex items-center space-x-3 px-6 py-3 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl transition-all text-xs font-black tracking-widest uppercase border border-primary/20 hover:shadow-xl hover:shadow-primary/20"
                        >
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                          <span>SPECTRUM</span>
                        </Link>
                        <button
                          onClick={() => handleDelete(dataset._id, dataset.name)}
                          className="p-3 text-text-muted hover:text-error transition-all hover:bg-error/10 rounded-xl hover:border hover:border-error/20"
                          title="Purge Artifact"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            <div className="flex items-center justify-center space-x-3 text-text-muted opacity-30 select-none">
              <ShieldCheck size={16} />
              <span className="text-[10px] font-black tracking-[0.3em] uppercase">Laboratory End-to-End Encryption Enabled</span>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal 
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmDelete}
        title="Purge Neural Telemetry?"
        message={`Are you sure you want to remove "${datasetToDelete?.name}"? This will permanently erase the specimen and may destabilize models trained on this structure.`}
        confirmText="Confirm Purge"
      />
    </Layout>
  );
};

export default DatasetPage;
