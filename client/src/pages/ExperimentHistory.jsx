import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { 
  History, 
  Search, 
  Filter, 
  Calendar,
  Database,
  Cpu,
  RefreshCcw,
  ExternalLink,
  Trophy,
  Activity,
  Zap,
  BarChart3,
  ArrowUpDown
} from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ExperimentHistory = () => {
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date'); // 'date' | 'performance'

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/experiment/history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setExperiments(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getScore = (exp) => exp.metrics?.accuracy || exp.metrics?.r2 || 0;

  const filteredExperiments = experiments
    .filter(exp => 
      exp.algorithm.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exp.datasetId?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'performance') return getScore(b) - getScore(a);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const bestExperiment = filteredExperiments.reduce((best, exp) => {
    return getScore(exp) > getScore(best) ? exp : best;
  }, filteredExperiments[0] || null);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto pb-20">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 text-secondary font-mono text-[10px] uppercase tracking-[0.2em] font-bold mb-3 bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20 shadow-[0_0_15px_rgba(255,46,147,0.15)]">
              <History size={12} />
              <span>{experiments.length} Experiments</span>
            </div>
            <h1 className="text-4xl font-black text-white mb-2 tracking-tighter font-display uppercase">Experiment Tracking</h1>
            <p className="text-text-secondary font-medium tracking-wide">Historical record of all training runs and model iterations.</p>
          </div>
          <div className="flex items-center space-x-4">
             <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Filter algorithms or datasets..." 
                  className="bg-surface border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 w-full md:w-80 transition-all shadow-inner"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <button 
               onClick={() => setSortBy(prev => prev === 'date' ? 'performance' : 'date')}
               className={`p-3 border rounded-xl text-text-muted hover:text-white transition-all flex items-center space-x-2 ${
                 sortBy === 'performance' ? 'border-primary/30 bg-primary/10 text-primary' : 'border-white/5 hover:bg-surface-light'
               }`}
               title={sortBy === 'date' ? 'Sort by performance' : 'Sort by date'}
             >
                <ArrowUpDown size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest hidden md:inline">
                  {sortBy === 'date' ? 'By Date' : 'By Score'}
                </span>
             </button>
          </div>
        </header>

        <div className="glass-card overflow-hidden border-white/5">
           <div className="divide-y divide-white/5">
              {loading ? (
                 [...Array(5)].map((_, i) => (
                    <div key={i} className="p-8 animate-pulse bg-surface/20"></div>
                 ))
              ) : filteredExperiments.length === 0 ? (
                 <div className="p-20 text-center">
                    <History className="mx-auto w-12 h-12 text-text-muted mb-4 opacity-30" />
                    <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">No Experiments</h3>
                    <p className="text-text-muted font-medium">No experiments recorded yet. Train a model to see results here.</p>
                 </div>
              ) : (
                filteredExperiments.map((exp, i) => {
                  const isBest = bestExperiment && exp._id === bestExperiment._id;
                  const score = getScore(exp);
                  const isClassification = !!exp.metrics?.accuracy;
                  
                  return (
                    <motion.div 
                      key={exp._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between transition-colors gap-6 group relative ${
                        isBest ? 'bg-accent/[0.03] hover:bg-accent/[0.06]' : 'hover:bg-primary/[0.02]'
                      }`}
                    >
                       {isBest && <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent shadow-[0_0_10px_rgba(57,255,20,0.5)]"></div>}
                       
                       <div className="flex items-start space-x-6">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                            isBest 
                              ? 'bg-accent/10 border border-accent/30 text-accent shadow-[0_0_15px_rgba(57,255,20,0.1)]' 
                              : 'bg-surface border border-white/5 text-primary group-hover:border-primary/30'
                          }`}>
                             {isBest ? <Trophy size={22} /> : <RefreshCcw size={22} />}
                          </div>
                          <div className="space-y-2">
                             <div className="flex items-center space-x-3">
                                <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{exp.algorithm}</h3>
                                {isBest && (
                                  <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-accent/10 text-accent border border-accent/20">
                                    Top Performer
                                  </span>
                                )}
                             </div>
                             <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-text-secondary">
                                <span className="flex items-center text-xs">
                                   <Database size={14} className="mr-1.5 text-text-muted" />
                                   {exp.datasetId?.name || 'Deleted Dataset'}
                                </span>
                                <span className="flex items-center text-xs">
                                   <Calendar size={14} className="mr-1.5 text-text-muted" />
                                   {new Date(exp.createdAt).toLocaleString()}
                                </span>
                                <span className={`text-[10px] font-black uppercase tracking-wider ${isClassification ? 'text-primary' : 'text-accent'}`}>
                                  {isClassification ? 'Classification' : 'Regression'}
                                </span>
                             </div>
                          </div>
                       </div>

                       <div className="flex items-center space-x-8">
                          {/* Quick metrics */}
                          <div className="hidden lg:flex items-center space-x-4">
                            {isClassification && exp.metrics?.precision && (
                              <div className="text-center">
                                <p className="text-[8px] font-black text-text-muted uppercase tracking-widest">Prec</p>
                                <p className="text-sm font-bold text-text-secondary font-mono">{(exp.metrics.precision * 100).toFixed(0)}%</p>
                              </div>
                            )}
                            {isClassification && exp.metrics?.f1 && (
                              <div className="text-center">
                                <p className="text-[8px] font-black text-text-muted uppercase tracking-widest">F1</p>
                                <p className="text-sm font-bold text-text-secondary font-mono">{(exp.metrics.f1 * 100).toFixed(0)}%</p>
                              </div>
                            )}
                          </div>

                          <div className="text-right">
                            <p className="text-[9px] text-text-muted uppercase font-black tracking-widest mb-1">
                              {isClassification ? 'Accuracy' : 'R² Score'}
                            </p>
                            <p className={`text-2xl font-black font-mono ${isBest ? 'text-accent' : 'text-white'}`}>
                              {isClassification ? `${(score * 100).toFixed(1)}%` : score.toFixed(4)}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Link 
                               to={exp.modelId ? `/models/results/${exp.modelId}` : '#'}
                               className={`p-2.5 rounded-lg transition-all ${
                                 exp.modelId 
                                   ? 'bg-primary/10 text-primary hover:bg-primary hover:text-white shadow-sm' 
                                   : 'text-text-muted cursor-not-allowed opacity-50'
                               }`}
                             >
                                <BarChart3 size={18} />
                             </Link>
                             <Link 
                               to={exp.modelId ? `/predictions?modelId=${exp.modelId}` : '#'}
                               className={`p-2.5 rounded-lg transition-all ${
                                 exp.modelId 
                                   ? 'bg-accent/10 text-accent hover:bg-accent hover:text-black shadow-sm' 
                                   : 'text-text-muted cursor-not-allowed opacity-50'
                               }`}
                             >
                                <Zap size={18} />
                             </Link>
                          </div>
                       </div>
                    </motion.div>
                  );
                })
              )}
           </div>
        </div>
      </div>
    </Layout>
  );
};

export default ExperimentHistory;
