import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { 
  History, 
  Search, 
  Filter, 
  MoreVertical, 
  Calendar,
  Database,
  Cpu,
  RefreshCcw,
  ExternalLink
} from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ExperimentHistory = () => {
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/experiment/history', {
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

  const filteredExperiments = experiments.filter(exp => 
    exp.algorithm.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exp.datasetId?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Experiment Tracking</h1>
            <p className="text-text-secondary">Historical record of all training runs and model iterations.</p>
          </div>
          <div className="flex items-center space-x-4">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Filter algorithms or datasets..." 
                  className="bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary w-full md:w-80"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <button className="p-2 border border-gray-800 rounded-lg text-text-muted hover:text-white transition-colors">
                <Filter size={18} />
             </button>
          </div>
        </header>

        <div className="glass-card overflow-hidden">
           <div className="divide-y divide-gray-800">
              {loading ? (
                 [...Array(5)].map((_, i) => (
                    <div key={i} className="p-8 animate-pulse bg-gray-900/10"></div>
                 ))
              ) : filteredExperiments.length === 0 ? (
                 <div className="p-20 text-center">
                    <History className="mx-auto w-12 h-12 text-gray-800 mb-4" />
                    <p className="text-text-muted">No experiments recorded yet.</p>
                 </div>
              ) : (
                filteredExperiments.map((exp) => (
                   <div key={exp._id} className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-800/30 transition-colors gap-6 group">
                      <div className="flex items-start space-x-6">
                         <div className="w-12 h-12 bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-center text-primary group-hover:border-primary/50 transition-all">
                            <RefreshCcw size={22} />
                         </div>
                         <div className="space-y-1">
                            <h3 className="text-lg font-bold text-white">{exp.algorithm}</h3>
                            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-text-secondary">
                               <span className="flex items-center">
                                  <Database size={14} className="mr-1.5 text-text-muted" />
                                  {exp.datasetId?.name || 'Deleted Dataset'}
                               </span>
                               <span className="flex items-center">
                                  <Calendar size={14} className="mr-1.5 text-text-muted" />
                                  {new Date(exp.createdAt).toLocaleString()}
                               </span>
                            </div>
                         </div>
                      </div>

                      <div className="flex items-center space-x-10">
                         <div className="text-right">
                           <p className="text-xs text-text-muted uppercase font-bold tracking-widest mb-1">Performance</p>
                           <p className="text-xl font-bold text-white font-mono">
                             {exp.metrics?.accuracy ? (exp.metrics.accuracy * 100).toFixed(1) + '%' : 
                              exp.metrics?.r2 ? exp.metrics.r2.toFixed(3) : '-'}
                           </p>
                         </div>
                         
                         <div className="flex items-center space-x-3">
                            <Link 
                              to={exp.modelId ? `/models/results/${exp.modelId}` : '#'}
                              className={`p-2 rounded-lg transition-all ${exp.modelId ? 'bg-primary/10 text-primary hover:bg-primary hover:text-white' : 'text-text-muted cursor-not-allowed opacity-50'}`}
                            >
                               <ExternalLink size={20} />
                            </Link>
                            <button className="p-2 text-text-muted hover:text-white transition-colors">
                               <MoreVertical size={20} />
                            </button>
                         </div>
                      </div>
                   </div>
                ))
              )}
           </div>
        </div>
      </div>
    </Layout>
  );
};

export default ExperimentHistory;
