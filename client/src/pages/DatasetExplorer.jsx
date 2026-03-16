import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { 
  BarChart3, 
  Table as TableIcon, 
  Info, 
  Activity, 
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Settings2,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Network
} from 'lucide-react';
import axios from 'axios';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  PointElement,
  LineElement,
  ArcElement
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement,
  LineElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend
);

const DatasetExplorer = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('preview');
  const [selectedColumn, setSelectedColumn] = useState('');

  useEffect(() => {
    const fetchDataset = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/dataset/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
        if (res.data.dataset.columns.length > 0) {
          setSelectedColumn(res.data.dataset.columns[0].name);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDataset();
  }, [id]);

  if (loading) return <Layout><div className="flex items-center justify-center h-full text-primary font-mono animate-pulse">Establishing secure link to laboratory database...</div></Layout>;
  if (!data) return <Layout><div className="text-error glass-card p-10 font-bold tracking-widest uppercase">Neural Artifact not found in primary storage.</div></Layout>;

  const { dataset, preview } = data;

  // Chart Data Preparation
  const getChartData = () => {
    const colName = selectedColumn;
    if (!colName || !dataset.metadata) return null;

    const metadata = dataset.metadata;
    const isNumeric = dataset.columns.find(c => c.name === colName)?.type === 'number';

    if (isNumeric && metadata.histograms && metadata.histograms[colName]) {
      // It's a numeric column with histogram data
      const hist = metadata.histograms[colName];
      const labels = hist.bins.slice(0, -1).map((b, i) => `${b.toFixed(2)} - ${hist.bins[i+1].toFixed(2)}`);
      return {
        labels: labels,
        datasets: [{
          label: 'Frequency',
          data: hist.counts,
          backgroundColor: 'rgba(6, 182, 212, 0.4)',
          borderColor: '#06b6d4',
          borderWidth: 2,
          borderRadius: 4,
          hoverBackgroundColor: '#06b6d4',
        }]
      };
    } else if (metadata.categorical_stats && metadata.categorical_stats[colName]) {
      // It's a categorical column
      const catStats = metadata.categorical_stats[colName].top_values;
      return {
        labels: Object.keys(catStats),
        datasets: [{
          label: 'Frequency',
          data: Object.values(catStats),
          backgroundColor: 'rgba(139, 92, 246, 0.4)', // Violet-500
          borderColor: '#8b5cf6',
          borderWidth: 2,
          borderRadius: 4,
          hoverBackgroundColor: '#8b5cf6',
        }]
      };
    }
    
    return { labels: [], datasets: [] };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleFont: { family: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', size: 12 },
        bodyFont: { family: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', size: 11 },
        padding: 12,
        borderColor: 'rgba(6, 182, 212, 0.3)',
        borderWidth: 1,
        boxPadding: 6,
        usePointStyle: true,
      }
    },
    scales: {
      y: { 
        grid: { color: 'rgba(255,255,255,0.02)' }, 
        ticks: { color: '#64748b', font: { family: 'monospace', size: 10 } },
        border: { display: false }
      },
      x: { 
        grid: { display: false }, 
        ticks: { color: '#64748b', font: { family: 'monospace', size: 10 } },
        border: { display: false }
      }
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto pb-16">
        <header className="mb-10 flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
          <div className="flex items-start space-x-6">
            <Link to="/datasets" className="mt-1.5 p-2.5 bg-surface/50 border border-white/5 rounded-xl text-text-muted hover:text-white hover:border-primary/50 transition-all shadow-lg hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <div className="flex flex-wrap items-center gap-4 mb-3">
                 <h1 className="text-4xl font-black text-white tracking-tighter uppercase font-display">{dataset.name}</h1>
                 {dataset.isCleanedVersion && (
                   <span className="px-2.5 py-1 bg-success/20 text-success border border-success/30 rounded shadow-[0_0_10px_rgba(16,185,129,0.2)] text-[10px] font-mono font-black tracking-widest uppercase flex items-center">
                      <ShieldCheck size={12} className="mr-1.5" /> CLEANED ARTIFACT
                   </span>
                 )}
                 <span className="px-2.5 py-1 bg-primary/20 text-primary border border-primary/30 rounded shadow-[0_0_10px_rgba(59,130,246,0.2)] text-[10px] font-mono font-black tracking-widest uppercase">
                    {(dataset.fileType || '.csv').replace('.', '')}
                 </span>
              </div>
              <p className="text-text-secondary text-sm flex items-center font-mono font-medium tracking-wide">
                <Database size={14} className="mr-2 text-primary" />
                {dataset.rowCount.toLocaleString()} ROWS 
                <span className="mx-3 text-white/20">|</span> 
                {dataset.columnCount} COLUMNS
                {dataset.metadata?.fileSize && (
                   <>
                     <span className="mx-3 text-white/20">|</span> 
                     {(dataset.metadata.fileSize / 1024 / 1024).toFixed(2)} MB
                   </>
                )}
              </p>
              {dataset.description && (
                <div className="mt-6 p-5 bg-gradient-to-r from-primary/10 to-transparent border-l-2 border-primary rounded-r-xl max-w-4xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-background to-transparent pointer-events-none"></div>
                   <p className="text-sm text-text-primary font-medium leading-relaxed italic pr-12">"{dataset.description}"</p>
                </div>
              )}
            </div>
          </div>
          <Link to={`/models/build?datasetId=${id}`} className="btn-primary flex items-center space-x-3 px-8 py-4 shadow-lg shadow-primary/20 group hover:shadow-[0_0_25px_rgba(59,130,246,0.4)]">
             <Zap size={18} className="group-hover:scale-110 transition-transform" />
             <span className="font-bold tracking-widest text-xs uppercase">Initialize Training</span>
          </Link>
        </header>

        {/* Tabs */}
        <div className="flex space-x-8 border-b border-white/5 mb-10 overflow-x-auto scrollbar-hide">
          {[
            { id: 'preview', label: 'In-situ Preview', icon: TableIcon },
            { id: 'stats', label: 'Spectral Analysis', icon: BarChart3 },
            { id: 'correlations', label: 'Correlation Matrix', icon: Network },
            { id: 'clean', label: 'Data Cleaning', icon: ShieldCheck },
            { id: 'info', label: 'Protocol Metadata', icon: Info },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-3 pb-5 text-xs font-black tracking-[0.2em] uppercase transition-all relative whitespace-nowrap ${
                activeTab === tab.id ? 'text-white' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <tab.icon size={16} className={activeTab === tab.id ? 'text-primary' : ''} />
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTab_explorer"
                  className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary via-accent to-primary shadow-[0_-2px_15px_rgba(6,182,212,0.6)]" 
                />
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'preview' && (
            <motion.div 
              key="preview"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="glass-card overflow-hidden border-white/5"
            >
              <div className="p-5 bg-surface/50 border-b border-white/5 flex items-center justify-between">
                 <span className="text-[10px] font-mono text-primary font-bold tracking-widest uppercase flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse mr-2 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                    Temporal sampling: First 100 observations
                 </span>
                 <div className="flex space-x-3">
                    <button className="p-2 hover:bg-white/10 rounded-lg border border-white/5 text-text-muted hover:text-white transition-colors shadow-sm"><ChevronLeft size={16}/></button>
                    <button className="p-2 hover:bg-white/10 rounded-lg border border-white/5 text-text-muted hover:text-white transition-colors shadow-sm"><ChevronRight size={16}/></button>
                 </div>
              </div>
              <div className="overflow-x-auto max-h-[600px] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-surface z-10 shadow-lg border-b border-white/5">
                    <tr>
                      {dataset.columns.map(col => (
                        <th key={col.name} className="px-6 py-5 text-[10px] font-mono font-black uppercase tracking-[0.15em] text-text-secondary border-b border-white/5 min-w-[200px] bg-surface/90 backdrop-blur-md">
                          <div className="flex flex-col space-y-1.5">
                            <span className="text-white">{col.name}</span>
                            <span className="text-accent/70 font-bold tracking-widest">{col.type}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {preview.map((row, i) => (
                      <tr key={i} className="hover:bg-primary/[0.03] transition-colors group">
                        {dataset.columns.map(col => (
                          <td key={col.name} className="px-6 py-4 text-sm text-text-secondary font-mono truncate max-w-[200px] group-hover:text-text-primary transition-colors">
                            {row[col.name]?.toString() || <span className="text-error/50 italic opacity-50 font-bold tracking-wider">NULL</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

           {activeTab === 'stats' && (
            <motion.div 
              key="stats"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="grid lg:grid-cols-4 gap-8 text-white relative items-start">
                 <div className="lg:col-span-1 space-y-4 sticky top-24">
                    <h3 className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] mb-6 flex items-center">
                       <BarChart3 size={14} className="mr-2 text-primary" />
                       Feature Dimensions
                    </h3>
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-3 scrollbar-thin scrollbar-thumb-white/10">
                      {dataset.columns.map(col => (
                        <button
                          key={col.name}
                          onClick={() => setSelectedColumn(col.name)}
                          className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-300 relative overflow-hidden group ${
                            selectedColumn === col.name 
                              ? 'bg-gradient-to-r from-accent/20 to-primary/10 border-accent/40 shadow-[0_0_20px_rgba(6,182,212,0.15)] text-white' 
                              : 'bg-surface/50 border-white/5 text-text-secondary hover:border-white/20 hover:text-white'
                          }`}
                        >
                           {selectedColumn === col.name && (
                             <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
                           )}
                           <div className="font-bold text-sm truncate tracking-wide">{col.name}</div>
                           <div className="flex items-center justify-between mt-2">
                             <div className={`text-[10px] uppercase font-mono tracking-widest font-black ${selectedColumn === col.name ? 'text-accent' : 'opacity-50'}`}>{col.type}</div>
                             {dataset.metadata?.numeric_stats?.[col.name] && (
                               <div className="text-[9px] text-text-muted font-mono">μ: {dataset.metadata.numeric_stats[col.name].mean.toFixed(2)}</div>
                             )}
                           </div>
                        </button>
                      ))}
                    </div>
                 </div>

                 <div className="lg:col-span-3">
                    <div className="glass-card p-10 h-[650px] flex flex-col border-white/5 relative overflow-hidden group hover:border-accent/20 transition-colors duration-500">
                       <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-accent/10 transition-colors duration-700"></div>
                       
                       <div className="flex justify-between items-start mb-12 relative z-10">
                          <div>
                            <h3 className="text-3xl font-black flex items-center mb-3 font-display uppercase tracking-tighter">
                              Statistical Density: 
                              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary ml-4 font-mono">{selectedColumn}</span>
                            </h3>
                            <p className="text-sm text-text-secondary font-medium tracking-wide">Auto-generated distribution map based on backend metrics.</p>
                          </div>
                          <div className="p-1.5 bg-surface/80 rounded-xl border border-white/5 flex space-x-1 shadow-lg backdrop-blur-md">
                             <button className="px-5 py-2 text-[10px] font-black uppercase tracking-widest bg-white/10 text-white rounded-lg shadow-sm border border-white/5">Auto</button>
                          </div>
                       </div>
                       <div className="flex-1 w-full relative z-10">
                          <Bar data={getChartData()} options={chartOptions} />
                       </div>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'correlations' && (
            <motion.div 
               key="correlations"
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.98 }}
               className="glass-card p-10 relative overflow-hidden group border-white/5"
            >
              <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-secondary/20 transition-colors duration-1000"></div>
              
              <div className="mb-10 relative z-10">
                 <h3 className="text-3xl font-black text-white flex items-center font-display uppercase tracking-tighter mb-2">
                   <Network size={28} className="mr-4 text-secondary" />
                   Pearson Correlation Matrix
                 </h3>
                 <p className="text-text-secondary text-sm font-medium">Identify linear relationships between numerical features.</p>
              </div>

              {dataset.metadata?.correlation && Object.keys(dataset.metadata.correlation).length > 0 ? (
                <div className="relative z-10 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10">
                  <table className="border-collapse">
                    <thead>
                      <tr>
                        <th className="p-3"></th>
                        {Object.keys(dataset.metadata.correlation).map(col => (
                          <th key={col} className="p-3 text-[10px] font-mono text-text-secondary uppercase tracking-widest rotate-45 transform origin-bottom-left max-w-[150px] truncate whitespace-nowrap">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(dataset.metadata.correlation).map(rowCol => (
                        <tr key={rowCol}>
                          <td className="p-3 text-[10px] font-mono font-bold text-white uppercase tracking-widest text-right pr-6 max-w-[150px] truncate whitespace-nowrap border-r border-white/5">{rowCol}</td>
                          {Object.keys(dataset.metadata.correlation).map(col => {
                            const val = dataset.metadata.correlation[rowCol][col];
                            // Color scaling block: 
                            // Strong positive -> Blue/Cyan, Strong negative -> Red/Orange, near 0 -> dark
                            const gV = Math.abs(val);
                            let bgColor = `rgba(15, 23, 42, 1)`; // default dark
                            if (val > 0.1) bgColor = `rgba(6, 182, 212, ${gV})`;
                            if (val < -0.1) bgColor = `rgba(239, 68, 68, ${gV})`;
                            if (val === 1) bgColor = `rgba(59, 130, 246, 0.8)`; // Self

                            return (
                              <td key={col} className="w-12 h-12 border border-white/5 p-0 group/cell relative">
                                <div className="w-full h-full flex items-center justify-center transition-colors" style={{ backgroundColor: bgColor }}>
                                  <span className="text-[9px] font-mono font-bold text-white opacity-0 group-hover/cell:opacity-100 transition-opacity absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-20">
                                    {val.toFixed(2)}
                                  </span>
                                </div>
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-20 text-center border-2 border-dashed border-white/10 rounded-2xl relative z-10">
                   <p className="text-text-muted font-mono tracking-widest uppercase">Insufficient numeric dimensions for correlation mapping.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'clean' && (
            <motion.div 
               key="clean"
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.98 }}
            >
              <div className="glass-card p-10 border-white/5">
                <div className="mb-10 text-center">
                   <h3 className="text-2xl font-black text-white font-display uppercase tracking-tight mb-2">Data Preparation Suite</h3>
                   <p className="text-text-secondary text-sm">Orchestrate cleaning pipelines to generate a new, stabilized variant of this dataset.</p>
                </div>
                <div className="flex flex-col items-center justify-center h-[300px]">
                   <ShieldCheck size={48} className="text-primary mb-6 opacity-50" />
                   <Link to={`/datasets/${id}/clean`} className="btn-primary flex items-center space-x-3 px-8 py-4 shadow-lg shadow-primary/20 hover:shadow-[0_0_25px_rgba(59,130,246,0.3)]">
                      <span className="font-bold tracking-widest uppercase text-sm">Launch Cleaning Interface</span>
                   </Link>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'info' && (
            <motion.div 
              key="info"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
               <div className="glass-card p-10 lg:col-span-1 border-white/5 relative overflow-hidden group hover:border-primary/20 transition-colors duration-500">
                  <div className="absolute top-[-50px] left-[-50px] w-[200px] h-[200px] bg-primary/10 rounded-full blur-[60px] pointer-events-none group-hover:bg-primary/20 transition-colors"></div>
                  
                  <h3 className="text-xl font-black tracking-tight mb-8 flex items-center font-display uppercase relative z-10 text-white">
                    <Settings2 size={22} className="mr-3 text-primary" />
                    Storage Protocol
                  </h3>
                  <div className="space-y-6 relative z-10">
                     <Attribute label="Original Identifier" value={dataset.originalName} />
                     <Attribute label="Laboratory ID" value={id} highlight />
                     <Attribute label="Encrypted Entry" value={new Date(dataset.uploadedAt).toLocaleString()} />
                     <Attribute label="Artifact Type" value={dataset.fileType.toUpperCase().replace('.', '')} />
                     <Attribute label="File Mass" value={dataset.metadata?.fileSize ? `${(dataset.metadata.fileSize / 1024).toFixed(1)} KB` : 'N/A'} />
                  </div>
               </div>
               
               <div className="glass-card p-10 lg:col-span-2 border-white/5 relative overflow-hidden group hover:border-success/20 transition-colors duration-500">
                  <div className="absolute top-[-50px] right-[-50px] w-[300px] h-[300px] bg-success/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-success/10 transition-colors"></div>

                  <div className="flex justify-between items-center mb-10 relative z-10">
                    <h3 className="text-xl font-black tracking-tight flex items-center font-display uppercase text-white">
                      <ShieldCheck size={22} className="mr-3 text-success" />
                      Neural Health Assessment
                    </h3>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-x-12 gap-y-10 relative z-10">
                     {dataset.columns.map(col => {
                        const nullCount = dataset.metadata?.nullCounts?.[col.name] || 0;
                        const nullPercentage = ((nullCount / dataset.rowCount) * 100).toFixed(1);
                        const isHighRisk = parseFloat(nullPercentage) > 20;

                        return (
                          <div key={col.name} className="space-y-4">
                             <div className="flex justify-between items-end">
                                <div className="space-y-1.5">
                                  <p className="text-sm font-bold text-white font-mono tracking-wide">{col.name}</p>
                                  <p className="text-[10px] text-text-muted uppercase font-black tracking-widest">{col.type}</p>
                                </div>
                                <div className={`flex items-center text-[10px] font-black tracking-widest font-mono ${parseFloat(nullPercentage) > 0 ? (isHighRisk ? 'text-error' : 'text-warning') : 'text-success'}`}>
                                   {parseFloat(nullPercentage) > 0 && <AlertTriangle size={12} className="mr-1.5" />}
                                   {nullPercentage}% MISSING
                                </div>
                             </div>
                             <div className="w-full h-2 bg-surface rounded-full overflow-hidden border border-white/5">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${100 - nullPercentage}%` }}
                                  transition={{ duration: 1, ease: "easeOut" }}
                                  className={`h-full ${isHighRisk ? 'bg-gradient-to-r from-error/50 to-error shadow-[0_0_15px_rgba(239,68,68,0.5)]' : (parseFloat(nullPercentage) > 0 ? 'bg-gradient-to-r from-warning/50 to-warning shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-gradient-to-r from-success/50 to-success shadow-[0_0_15px_rgba(16,185,129,0.5)]')}`}
                                />
                             </div>
                          </div>
                        );
                     })}
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

const Attribute = ({ label, value, highlight }) => (
  <div className="flex flex-col space-y-2 py-4 border-b border-white/5 last:border-0 text-white">
     <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">{label}</span>
     <span className={`text-sm font-mono truncate font-medium ${highlight ? 'text-primary bg-primary/10 px-2 py-1 -ml-2 rounded w-fit border border-primary/20' : ''}`}>{value}</span>
  </div>
);

export default DatasetExplorer;
