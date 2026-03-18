import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { 
  ShieldCheck,
  ArrowLeft,
  Settings,
  Trash2,
  ListFilter,
  Activity,
  CheckCircle2,
  AlertCircle,
  Play
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DatasetClean = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dataset, setDataset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [cleanedDatasetId, setCleanedDatasetId] = useState(null);

  // Cleaning options state
  const [dropMissing, setDropMissing] = useState(false);
  const [fillMissing, setFillMissing] = useState('');
  const [encodeCategorical, setEncodeCategorical] = useState(false);
  const [dropColumns, setDropColumns] = useState([]);

  useEffect(() => {
    const fetchDataset = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/dataset/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDataset(res.data.dataset);
      } catch (err) {
        console.error(err);
        setError('Failed to load dataset details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDataset();
  }, [id]);

  const toggleColumnDrop = (colName) => {
    setDropColumns(prev => 
      prev.includes(colName) 
        ? prev.filter(c => c !== colName)
        : [...prev, colName]
    );
  };

  const handleClean = async () => {
    setCleaning(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/dataset/${id}/clean`, {
        drop_missing: dropMissing,
        fill_missing: fillMissing || null,
        drop_columns: dropColumns,
        encode_categorical: encodeCategorical
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess(true);
      setCleanedDatasetId(res.data.dataset._id);
    } catch (err) {
      setError(err.response?.data?.message || 'Cleaning pipeline failed.');
    } finally {
      setCleaning(false);
    }
  };

  if (loading) return <Layout><div className="flex items-center justify-center h-full text-primary font-mono animate-pulse">Loading preparation suite...</div></Layout>;
  if (!dataset) return <Layout><div className="text-error glass-card p-10 font-bold tracking-widest uppercase">Target artifact not found.</div></Layout>;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto pb-20">
        <header className="mb-10 flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
          <div className="flex items-start space-x-6">
            <Link to={`/datasets/${id}`} className="mt-1.5 p-2.5 bg-surface/50 border border-white/5 rounded-xl text-text-muted hover:text-white hover:border-primary/50 transition-all shadow-lg hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <div className="flex items-center space-x-4 mb-3">
                 <h1 className="text-4xl font-black text-white tracking-tighter uppercase font-display">Data Preparation</h1>
                 <span className="px-2.5 py-1 bg-secondary/20 text-secondary border border-secondary/30 rounded shadow-[0_0_10px_rgba(255,46,147,0.2)] text-[10px] font-mono font-black tracking-widest uppercase">
                    PIPELINE
                 </span>
              </div>
              <p className="text-text-secondary text-sm font-medium tracking-wide">
                Configure transformation rules for <span className="text-white font-mono">{dataset.name}</span>
              </p>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-8 p-5 bg-error/10 border border-error/20 text-error rounded-2xl flex items-start space-x-4 shadow-xl shadow-error/10">
            <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
               <p className="font-bold text-sm">Pipeline Execution Failure</p>
               <p className="text-xs opacity-80 leading-relaxed font-medium">{error}</p>
            </div>
          </div>
        )}

        {success ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-16 text-center border-success/30 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-success/5 pointer-events-none"></div>
            <div className="w-24 h-24 bg-success/20 text-success rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(57,255,20,0.2)] relative z-10">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-4 relative z-10">Neural Artifact Stabilized</h2>
            <p className="text-text-secondary mb-10 max-w-md mx-auto relative z-10">
              The cleaning pipeline executed successfully. A new pristine variant of the dataset has been registered in the laboratory.
            </p>
            <div className="flex justify-center space-x-6 relative z-10">
              <Link to={`/datasets/${cleanedDatasetId}`} className="btn-primary shadow-lg shadow-primary/20 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                Inspect Cleaned Data
              </Link>
              <Link to="/datasets" className="px-6 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-all font-bold tracking-widest uppercase text-xs">
                Return to Storage
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              
              <div className="glass-card p-8 border-white/5 hover:border-primary/20 transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mr-4 border border-primary/20">
                     <ListFilter size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white tracking-tight uppercase">Missing Value Strategy</h3>
                    <p className="text-xs text-text-muted font-medium">Handle NaN and Null anomalies in the telemetry stream.</p>
                  </div>
                </div>

                <div className="space-y-6 pl-14">
                  <label className="flex items-start space-x-4 cursor-pointer group">
                    <div className="relative flex items-center mt-1">
                      <input 
                        type="checkbox" 
                        checked={dropMissing} 
                        onChange={(e) => {
                          setDropMissing(e.target.checked);
                          if(e.target.checked) setFillMissing('');
                        }}
                        className="peer sr-only"
                      />
                      <div className="w-5 h-5 bg-surface border-2 border-white/10 rounded transition-all peer-checked:bg-primary peer-checked:border-primary shadow-sm flex items-center justify-center">
                         <div className={`w-2 h-2 bg-white rounded-sm transform transition-transform ${dropMissing ? 'scale-100' : 'scale-0'}`}></div>
                      </div>
                    </div>
                    <div>
                      <span className="text-white font-bold block mb-1 tracking-wide">Drop Incomplete Observations</span>
                      <span className="text-xs text-text-muted font-medium">Removes any row containing at least one missing value across features. Recommended only if missing data is less than 5%.</span>
                    </div>
                  </label>

                  <div className="opacity-40 border-t border-white/5 pt-2"></div>

                  <div className={`space-y-4 transition-opacity ${dropMissing ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                     <label className="text-white font-bold block tracking-wide">Imputation Strategy</label>
                     <p className="text-xs text-text-muted font-medium mb-4">Calculate and inject synthetic values to preserve observation count.</p>
                     
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {['mean', 'median', 'mode'].map((method) => (
                           <button
                             key={method}
                             onClick={() => setFillMissing(fillMissing === method ? '' : method)}
                             disabled={dropMissing}
                             className={`p-4 rounded-xl border transition-all text-left ${
                               fillMissing === method 
                                 ? 'bg-primary/10 border-primary text-white shadow-[0_0_15px_rgba(168,85,247,0.15)]' 
                                 : 'bg-surface/50 border-white/5 text-text-secondary hover:border-white/20'
                             }`}
                           >
                              <div className="font-bold uppercase tracking-widest text-[10px] mb-1">{method}</div>
                              <div className="text-[10px] font-mono opacity-60">Fill via {method}</div>
                           </button>
                        ))}
                     </div>
                  </div>
                </div>
              </div>

              <div className="glass-card p-8 border-white/5 hover:border-secondary/20 transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary mr-4 border border-secondary/20">
                     <Settings size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white tracking-tight uppercase">Categorical Encoding</h3>
                    <p className="text-xs text-text-muted font-medium">Transform human-readable labels into machine-processable vectors.</p>
                  </div>
                </div>

                <div className="pl-14">
                  <label className="flex items-start space-x-4 cursor-pointer group">
                    <div className="relative flex items-center mt-1">
                      <input 
                        type="checkbox" 
                        checked={encodeCategorical} 
                        onChange={(e) => setEncodeCategorical(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="w-5 h-5 bg-surface border-2 border-white/10 rounded transition-all peer-checked:bg-secondary peer-checked:border-secondary shadow-sm flex items-center justify-center">
                         <div className={`w-2 h-2 bg-white rounded-sm transform transition-transform ${encodeCategorical ? 'scale-100' : 'scale-0'}`}></div>
                      </div>
                    </div>
                    <div>
                      <span className="text-white font-bold block mb-1 tracking-wide">Apply Label Encoding</span>
                      <span className="text-xs text-text-muted font-medium block mb-2">Automatically converts text-based category columns into numerical formats required by machine learning algorithms (e.g., "Red" -&gt; 0, "Blue" -&gt; 1).</span>
                      <span className="inline-block px-2 py-1 bg-warning/10 text-warning text-[9px] font-black uppercase tracking-widest rounded border border-warning/20">Required for most model types</span>
                    </div>
                  </label>
                </div>
              </div>

            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="glass-card p-6 border-white/5 hover:border-error/20 transition-all duration-300 sticky top-24">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center text-error mr-4 border border-error/20">
                     <Trash2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white tracking-tight uppercase">Feature Purge</h3>
                    <p className="text-xs text-text-muted font-medium">Select columns to isolate and remove.</p>
                  </div>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                   {dataset.columns.map(col => (
                     <button
                       key={col.name}
                       onClick={() => toggleColumnDrop(col.name)}
                       className={`w-full flex justify-between items-center p-3 rounded-lg border transition-all text-left text-xs ${
                         dropColumns.includes(col.name)
                           ? 'bg-error/10 border-error/50 text-white line-through opacity-70'
                           : 'bg-surface/50 border-white/5 text-text-secondary hover:bg-white/5 hover:text-white'
                       }`}
                     >
                        <span className="font-mono truncate">{col.name}</span>
                        {dropColumns.includes(col.name) && <Trash2 size={12} className="text-error" />}
                     </button>
                   ))}
                </div>

                <div className="mt-8 pt-6 border-t border-white/5">
                   {cleaning ? (
                     <button disabled className="btn-primary w-full py-4 flex items-center justify-center space-x-3 opacity-70 cursor-not-allowed">
                        <Activity size={18} className="animate-spin" />
                        <span className="font-bold tracking-widest uppercase">Processing Pipeline...</span>
                     </button>
                   ) : (
                     <button 
                       onClick={handleClean}
                       className="btn-primary w-full py-4 flex items-center justify-center space-x-3 shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-shadow group"
                     >
                        <Play size={16} fill="currentColor" className="group-hover:scale-110 transition-transform" />
                        <span className="font-bold tracking-widest uppercase">Execute Pipeline</span>
                     </button>
                   )}
                   <p className="text-center text-[10px] text-text-muted font-black tracking-widest uppercase mt-4 opacity-50">
                     This will create a new dataset
                   </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DatasetClean;
