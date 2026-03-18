import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { 
  Cpu, 
  Search, 
  Plus, 
  Zap, 
  BarChart3,
  Calendar,
  Database,
  Trash2,
  Trophy,
  ArrowRight,
  Activity,
  Target,
  Layers,
  Crown,
  GitCompare
} from 'lucide-react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ModelsPage = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'compare'
  const [deleting, setDeleting] = useState(null);
  const navigate = useNavigate();

  const fetchModels = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/model/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModels(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchModels(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete model "${name}"? This action cannot be undone.`)) return;
    setDeleting(id);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/model/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModels(prev => prev.filter(m => m._id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete model');
    } finally {
      setDeleting(null);
    }
  };

  const filteredModels = models.filter(model => 
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.algorithm.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const completedModels = filteredModels.filter(m => m.status === 'completed');
  
  // Find the best model (highest accuracy or R²)
  const bestModel = completedModels.reduce((best, model) => {
    const score = model.metrics?.accuracy || model.metrics?.r2 || 0;
    const bestScore = best?.metrics?.accuracy || best?.metrics?.r2 || 0;
    return score > bestScore ? model : best;
  }, null);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto pb-20">
        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 text-primary font-mono text-[10px] uppercase tracking-[0.2em] font-bold mb-3 bg-primary/10 px-3 py-1 rounded-full border border-primary/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
              <Cpu size={12} />
              <span>{models.length} Registered</span>
            </div>
            <h1 className="text-4xl font-black text-white mb-2 tracking-tighter font-display uppercase">Model Registry</h1>
            <p className="text-text-secondary font-medium tracking-wide">Manage, compare, and deploy your trained machine learning artifacts.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search models..." 
                className="bg-surface border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 w-full md:w-64 transition-all shadow-inner"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex bg-surface-light rounded-xl border border-white/5 p-1">
              <button 
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-white'}`}
              >
                <Layers size={14} />
              </button>
              <button 
                onClick={() => setViewMode('compare')}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'compare' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-white'}`}
              >
                <GitCompare size={14} />
              </button>
            </div>
            <Link to="/models/build" className="btn-primary flex items-center space-x-2 px-5 py-3 shadow-lg group">
              <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
              <span className="uppercase tracking-widest text-xs font-bold">Build New</span>
            </Link>
          </div>
        </header>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 glass-card animate-pulse bg-surface/20"></div>
            ))}
          </div>
        ) : filteredModels.length === 0 ? (
          <div className="glass-card p-20 text-center">
            <Cpu className="mx-auto w-16 h-16 text-text-muted mb-6 opacity-30" />
            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">No Models Found</h3>
            <p className="text-text-secondary mb-8 max-w-md mx-auto font-medium">Upload a dataset and build your first AI model to get started.</p>
            <Link to="/datasets" className="btn-primary inline-flex items-center space-x-2">
              <Plus size={18} />
              <span>Go to Datasets</span>
            </Link>
          </div>
        ) : viewMode === 'compare' ? (
          /* ====== COMPARISON TABLE VIEW ====== */
          <div className="space-y-8">
            <div className="glass-card overflow-hidden border-white/5">
              <div className="p-6 border-b border-white/5 bg-surface/50 flex items-center justify-between">
                <h2 className="text-xl font-black font-display uppercase tracking-tight text-white flex items-center">
                  <Trophy className="mr-3 text-warning" size={20} />
                  Model Leaderboard
                </h2>
                <span className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-widest">
                  {completedModels.length} completed models
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] uppercase font-black tracking-[0.2em] text-text-muted border-b border-white/5 bg-surface/30">
                      <th className="px-6 py-5">#</th>
                      <th className="px-6 py-5">Model</th>
                      <th className="px-6 py-5">Algorithm</th>
                      <th className="px-6 py-5">Type</th>
                      <th className="px-6 py-5">Accuracy / R²</th>
                      <th className="px-6 py-5">Precision</th>
                      <th className="px-6 py-5">Recall</th>
                      <th className="px-6 py-5">F1 / MSE</th>
                      <th className="px-6 py-5">Date</th>
                      <th className="px-6 py-5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {completedModels.sort((a, b) => {
                      const sa = a.metrics?.accuracy || a.metrics?.r2 || 0;
                      const sb = b.metrics?.accuracy || b.metrics?.r2 || 0;
                      return sb - sa;
                    }).map((model, i) => {
                      const isBest = bestModel && model._id === bestModel._id;
                      const isClassification = !!model.metrics?.accuracy;
                      return (
                        <tr key={model._id} className={`group transition-colors ${isBest ? 'bg-accent/5 hover:bg-accent/10' : 'hover:bg-primary/[0.03]'}`}>
                          <td className="px-6 py-5">
                            <div className="flex items-center">
                              {isBest ? (
                                <Crown size={18} className="text-warning fill-warning/20" />
                              ) : (
                                <span className="text-text-muted font-mono font-bold text-sm">{i + 1}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <p className="font-bold text-white text-sm group-hover:text-primary transition-colors">{model.name}</p>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-[10px] font-bold text-text-secondary font-mono bg-white/5 px-2 py-1 rounded border border-white/10">{model.algorithm}</span>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`text-[10px] font-black uppercase tracking-wider ${isClassification ? 'text-primary' : 'text-accent'}`}>
                              {isClassification ? 'CLS' : 'REG'}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`font-mono font-black text-sm ${isBest ? 'text-accent' : 'text-white'}`}>
                              {isClassification ? `${(model.metrics.accuracy * 100).toFixed(1)}%` : model.metrics.r2?.toFixed(4) || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-sm font-mono text-text-secondary">
                            {model.metrics?.precision ? `${(model.metrics.precision * 100).toFixed(1)}%` : '-'}
                          </td>
                          <td className="px-6 py-5 text-sm font-mono text-text-secondary">
                            {model.metrics?.recall ? `${(model.metrics.recall * 100).toFixed(1)}%` : '-'}
                          </td>
                          <td className="px-6 py-5 text-sm font-mono text-text-secondary">
                            {model.metrics?.f1 ? `${(model.metrics.f1 * 100).toFixed(1)}%` : model.metrics?.mse?.toFixed(4) || '-'}
                          </td>
                          <td className="px-6 py-5 text-[10px] font-mono text-text-muted">
                            {new Date(model.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Link to={`/models/results/${model._id}`} className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all" title="View Results">
                                <BarChart3 size={16} />
                              </Link>
                              <Link to={`/predictions?modelId=${model._id}`} className="p-2 bg-accent/10 text-accent rounded-lg hover:bg-accent hover:text-black transition-all" title="Predict">
                                <Zap size={16} />
                              </Link>
                              <button 
                                onClick={() => handleDelete(model._id, model.name)}
                                disabled={deleting === model._id}
                                className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-all disabled:opacity-50"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Failed/Training Models */}
            {filteredModels.filter(m => m.status !== 'completed').length > 0 && (
              <div className="glass-card overflow-hidden border-white/5">
                <div className="p-6 border-b border-white/5 bg-surface/50">
                  <h2 className="text-sm font-black font-display uppercase tracking-widest text-text-muted flex items-center">
                    <Activity className="mr-3 text-warning" size={16} />
                    In-Progress & Failed ({filteredModels.filter(m => m.status !== 'completed').length})
                  </h2>
                </div>
                <div className="divide-y divide-white/5">
                  {filteredModels.filter(m => m.status !== 'completed').map(model => (
                    <div key={model._id} className="p-6 flex items-center justify-between group hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className={`w-2 h-2 rounded-full ${model.status === 'training' ? 'bg-warning animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 'bg-error shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`}></div>
                        <span className="font-bold text-white text-sm">{model.name}</span>
                        <span className="text-[10px] font-mono text-text-muted">{model.algorithm}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${model.status === 'training' ? 'text-warning' : 'text-error'}`}>{model.status}</span>
                        <button onClick={() => handleDelete(model._id, model.name)} className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ====== GRID VIEW ====== */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModels.map((model) => {
              const isBest = bestModel && model._id === bestModel._id && model.status === 'completed';
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={model._id} 
                  className={`glass-card p-6 transition-all group relative overflow-hidden ${
                    isBest ? 'border-accent/30 hover:border-accent/60 shadow-[0_0_20px_rgba(57,255,20,0.08)]' : 'hover:border-primary/50'
                  }`}
                >
                  {/* Best badge */}
                  {isBest && (
                    <div className="absolute top-4 right-4 flex items-center space-x-1.5 bg-accent/10 border border-accent/30 text-accent px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-[0_0_10px_rgba(57,255,20,0.15)]">
                      <Crown size={10} className="fill-accent/30" />
                      <span>Best</span>
                    </div>
                  )}

                  {/* Status badge */}
                  {model.status !== 'completed' && (
                    <div className="absolute top-4 right-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        model.status === 'training' ? 'bg-warning/20 text-warning' : 'bg-error/20 text-error'
                      }`}>{model.status}</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-4 mb-6">
                    <div className={`w-12 h-12 bg-surface border rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${
                      isBest ? 'border-accent/30 text-accent' : 'border-white/10 text-primary'
                    }`}>
                      <Cpu size={24} />
                    </div>
                    <div className="overflow-hidden flex-1">
                      <h3 className="text-lg font-bold text-white truncate group-hover:text-primary transition-colors">{model.name}</h3>
                      <p className="text-[10px] text-text-secondary font-mono uppercase tracking-widest">{model.algorithm}</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted flex items-center text-xs">
                        <BarChart3 size={14} className="mr-1.5" /> 
                        {model.metrics?.accuracy ? 'Accuracy' : 'R² Score'}
                      </span>
                      <span className={`font-mono font-bold ${isBest ? 'text-accent' : 'text-white'}`}>
                        {model.metrics?.accuracy ? (model.metrics.accuracy * 100).toFixed(1) + '%' : 
                         model.metrics?.r2 ? model.metrics.r2.toFixed(3) : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted flex items-center text-xs">
                        <Target size={14} className="mr-1.5" /> Target
                      </span>
                      <span className="text-text-secondary truncate max-w-[120px] text-xs font-mono">{model.targetColumn}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted flex items-center text-xs">
                        <Calendar size={14} className="mr-1.5" /> Trained
                      </span>
                      <span className="text-text-secondary text-xs">{new Date(model.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Link 
                      to={`/models/results/${model._id}`}
                      className="flex items-center justify-center space-x-1.5 py-2.5 px-3 bg-surface border border-white/5 rounded-lg text-[10px] font-bold text-white hover:bg-surface-light hover:border-white/10 transition-colors uppercase tracking-widest"
                    >
                      <BarChart3 size={14} />
                      <span>View</span>
                    </Link>
                    <Link 
                      to={`/predictions?modelId=${model._id}`}
                      className="flex items-center justify-center space-x-1.5 py-2.5 px-3 bg-primary/10 border border-primary/20 rounded-lg text-[10px] font-bold text-primary hover:bg-primary hover:text-white transition-all uppercase tracking-widest"
                    >
                      <Zap size={14} />
                      <span>Test</span>
                    </Link>
                    <button 
                      onClick={() => handleDelete(model._id, model.name)}
                      disabled={deleting === model._id}
                      className="flex items-center justify-center space-x-1.5 py-2.5 px-3 bg-surface border border-white/5 rounded-lg text-[10px] font-bold text-text-muted hover:bg-error/10 hover:text-error hover:border-error/20 transition-all uppercase tracking-widest disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      <span>Del</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ModelsPage;
