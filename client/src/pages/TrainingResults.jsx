import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { 
  Trophy, 
  Target, 
  Activity, 
  CheckCircle2, 
  ArrowRight,
  Zap,
  Share2,
  FileCode,
  Cpu,
  Network,
  ShieldCheck
} from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

const TrainingResults = () => {
  const { id } = useParams();
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval;
    const fetchModel = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/model/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setModel(res.data);
        
        if (res.data.status === 'completed' || res.data.status === 'failed') {
          setLoading(false);
          clearInterval(interval);
        } else {
          setLoading(false); // We want to show the "Training" UI, not the "Loading Page" UI
        }
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    
    fetchModel();
    // If it's still training, poll every 3 seconds
    interval = setInterval(() => {
      fetchModel();
    }, 3000);

    return () => clearInterval(interval);
  }, [id]);

  if (loading) return <Layout><div className="flex items-center justify-center h-full text-primary font-mono tracking-widest animate-pulse">Establishing secure link to laboratory database...</div></Layout>;
  if (!model) return <Layout><div className="text-error font-bold tracking-widest uppercase glass-card p-10">Neural Artifact not found in primary storage.</div></Layout>;

  if (model.status === 'training') {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[70vh] text-center relative">
           
           {/* Ambient Loading Background */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] animate-pulse pointer-events-none"></div>

           <motion.div 
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="relative mb-14 mt-10"
           >
              <div className="w-40 h-40 border-[4px] border-surface/50 border-t-primary rounded-full animate-spin shadow-[0_0_30px_rgba(59,130,246,0.2)]"></div>
              <div className="w-32 h-32 border-[2px] border-surface/30 border-b-accent rounded-full animate-spin-slow absolute top-4 left-4"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface p-4 rounded-full border border-white/5 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                 <Network className="text-primary w-12 h-12" />
              </div>
           </motion.div>
           
           <h1 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase font-display">Neural Synthesis in Progress</h1>
           <p className="text-text-secondary max-w-lg mx-auto mb-10 text-sm font-medium leading-relaxed">
             The laboratory engine is currently processing the artifact, executing optimal feature dimensioning, and running hyperparameter convergence algorithms.
           </p>
           
           <div className="glass-card p-8 w-full max-w-xl bg-surface/80 border-primary/20 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary animate-gradient-x"></div>
              <div className="flex justify-between items-end mb-6">
                 <span className="text-[10px] uppercase font-black tracking-[0.2em] text-text-muted flex items-center">
                    <Activity size={14} className="mr-2 text-primary" />
                    {model.algorithm} Topology
                 </span>
                 <span className="text-primary font-mono text-xs font-bold animate-pulse">ACTIVE...</span>
              </div>
              <div className="space-y-4">
                 <div className="flex items-start text-sm text-success group bg-success/5 p-3 rounded-lg border border-success/10">
                    <CheckCircle2 size={16} className="mr-3 flex-shrink-0 mt-0.5" /> 
                    <div>
                       <div className="font-bold tracking-wide">Environment initialization</div>
                       <div className="text-[10px] font-mono opacity-70 mt-1 uppercase tracking-widest text-success/70">Verified & Sealed</div>
                    </div>
                 </div>
                 <div className="flex items-start text-sm text-success group bg-success/5 p-3 rounded-lg border border-success/10">
                    <CheckCircle2 size={16} className="mr-3 flex-shrink-0 mt-0.5" /> 
                    <div>
                       <div className="font-bold tracking-wide">Artifact Ingestion: {model.datasetId.substring(0,8)}...</div>
                       <div className="text-[10px] font-mono opacity-70 mt-1 uppercase tracking-widest text-success/70">Memory Allocation Complete</div>
                    </div>
                 </div>
                 <div className="flex items-start text-sm text-primary group bg-primary/5 p-3 rounded-lg border border-primary/20 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                    <Activity size={16} className="mr-3 flex-shrink-0 mt-0.5 animate-pulse" /> 
                    <div>
                       <div className="font-bold tracking-wide">Executing backpropagation epochs</div>
                       <div className="text-[10px] font-mono opacity-70 mt-1 uppercase tracking-widest text-primary/70">Calculating Gradients...</div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </Layout>
    );
  }

  if (model.status === 'failed') {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center relative">
           
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-error/10 rounded-full blur-[80px] pointer-events-none"></div>

           <div className="glass-card p-16 max-w-2xl border-error/30 bg-gradient-to-b from-error/10 to-transparent relative z-10 shadow-2xl">
              <div className="w-24 h-24 bg-error/10 border border-error/30 text-error rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                 <Activity size={48} />
              </div>
              <h1 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Synthesis Failed</h1>
              <p className="text-text-secondary mb-10 text-sm font-medium bg-error/5 p-4 rounded-xl border border-error/10">
                 {model.error || 'The neural algorithm failed to converge. Review parameters and matrix dimensions.'}
              </p>
              <Link to="/models/build" className="btn-primary inline-flex items-center px-8 py-3 bg-error/20 hover:bg-error/30 text-error border-error/50 shadow-none hover:shadow-none font-bold tracking-widest text-xs uppercase transition-all duration-300">
                 <ArrowRight size={16} className="mr-3 rotate-180" />
                 Redefine Parameters
              </Link>
           </div>
        </div>
      </Layout>
    );
  }

  const isClassification = !!model.metrics?.accuracy;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto pb-20 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-success/5 rounded-full blur-[120px] pointer-events-none"></div>

        <header className="mb-14 flex flex-col md:flex-row justify-between items-start gap-6 relative z-10 p-8 glass-card border-success/20 bg-gradient-to-r from-success/5 to-transparent">
           <div>
             <div className="flex items-center space-x-4 mb-5">
                <span className="bg-success/10 text-success border border-success/30 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase flex items-center shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <CheckCircle2 size={14} className="mr-2" />
                  Synthesis Verified
                </span>
                <span className="text-text-muted text-[10px] font-mono tracking-widest font-bold bg-white/5 px-2 py-1 rounded border border-white/5">{id}</span>
             </div>
             <h1 className="text-4xl font-black text-white mb-3 tracking-tighter font-display uppercase">{model.name}</h1>
             <p className="text-text-secondary font-medium tracking-wide">Detailed algorithmic telemetry and validation metrics.</p>
           </div>
           <div className="flex space-x-4">
              <button className="p-3 border border-white/10 rounded-xl text-text-muted hover:text-white bg-surface hover:bg-surface-light transition-all shadow-sm">
                 <Share2 size={20} />
              </button>
              <Link to="/predictions" className="btn-primary flex items-center space-x-3 px-6 shadow-lg shadow-primary/20 group hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                 <Zap size={18} className="group-hover:scale-110 transition-transform" />
                 <span className="font-bold tracking-widest text-xs uppercase">Begin Inference</span>
              </Link>
           </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 relative z-10">
           {isClassification ? (
              <>
                 <MetricCard title="System Accuracy" value={`${(model.metrics.accuracy * 100).toFixed(2)}%`} icon={Trophy} color="text-primary" border="border-primary/20" glow="shadow-[0_0_15px_rgba(59,130,246,0.1)]" />
                 <MetricCard title="Precision Rate" value={`${(model.metrics.precision * 100).toFixed(2)}%`} icon={Target} color="text-secondary" border="border-secondary/20" glow="shadow-[0_0_15px_rgba(139,92,246,0.1)]" />
                 <MetricCard title="Recall Index" value={`${(model.metrics.recall * 100).toFixed(2)}%`} icon={Activity} color="text-accent" border="border-accent/20" glow="shadow-[0_0_15px_rgba(6,182,212,0.1)]" />
                 <MetricCard title="F1-Score Unity" value={`${(model.metrics.f1 * 100).toFixed(2)}%`} icon={Zap} color="text-success" border="border-success/20" glow="shadow-[0_0_15px_rgba(16,185,129,0.1)]" />
              </>
           ) : (
              <>
                 <MetricCard title="R² Distribution" value={(model.metrics.r2).toFixed(4)} icon={Trophy} color="text-primary" border="border-primary/20" glow="shadow-[0_0_15px_rgba(59,130,246,0.1)]" />
                 <MetricCard title="Mean Square Error" value={(model.metrics.mse).toFixed(2)} icon={Activity} color="text-error" border="border-error/20" glow="shadow-[0_0_15px_rgba(239,68,68,0.1)]" />
                 <div className="lg:col-span-2"></div>
              </>
           )}
        </div>

        <div className="grid lg:grid-cols-12 gap-8 relative z-10">
           {/* Details */}
           <div className="lg:col-span-5 h-full">
             <div className="glass-card p-10 h-full border-white/5 bg-gradient-to-b from-surface/80 to-surface relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-primary/5 rounded-full blur-[60px] pointer-events-none group-hover:bg-primary/10 transition-colors duration-700"></div>
                
                <h3 className="text-xl font-black mb-10 flex items-center font-display uppercase tracking-tight text-white relative z-10">
                   <Settings2 className="mr-3 text-primary" size={22} />
                   Neural Specifications
                </h3>
                
                <div className="space-y-6 relative z-10">
                   <div className="flex flex-col space-y-2 py-4 border-b border-white/5">
                      <span className="text-[10px] font-black tracking-[0.2em] text-text-muted uppercase">Architecture Topology</span>
                      <span className="text-white font-mono font-bold bg-white/5 w-fit px-3 py-1.5 rounded-lg border border-white/10 text-sm shadow-inner">{model.algorithm}</span>
                   </div>
                   <div className="flex flex-col space-y-2 py-4 border-b border-white/5">
                      <span className="text-[10px] font-black tracking-[0.2em] text-text-muted uppercase flex items-center">
                        Target Concept <Zap size={10} className="ml-2 text-accent" />
                      </span>
                      <span className="text-accent font-black tracking-wide bg-accent/10 w-fit px-3 py-1.5 rounded-lg border border-accent/20 text-sm shadow-[0_0_10px_rgba(6,182,212,0.1)]">{model.targetColumn}</span>
                   </div>
                   <div className="flex flex-col space-y-3 py-4 border-b border-white/5">
                      <span className="text-[10px] font-black tracking-[0.2em] text-text-muted uppercase">Input Feature Vectors</span>
                      <div className="flex flex-wrap gap-2">
                         {model.features.map(f => (
                            <span key={f} className="text-[10px] font-bold tracking-wider bg-surface-light border border-white/10 text-text-secondary px-2.5 py-1.5 rounded-md hover:bg-white/10 hover:text-white transition-colors cursor-default">{f}</span>
                         ))}
                      </div>
                   </div>
                   <div className="flex flex-col space-y-2 py-4">
                      <span className="text-[10px] font-black tracking-[0.2em] text-text-muted uppercase">Laboratory Artifact Hash</span>
                      <span className="text-text-muted text-[10px] truncate w-full font-mono bg-black/30 p-2 rounded border border-black/50">{model.modelPath}</span>
                   </div>
                </div>
             </div>
           </div>

           {/* Visualization Placeholder */}
           <div className="lg:col-span-7 h-full">
             <div className="glass-card p-12 h-full flex flex-col items-center justify-center text-center border-white/5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-surface to-surface-light opacity-50"></div>
                
                <div className="relative z-10 w-24 h-24 bg-surface-light rounded-2xl border border-white/10 flex items-center justify-center mb-8 text-text-muted group-hover:text-primary transition-colors duration-500 shadow-inner group-hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                   <FileCode size={40} className="group-hover:scale-110 transition-transform duration-500" />
                </div>
                
                <h3 className="relative z-10 text-2xl font-black mb-3 font-display uppercase tracking-tight text-white">Spectral Heatmaps</h3>
                <p className="relative z-10 text-text-secondary mb-10 text-sm font-medium tracking-wide max-w-sm">
                   Dimensional feature importance and multi-class confusion matrices are currently synchronizing.
                </p>
                
                <button className="relative z-10 btn-primary bg-surface/50 text-white border-white/10 hover:border-primary/50 hover:bg-primary/20 px-8 py-3.5 shadow-none group-hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] font-bold text-xs uppercase tracking-widest transition-all">
                   <span className="flex items-center">
                     <ShieldCheck size={16} className="mr-2 text-primary" />
                     Bypass Security Level
                   </span>
                </button>
             </div>
           </div>
        </div>
      </div>
    </Layout>
  );
};

const MetricCard = ({ title, value, icon: Icon, color, border, glow }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className={`glass-card p-8 bg-surface/60 relative overflow-hidden group border ${border} ${glow} transition-all duration-300`}
  >
    <div className={`absolute top-[-20px] right-[-20px] p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-500 group-hover:scale-110`}>
       <Icon size={160} className={color} />
    </div>
    
    <div className="flex justify-between items-start mb-6 relative z-10">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-surface border border-white/5 shadow-inner`}>
         <Icon className={`${color} w-6 h-6`} />
      </div>
    </div>
    
    <div className="relative z-10">
      <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] mb-2">{title}</p>
      <h3 className="text-4xl font-black text-white font-mono tracking-tighter drop-shadow-lg">{value}</h3>
    </div>
  </motion.div>
);

const Settings2 = ({ className, size }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

export default TrainingResults;
