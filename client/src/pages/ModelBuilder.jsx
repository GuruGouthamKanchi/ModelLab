import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { 
  Rocket, 
  Settings2, 
  ChevronRight, 
  Check, 
  Database,
  Type,
  Binary,
  Cpu,
  Loader2,
  AlertCircle,
  Activity,
  Zap,
  Network,
  ShieldCheck
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ModelBuilder = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const datasetIdFromUrl = searchParams.get('datasetId');

  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [error, setError] = useState('');

  // Configuration State
  const [modelName, setModelName] = useState('');
  const [targetColumn, setTargetColumn] = useState('');
  const [features, setFeatures] = useState([]);
  const [algorithm, setAlgorithm] = useState('Random Forest');

  const algorithms = [
    { name: 'Linear Regression', icon: Activity, type: 'regression', desc: 'Predict continuous variables using linear optimization.', color: 'text-primary' },
    { name: 'Logistic Regression', icon: Binary, type: 'classification', desc: 'Binary classification through sigmoid activation.', color: 'text-accent' },
    { name: 'Decision Tree', icon: Network, type: 'both', desc: 'Non-linear tree-based predictive modeling.', color: 'text-success' },
    { name: 'Random Forest', icon: Cpu, type: 'both', desc: 'Ensemble learning architecture (Multiple Trees).', color: 'text-secondary' },
    { name: 'K-Nearest Neighbors', icon: Database, type: 'both', desc: 'Proximity-based non-parametric classification.', color: 'text-warning' },
  ];

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/dataset/list`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDatasets(res.data);
        
        if (datasetIdFromUrl) {
          const ds = res.data.find(d => d._id === datasetIdFromUrl);
          if (ds) {
            setSelectedDataset(ds);
            setTargetColumn(ds.columns[ds.columns.length - 1]?.name || '');
            setFeatures(ds.columns.slice(0, -1).map(c => c.name));
            setModelName(`Model_${ds.name.substring(0,8)}_${Date.now().toString().slice(-4)}`);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDatasets();
  }, [datasetIdFromUrl]);

  const handleDatasetChange = (dsId) => {
    const ds = datasets.find(d => d._id === dsId);
    setSelectedDataset(ds);
    setTargetColumn(ds.columns[ds.columns.length - 1]?.name || '');
    setFeatures(ds.columns.slice(0, -1).map(c => c.name));
    setModelName(`Model_${ds.name.substring(0,8)}_${Date.now().toString().slice(-4)}`);
  };

  const toggleFeature = (name) => {
    if (features.includes(name)) {
      setFeatures(features.filter(f => f !== name));
    } else {
      setFeatures([...features, name]);
    }
  };

  const handleTrain = async () => {
    if (!modelName || !targetColumn || features.length === 0) {
      setError('System requires full configuration parameters before initialization.');
      return;
    }

    setTraining(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/model/train`, {
        datasetId: selectedDataset._id,
        name: modelName,
        algorithm,
        targetColumn,
        features,
        parameters: {} // Option for advanced params later
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      navigate(`/models/results/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Neural network initialization failed.');
    } finally {
      setTraining(false);
    }
  };

  if (loading) return <Layout><div className="flex justify-center items-center h-full text-primary font-mono animate-pulse tracking-widest">Loading Neural Builder...</div></Layout>;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto pb-24 relative">
        
        {/* Ambient Background Effects */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-[120px] pointer-events-none"></div>

        <header className="mb-12 relative z-10">
          <div className="inline-flex items-center space-x-2 text-primary font-mono text-[10px] uppercase tracking-[0.2em] font-bold mb-4 bg-primary/10 px-3 py-1 rounded-full border border-primary/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
            <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(168,85,247,0.8)]"></span>
            <span>Module Configurator</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-3 tracking-tighter uppercase font-display">Neural Architect</h1>
          <p className="text-text-secondary font-medium tracking-wide">Configure hyperparameters and orchestrate custom machine learning training sequences.</p>
        </header>

        <div className="grid lg:grid-cols-12 gap-10 relative z-10">
          {/* Main Config */}
          <div className="lg:col-span-8 space-y-8">
            {/* Step 1: Dataset */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="glass-card overflow-hidden border-white/5 relative group"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="p-8 border-b border-white/5 bg-surface/50 flex items-center justify-between">
                <h2 className="text-xl font-black flex items-center tracking-tight uppercase font-display text-white">
                   <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 text-primary flex items-center justify-center text-sm mr-4 shadow-[0_0_15px_rgba(168,85,247,0.15)]">1</div>
                   Baseline Ingestion
                </h2>
              </div>
              <div className="p-8 bg-surface/30">
                <select 
                  className="input-field w-full h-14 mb-8 bg-gray-950/80 border-white/5 focus:border-primary/50 text-white font-mono text-sm shadow-inner"
                  value={selectedDataset?._id || ''}
                  onChange={(e) => handleDatasetChange(e.target.value)}
                >
                  <option value="" disabled className="text-text-muted">Select an artifact from primary storage...</option>
                  {datasets.map(ds => (
                    <option key={ds._id} value={ds._id} className="bg-gray-900">
                      {ds.isCleanedVersion ? '🛡️ ' : ''}{ds.name} [{ds.rowCount} obs]
                    </option>
                  ))}
                </select>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-3">
                     <label className="text-[10px] font-black tracking-[0.2em] text-text-muted uppercase ml-1 block">Deployment Identifier</label>
                     <input 
                       type="text" 
                       className="input-field w-full h-12 bg-gray-950/50 border-white/5 focus:border-primary/50 text-white font-bold tracking-wide" 
                       placeholder="Alpha_Classifier_v1"
                       value={modelName}
                       onChange={(e) => setModelName(e.target.value)}
                     />
                   </div>
                   <div className="space-y-3">
                     <label className="text-[10px] font-black tracking-[0.2em] text-text-muted uppercase ml-1 block flex items-center">
                        Prediction Target <Type size={12} className="ml-2 text-primary" />
                     </label>
                     <select 
                       className="input-field w-full h-12 bg-gray-950/50 border-white/5 focus:border-primary/50 text-white font-bold tracking-wide"
                       value={targetColumn}
                       onChange={(e) => {
                         const newTarget = e.target.value;
                         setTargetColumn(newTarget);
                         setFeatures(prev => prev.filter(f => f !== newTarget));
                       }}
                     >
                        {!selectedDataset && <option value="" disabled>Awaiting dataset...</option>}
                        {selectedDataset?.columns.map(col => (
                          <option key={col.name} value={col.name} className="bg-gray-900">{col.name}</option>
                        ))}
                     </select>
                   </div>
                </div>
              </div>
            </motion.section>

            {/* Step 2: Features */}
            {selectedDataset && (
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="glass-card overflow-hidden border-white/5 relative group"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-accent to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <div className="p-8 border-b border-white/5 bg-surface/50">
                  <h2 className="text-xl font-black flex items-center tracking-tight uppercase font-display text-white">
                     <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 text-accent flex items-center justify-center text-sm mr-4 shadow-[0_0_15px_rgba(57,255,20,0.15)]">2</div>
                     Dimensional Matrix
                  </h2>
                </div>
                <div className="p-8 bg-surface/30">
                  <p className="text-xs text-text-muted mb-6 font-medium leading-relaxed max-w-2xl bg-white/[0.02] p-4 rounded-xl border border-white/5">
                     Toggle independent variables for the neural input layer. Eliminating high-entropy or linearly dependent features optimizes gradient descent trajectory.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {selectedDataset.columns.map(col => {
                      const isTarget = col.name === targetColumn;
                      const isSelected = features.includes(col.name);
                      
                      return (
                        <button
                          key={col.name}
                          disabled={isTarget}
                          onClick={() => toggleFeature(col.name)}
                          className={`
                            group relative flex items-center px-4 py-2.5 rounded-lg border transition-all text-xs font-bold tracking-wide overflow-hidden
                            ${isTarget ? 'opacity-30 cursor-not-allowed bg-gray-900 border-gray-800' : ''}
                            ${!isTarget && isSelected 
                              ? 'bg-accent/10 border-accent/40 text-white shadow-[0_0_20px_rgba(57,255,20,0.15)]' 
                              : ''}
                            ${!isTarget && !isSelected ? 'bg-surface/50 border-white/5 text-text-secondary hover:border-white/20 hover:text-white' : ''}
                          `}
                        >
                           {/* Highlight Effect */}
                           {isSelected && <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-transparent pointer-events-none"></div>}
                           
                           <span className="relative z-10 mr-3">{col.name}</span>
                           
                           {/* Checkmark or empty box */}
                           <div className={`
                             relative z-10 w-4 h-4 rounded-sm border flex items-center justify-center transition-colors
                             ${isTarget ? 'border-gray-700 bg-gray-800' : ''}
                             ${isSelected ? 'border-accent bg-accent' : ''}
                             ${!isTarget && !isSelected ? 'border-gray-600 bg-gray-900/50 group-hover:border-gray-500' : ''}
                           `}>
                             {isSelected && <Check size={10} className="text-gray-900 font-black" strokeWidth={4} />}
                           </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.section>
            )}

            {/* Step 3: Algorithm */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="glass-card overflow-hidden border-white/5 relative group"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-secondary to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="p-8 border-b border-white/5 bg-surface/50">
                <h2 className="text-xl font-black flex items-center tracking-tight uppercase font-display text-white">
                   <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/20 text-secondary flex items-center justify-center text-sm mr-4 shadow-[0_0_15px_rgba(255,46,147,0.15)]">3</div>
                   Architecture Topology
                </h2>
              </div>
              <div className="p-8 grid md:grid-cols-2 gap-4 bg-surface/30">
                {algorithms.map((algo) => (
                  <button
                    key={algo.name}
                    onClick={() => setAlgorithm(algo.name)}
                    className={`
                      p-5 rounded-xl border flex flex-col text-left transition-all relative overflow-hidden group
                      ${algorithm === algo.name 
                        ? 'border-secondary/50 bg-secondary/10 shadow-[0_0_30px_rgba(255,46,147,0.15)]' 
                        : 'border-white/5 bg-surface/50 hover:border-white/20 hover:bg-white/[0.02]'}
                    `}
                  >
                    {/* Active Background Glow */}
                    {algorithm === algo.name && (
                      <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-[40px] pointer-events-none"></div>
                    )}

                    <div className="flex items-start justify-between mb-4 relative z-10">
                       <div className={`
                         w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-inner
                         ${algorithm === algo.name ? 'bg-secondary text-white shadow-[0_0_15px_rgba(255,46,147,0.5)]' : 'bg-gray-900/80 border border-white/5 text-text-muted group-hover:text-text-primary'}
                       `}>
                         <algo.icon size={22} className={algorithm !== algo.name ? algo.color : ''} />
                       </div>
                       
                       <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${algorithm === algo.name ? 'border-secondary' : 'border-gray-700'}`}>
                          {algorithm === algo.name && <div className="w-2.5 h-2.5 bg-secondary rounded-full shadow-[0_0_8px_rgba(255,46,147,0.8)]"></div>}
                       </div>
                    </div>

                    <div className="relative z-10">
                       <h3 className={`font-black tracking-wide text-sm mb-1.5 ${algorithm === algo.name ? 'text-white' : 'text-text-secondary'}`}>{algo.name}</h3>
                       <p className="text-[11px] text-text-muted leading-relaxed font-medium">{algo.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.section>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-4 lg:sticky lg:top-28 h-fit">
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.4, duration: 0.5 }}
               className="glass-card p-8 border-primary/20 bg-gradient-to-b from-surface/80 to-surface relative overflow-hidden shadow-2xl"
            >
              {/* Decorative Tech Lines */}
              <div className="absolute top-0 right-10 w-[1px] h-full bg-gradient-to-b from-primary/20 via-primary/5 to-transparent"></div>
              <div className="absolute top-0 right-14 w-[1px] h-full bg-gradient-to-b from-white/5 to-transparent"></div>

              <h2 className="text-lg font-black tracking-widest text-white uppercase font-display mb-8 flex items-center">
                 <Settings2 className="w-5 h-5 text-primary mr-3" />
                 Telemetry Brief
              </h2>
              
              <div className="space-y-6 mb-10 relative z-10">
                <div className="group">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-[10px] font-black tracking-[0.2em] text-text-muted uppercase">Base Artifact</span>
                    <span className="text-white text-xs font-bold font-mono text-right max-w-[150px] truncate">{selectedDataset?.name || 'Awaiting Input'}</span>
                  </div>
                  <div className="h-[1px] w-full bg-gradient-to-r from-white/10 to-transparent group-hover:from-primary/30 transition-colors"></div>
                </div>

                <div className="group">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-[10px] font-black tracking-[0.2em] text-text-muted uppercase">Prediction Lens</span>
                    <span className="text-accent text-xs font-bold font-mono bg-accent/10 px-2 py-0.5 rounded border border-accent/20">{targetColumn || '---'}</span>
                  </div>
                  <div className="h-[1px] w-full bg-gradient-to-r from-white/10 to-transparent group-hover:from-accent/30 transition-colors"></div>
                </div>

                <div className="group">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-[10px] font-black tracking-[0.2em] text-text-muted uppercase">Input Vectors</span>
                    <span className="text-white text-xs font-bold font-mono">
                      {features.length > 0 ? (
                        <span className="text-success">{features.length} ACTIVE</span>
                      ) : (
                        <span className="text-error/50">0 ACTIVE</span>
                      )}
                    </span>
                  </div>
                  <div className="h-[1px] w-full bg-gradient-to-r from-white/10 to-transparent group-hover:from-success/30 transition-colors"></div>
                </div>

                <div className="group">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-[10px] font-black tracking-[0.2em] text-text-muted uppercase">Topology Shape</span>
                    <span className="text-secondary text-xs font-bold truncate max-w-[140px] uppercase tracking-wide">{algorithm}</span>
                  </div>
                  <div className="h-[1px] w-full bg-gradient-to-r from-white/10 to-transparent group-hover:from-secondary/30 transition-colors"></div>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 p-4 bg-error/10 border border-error/20 text-error rounded-xl flex items-start text-[11px] font-medium shadow-lg backdrop-blur-sm"
                  >
                      <AlertCircle className="mr-3 w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                disabled={training || !selectedDataset}
                onClick={handleTrain}
                className="w-full py-5 rounded-xl font-black text-xs tracking-[0.2em] uppercase transition-all duration-300 flex items-center justify-center space-x-3 group relative overflow-hidden shadow-[0_0_20px_rgba(168,85,247,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                style={{
                  background: training ? 'transparent' : 'linear-gradient(135deg, #A855F7 0%, #FF2E93 100%)',
                  border: training ? '1px solid rgba(168,85,247,0.3)' : '1px solid rgba(255,255,255,0.1)'
                }}
              >
                {!training && <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>}
                
                {training ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="animate-spin text-primary mb-2 w-6 h-6" />
                    <span className="text-[10px] text-primary">INITIALIZING SEQUENCE...</span>
                  </div>
                ) : (
                  <>
                    <Zap size={18} className="text-white fill-white/50 group-hover:scale-125 transition-transform" />
                    <span className="text-white">Execute Training</span>
                  </>
                )}
              </button>
              
              <div className="mt-6 flex items-start space-x-3 text-text-muted opacity-60 bg-white/[0.02] p-4 rounded-xl border border-white/5">
                 <ShieldCheck size={16} className="text-primary flex-shrink-0 mt-0.5" />
                 <p className="text-[9px] font-mono leading-relaxed uppercase tracking-widest text-justify">
                   Sequence initiates auto-scaling protocol & 5-fold cross validation. Neural state will be saved upon completion.
                 </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ModelBuilder;
