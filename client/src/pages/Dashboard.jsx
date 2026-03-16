import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { 
  Database, 
  Cpu, 
  Activity, 
  TrendingUp, 
  ArrowUpRight, 
  Clock, 
  Plus, 
  Search,
  MoreVertical,
  Zap,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({ datasets: 0, models: 0, experiments: 0 });
  const [recentModels, setRecentModels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const [dsRes, modRes, expRes] = await Promise.all([
          axios.get('http://localhost:5000/api/dataset/list', config),
          axios.get('http://localhost:5000/api/model/list', config),
          axios.get('http://localhost:5000/api/experiment/history', config)
        ]);

        setStats({
          datasets: dsRes.data.length,
          models: modRes.data.length,
          experiments: expRes.data.length
        });
        setRecentModels(modRes.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    { name: 'Neural Artifacts', value: stats.datasets, icon: Database, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', glow: 'group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]' },
    { name: 'Deployed Models', value: stats.models, icon: Cpu, color: 'text-secondary', bg: 'bg-secondary/10', border: 'border-secondary/20', glow: 'group-hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]' },
    { name: 'Active Experiments', value: stats.experiments, icon: Activity, color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/20', glow: 'group-hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]' },
    { name: 'System Accuracy', value: '89.4%', icon: TrendingUp, color: 'text-success', bg: 'bg-success/10', border: 'border-success/20', glow: 'group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]' },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto pb-12">
        <header className="mb-10 flex flex-col md:flex-row justify-between md:items-end gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 text-primary font-mono text-[10px] uppercase tracking-[0.2em] font-bold mb-3 bg-primary/10 px-3 py-1 rounded-full border border-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              <span>Command Center Online</span>
            </div>
            <h1 className="text-4xl font-black text-white mb-2 tracking-tighter font-display uppercase">Laboratory Core</h1>
            <p className="text-text-secondary font-medium tracking-wide">Macro-level intelligence overview of active neural deployments.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Query experiment matrix..." 
                className="bg-surface/80 backdrop-blur-md border border-white/5 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 w-full md:w-72 transition-all shadow-lg"
              />
            </div>
            <Link to="/datasets" className="btn-primary flex items-center space-x-2 px-5 py-3 shadow-lg group">
              <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
              <span className="uppercase tracking-widest text-xs font-bold">New Operation</span>
            </Link>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, ease: "easeOut" }}
              className={`glass-card p-6 relative overflow-hidden group border ${stat.border} ${stat.glow} transition-all duration-500`}
            >
              {/* Subtle background glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10 flex justify-between items-start mb-6">
                <div className={`p-4 rounded-xl ${stat.bg} shadow-inner`}>
                  <stat.icon className={`${stat.color} w-7 h-7`} />
                </div>
                <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center bg-white/5 group-hover:bg-white/10 transition-colors cursor-pointer">
                   <ArrowUpRight className="text-text-muted group-hover:text-white transition-colors" size={16} />
                </div>
              </div>
              <div className="relative z-10">
                 <h3 className="text-text-secondary text-xs font-bold uppercase tracking-widest mb-1">{stat.name}</h3>
                 <div className="flex items-baseline space-x-2">
                    <p className="text-4xl font-black text-white font-mono tracking-tighter">{stat.value}</p>
                 </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Recent Models Table */}
          <div className="lg:col-span-8 space-y-6">
            <div className="glass-card overflow-hidden border-white/5 flex flex-col h-full">
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <div className="flex items-center space-x-3">
                   <Cpu className="text-primary w-5 h-5" />
                   <h2 className="text-xl font-black tracking-tight uppercase font-display">Active Deployments</h2>
                </div>
                <Link to="/models" className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary-glow hover:underline underline-offset-4 transition-all flex items-center">
                   View Registry <ArrowUpRight size={12} className="ml-1" />
                </Link>
              </div>
              <div className="overflow-x-auto flex-1 p-2">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-text-muted text-[10px] uppercase font-bold tracking-widest">
                       <th className="px-6 py-5 border-b border-white/5">Identity</th>
                       <th className="px-6 py-5 border-b border-white/5">Architecture</th>
                       <th className="px-6 py-5 border-b border-white/5">State</th>
                       <th className="px-6 py-5 border-b border-white/5 text-right">Precision</th>
                       <th className="px-4 py-5 border-b border-white/5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loading ? (
                      [...Array(4)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan="5" className="px-6 py-6 h-16 bg-white/[0.02]"></td>
                        </tr>
                      ))
                    ) : recentModels.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-20 text-center">
                           <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                              <Database className="w-8 h-8 text-text-muted opacity-50" />
                           </div>
                           <p className="text-text-muted font-bold text-sm">No models registered in the neural matrix.</p>
                        </td>
                      </tr>
                    ) : (
                      recentModels.map((model) => (
                        <tr key={model._id} className="hover:bg-primary/[0.03] transition-colors group">
                          <td className="px-6 py-5">
                            <p className="font-bold text-white text-sm group-hover:text-primary transition-colors tracking-wide">{model.name}</p>
                            <p className="text-[10px] font-mono text-text-muted uppercase mt-1">{new Date(model.createdAt).toLocaleString()}</p>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-[10px] font-bold text-text-secondary font-mono bg-white/5 px-3 py-1.5 rounded-md border border-white/10 shadow-sm">
                              {model.algorithm}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center space-x-2">
                               <div className={`w-1.5 h-1.5 rounded-full ${
                                 model.status === 'completed' ? 'bg-success shadow-[0_0_8px_rgba(16,185,129,0.8)]' :
                                 model.status === 'failed' ? 'bg-error shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-warning shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                               }`}></div>
                               <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                 model.status === 'completed' ? 'text-success' :
                                 model.status === 'failed' ? 'text-error' : 'text-warning'
                               }`}>
                                 {model.status}
                               </span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right text-white font-mono font-bold text-sm">
                            {model.metrics?.accuracy ? (
                              <div className="flex items-center justify-end space-x-2">
                                 <span>{(model.metrics.accuracy * 100).toFixed(1)}%</span>
                              </div>
                            ) : '-'}
                          </td>
                          <td className="px-4 py-5 text-right">
                             <button className="p-2 hover:bg-white/10 rounded-lg text-text-muted hover:text-white transition-colors">
                                <MoreVertical size={16} />
                             </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-8 border-white/5 bg-gradient-to-b from-surface/80 to-surface h-full flex flex-col">
              <h2 className="text-xl font-black mb-8 flex items-center font-display uppercase tracking-tight">
                <Zap className="mr-3 text-accent w-5 h-5 fill-accent/20" />
                Live Telemetry
              </h2>
              <div className="space-y-8 flex-1">
                {[
                  { title: "Neural Sync Complete", desc: "Random Forest weights optimized", status: "completed", time: "2h ago", icon: Sparkles },
                  { title: "Artifact Ingestion", desc: "Customer_Churn.csv indexed", status: "info", time: "5h ago", icon: Database },
                  { title: "Training Terminated", desc: "Linear SGD exceeded loss limits", status: "failed", time: "1d ago", icon: Activity },
                ].map((item, i) => (
                  <div key={i} className="flex space-x-5 group">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-lg ${
                        item.status === 'completed' ? 'bg-success/10 border-success/30 text-success' : 
                        item.status === 'failed' ? 'bg-error/10 border-error/30 text-error' : 'bg-primary/10 border-primary/30 text-primary'
                      }`}>
                         <item.icon size={16} />
                      </div>
                      {i < 2 && <div className="w-[1px] h-full bg-gradient-to-b from-white/10 to-transparent mt-3"></div>}
                    </div>
                    <div>
                      <p className="text-sm text-white font-bold tracking-wide group-hover:text-primary transition-colors">{item.title}</p>
                      <p className="text-[11px] text-text-muted mt-1 font-medium">{item.desc}</p>
                      <p className="text-[10px] text-text-secondary mt-2 font-mono uppercase font-bold tracking-widest">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-8 py-3.5 border border-white/10 bg-white/5 rounded-xl text-xs font-bold uppercase tracking-widest text-text-secondary hover:bg-white/10 hover:text-white transition-all shadow-lg hover:shadow-white/5">
                Full System Log
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
