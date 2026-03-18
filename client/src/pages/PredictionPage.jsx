import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { 
  Zap, 
  Cpu, 
  Play, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Info,
  ShieldCheck,
  Activity,
  Network
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const PredictionPage = () => {
  const [searchParams] = useSearchParams();
  const modelIdFromUrl = searchParams.get('modelId');

  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [inputs, setInputs] = useState({});
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/model/list`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const completedModels = res.data.filter(m => m.status === 'completed');
        setModels(completedModels);
        
        if (completedModels.length > 0) {
          const targetId = modelIdFromUrl || completedModels[0]._id;
          handleModelSelect(targetId, completedModels);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchModels();
  }, [modelIdFromUrl]);

  const handleModelSelect = (id, modelList = models) => {
    const model = modelList.find(m => m._id === id);
    setSelectedModel(model);
    setPrediction(null);
    setError('');
    
    // Initialize empty inputs
    const initialInputs = {};
    model.features.forEach(f => initialInputs[f] = '');
    setInputs(initialInputs);
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handlePredict = async () => {
    setPredicting(true);
    setPrediction(null);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/model/predict`, {
        modelId: selectedModel._id,
        inputs
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPrediction(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Inference execution failed.');
    } finally {
      setPredicting(false);
    }
  };

  if (loading) return <Layout><div className="flex items-center justify-center h-full text-secondary font-mono tracking-widest animate-pulse">Initializing inference engine...</div></Layout>;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto pb-24 relative">
        
        {/* Ambient Background Effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

        <header className="mb-14 relative z-10 p-8 glass-card border-secondary/20 bg-gradient-to-r from-secondary/5 to-transparent">
          <div className="inline-flex items-center space-x-2 text-secondary font-mono text-[10px] uppercase tracking-[0.2em] font-bold mb-4 bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20 shadow-[0_0_15px_rgba(255,46,147,0.15)]">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_8px_rgba(255,46,147,0.8)] animate-pulse"></span>
            <span>Inference Node Online</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-3 tracking-tighter uppercase font-display">Live Inference</h1>
          <p className="text-text-secondary font-medium tracking-wide">Execute predictions on deployed neural networks using custom input vectors.</p>
        </header>

        <div className="grid lg:grid-cols-5 gap-10 relative z-10">
          {/* Controls */}
          <div className="lg:col-span-3 space-y-8">
             {/* Model Selector */}
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="glass-card p-8 border-white/5 bg-surface/80 relative overflow-hidden group hover:border-secondary/30 transition-colors duration-500"
             >
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-secondary/20 transition-colors duration-700"></div>
                
                <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-6 flex items-center relative z-10">
                   <Network className="mr-3 text-secondary w-4 h-4" />
                   Active Neural Network
                </h3>
                
                <div className="relative z-10">
                   {models.length === 0 ? (
                      <div className="p-6 bg-surface-light border border-white/5 rounded-xl text-center">
                         <Info className="w-8 h-8 text-text-muted mx-auto mb-3" />
                         <p className="text-text-secondary font-medium text-sm">No trained models available in the primary registry. Please compile a model first.</p>
                      </div>
                   ) : (
                      <select 
                        className="input-field h-14 w-full bg-gray-950/80 border-white/5 focus:border-secondary/50 text-white font-mono text-sm tracking-wide shadow-inner"
                        value={selectedModel?._id || ''}
                        onChange={(e) => handleModelSelect(e.target.value)}
                      >
                         {models.map(m => (
                            <option key={m._id} value={m._id} className="bg-gray-900">{m.name} [{m.algorithm}]</option>
                         ))}
                      </select>
                   )}
                </div>
             </motion.div>

             {/* Input Form */}
             {selectedModel && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass-card p-8 border-white/5 bg-surface/80 relative overflow-hidden group hover:border-primary/30 transition-colors duration-500"
                >
                   <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-[50px] pointer-events-none group-hover:bg-primary/10 transition-colors duration-700"></div>

                   <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-8 flex items-center relative z-10">
                      <Zap className="mr-3 text-primary w-4 h-4" />
                      Input Vector Parameters
                   </h3>
                   
                   <div className="grid md:grid-cols-2 gap-6 mb-10 relative z-10">
                      {selectedModel.features.map((feature, i) => (
                         <div key={feature} className="space-y-2 group/input">
                            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest truncate block ml-1 group-hover/input:text-primary transition-colors">{feature}</label>
                            <input 
                              type="text" 
                              className="input-field w-full h-12 bg-gray-950/50 border-white/5 focus:border-primary/50 text-white font-medium shadow-inner transition-all hover:bg-gray-950/80"
                              placeholder={`val_${i}`}
                              value={inputs[feature] || ''}
                              onChange={(e) => handleInputChange(feature, e.target.value)}
                            />
                         </div>
                      ))}
                   </div>
                   
                   <button
                     disabled={predicting}
                     onClick={handlePredict}
                     className="w-full py-5 rounded-xl font-black text-xs tracking-[0.2em] uppercase transition-all duration-300 flex items-center justify-center space-x-3 group relative overflow-hidden shadow-[0_0_20px_rgba(168,85,247,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                     style={{
                       background: predicting ? 'transparent' : 'linear-gradient(135deg, #A855F7 0%, #39FF14 100%)',
                       border: predicting ? '1px solid rgba(168,85,247,0.3)' : '1px solid rgba(255,255,255,0.1)'
                     }}
                   >
                     {!predicting && <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>}
                     
                     {predicting ? (
                       <div className="flex flex-col items-center">
                         <Loader2 className="animate-spin text-primary mb-2 w-6 h-6" />
                         <span className="text-[10px] text-primary">EXECUTING INFERENCE...</span>
                       </div>
                     ) : (
                        <>
                          <Play size={18} className="text-white fill-white/50 group-hover:scale-125 transition-transform" />
                          <span className="text-white">Generate Prediction</span>
                        </>
                     )}
                   </button>
                </motion.div>
             )}
          </div>

          {/* Result Panel */}
          <div className="lg:col-span-2">
             <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.2 }}
               className="glass-card h-full overflow-hidden flex flex-col border-white/5 relative bg-gradient-to-b from-surface/80 to-surface"
             >
                {/* Decorative Tech Lines */}
                <div className="absolute top-0 right-10 w-[1px] h-full bg-gradient-to-b from-secondary/20 via-secondary/5 to-transparent"></div>
                
                <div className="p-8 border-b border-white/5 bg-white/[0.02]">
                   <h2 className="text-xl font-black font-display uppercase tracking-tight text-white flex items-center">
                     <Activity size={20} className="mr-3 text-success" />
                     Inference Output
                   </h2>
                </div>
                
                <div className="flex-1 p-10 flex flex-col items-center justify-center text-center relative z-10">
                   <AnimatePresence mode="wait">
                      {error ? (
                         <motion.div 
                           key="error"
                           initial={{ opacity: 0, scale: 0.9 }}
                           animate={{ opacity: 1, scale: 1 }}
                           exit={{ opacity: 0, scale: 0.9 }}
                           className="space-y-6"
                         >
                            <div className="w-20 h-20 bg-error/10 border border-error/20 text-error rounded-[2rem] flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                               <AlertCircle size={40} />
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-error uppercase tracking-widest mb-2">Execution Fault</p>
                               <p className="text-text-secondary font-medium leading-relaxed max-w-xs mx-auto">{error}</p>
                            </div>
                         </motion.div>
                      ) : prediction ? (
                         <motion.div 
                           key="prediction"
                           initial={{ opacity: 0, scale: 0.9 }}
                           animate={{ opacity: 1, scale: 1 }}
                           exit={{ opacity: 0, scale: 0.9 }}
                           className="w-full relative"
                         >
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-success/10 rounded-full blur-[80px] pointer-events-none"></div>
                            
                            <div className="w-24 h-24 bg-success/10 text-success rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-success/30 shadow-[0_0_40px_rgba(57,255,20,0.2)] relative z-10">
                               <CheckCircle size={48} />
                            </div>
                            
                            <div className="relative z-10">
                               <p className="text-success text-[10px] mb-3 font-black uppercase tracking-[0.3em]">Calculated Outcome</p>
                               <h2 className="text-5xl font-black text-white mb-10 font-mono tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                                  {prediction.prediction}
                               </h2>
                            </div>
                            
                            <div className="p-6 bg-surface-light rounded-2xl border border-white/5 text-left relative z-10 shadow-inner">
                               <div className="flex justify-between items-center mb-4 text-[10px] font-black tracking-widest text-text-muted uppercase">
                                  <span>Confidence Probability</span>
                                  <span className="text-success font-mono">{(prediction.confidence * 100).toFixed(1)}%</span>
                               </div>
                               <div className="w-full h-2 bg-surface rounded-full overflow-hidden border border-white/5">
                                  <div 
                                    className="h-full bg-gradient-to-r from-success/50 to-success shadow-[0_0_10px_rgba(57,255,20,0.5)]" 
                                    style={{ width: `${prediction.confidence * 100}%` }}
                                  ></div>
                               </div>
                            </div>
                         </motion.div>
                      ) : (
                         <div className="space-y-6 opacity-40">
                            <Info size={48} className="text-text-muted mx-auto" />
                            <p className="text-text-secondary text-sm font-medium tracking-wide max-w-xs mx-auto">
                              Configure input parameters and initialize inference to output results.
                            </p>
                         </div>
                      )}
                   </AnimatePresence>
                </div>

                <div className="p-6 border-t border-white/5 bg-white/[0.02]">
                   <div className="flex items-start space-x-3 text-text-muted opacity-60">
                     <ShieldCheck size={16} className="text-success flex-shrink-0 mt-0.5" />
                     <p className="text-[9px] font-mono leading-relaxed uppercase tracking-widest text-justify">
                        Predictions are computed using the isolated `{selectedModel?.algorithm || 'model'}` state. End-to-end encryption ensures data confidentiality during inference.
                     </p>
                   </div>
                </div>
             </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PredictionPage;
