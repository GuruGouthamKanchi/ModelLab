import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { 
  Cpu, 
  Search, 
  Plus, 
  ExternalLink, 
  Zap, 
  BarChart3,
  Calendar,
  Database,
  ArrowRight
} from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ModelsPage = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/model/list', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setModels(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchModels();
  }, []);

  const filteredModels = models.filter(model => 
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.algorithm.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 underline decoration-primary/30 underline-offset-8">Model Registry</h1>
            <p className="text-text-secondary">Manage and deploy your trained machine learning artifacts.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search models..." 
                className="bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Link to="/models/build" className="btn-primary flex items-center space-x-2">
              <Plus size={18} />
              <span>Build New</span>
            </Link>
          </div>
        </header>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 glass-card animate-pulse bg-gray-900/20"></div>
            ))}
          </div>
        ) : filteredModels.length === 0 ? (
          <div className="glass-card p-20 text-center">
            <Cpu className="mx-auto w-16 h-16 text-gray-800 mb-6" />
            <h3 className="text-xl font-bold text-white mb-2">No Models Found</h3>
            <p className="text-text-secondary mb-8 max-w-md mx-auto">You haven't trained any models yet. Upload a dataset and build your first AI model to get started.</p>
            <Link to="/datasets" className="btn-primary inline-flex items-center space-x-2">
              <Plus size={18} />
              <span>Go to Datasets</span>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModels.map((model) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={model._id} 
                className="glass-card p-6 hover:border-primary/50 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                    model.status === 'completed' ? 'bg-success/20 text-success' : 
                    model.status === 'failed' ? 'bg-error/20 text-error' : 'bg-warning/20 text-warning'
                  }`}>
                    {model.status}
                  </span>
                </div>

                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Cpu size={24} />
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="text-lg font-bold text-white truncate">{model.name}</h3>
                    <p className="text-sm text-text-secondary font-mono">{model.algorithm}</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted flex items-center">
                      <BarChart3 size={14} className="mr-1.5" /> Accuracy
                    </span>
                    <span className="text-white font-mono font-bold">
                      {model.metrics?.accuracy ? (model.metrics.accuracy * 100).toFixed(1) + '%' : 
                       model.metrics?.r2 ? model.metrics.r2.toFixed(3) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted flex items-center">
                      <Database size={14} className="mr-1.5" /> Target
                    </span>
                    <span className="text-white truncate max-w-[120px]">{model.targetColumn}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted flex items-center">
                      <Calendar size={14} className="mr-1.5" /> Trained
                    </span>
                    <span className="text-white">{new Date(model.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Link 
                    to={`/models/results/${model._id}`}
                    className="flex items-center justify-center space-x-2 py-2 px-4 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white hover:bg-gray-800 transition-colors"
                  >
                    <BarChart3 size={16} />
                    <span>Metrics</span>
                  </Link>
                  <Link 
                    to={`/predictions?modelId=${model._id}`}
                    className="flex items-center justify-center space-x-2 py-2 px-4 bg-primary/10 border border-primary/20 rounded-lg text-sm text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                  >
                    <Zap size={16} />
                    <span>Predict</span>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ModelsPage;
