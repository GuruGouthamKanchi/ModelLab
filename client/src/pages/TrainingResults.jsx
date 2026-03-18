import React, { useState, useEffect, useMemo } from 'react';
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
  Cpu,
  Network,
  ShieldCheck,
  BarChart3,
  Clock,
  Database,
  Trash2,
  ArrowLeft
} from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Bar, Scatter, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TrainingResults = () => {
  const { id } = useParams();
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval;
    const fetchModel = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/model/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setModel(res.data);
        
        if (res.data.status === 'completed' || res.data.status === 'failed') {
          setLoading(false);
          clearInterval(interval);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    
    fetchModel();
    interval = setInterval(() => { fetchModel(); }, 3000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) return <Layout><div className="flex items-center justify-center h-full text-primary font-mono tracking-widest animate-pulse">Establishing secure link to laboratory database...</div></Layout>;
  if (!model) return <Layout><div className="text-error font-bold tracking-widest uppercase glass-card p-10">Neural Artifact not found in primary storage.</div></Layout>;

  // Training in progress
  if (model.status === 'training') {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[70vh] text-center relative">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] animate-pulse pointer-events-none"></div>
           <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative mb-14 mt-10">
              <div className="w-40 h-40 border-[4px] border-surface/50 border-t-primary rounded-full animate-spin shadow-[0_0_30px_rgba(168,85,247,0.2)]"></div>
              <div className="w-32 h-32 border-[2px] border-surface/30 border-b-accent rounded-full animate-spin-slow absolute top-4 left-4"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface p-4 rounded-full border border-white/5 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                 <Network className="text-primary w-12 h-12" />
              </div>
           </motion.div>
           <h1 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase font-display">Neural Synthesis in Progress</h1>
           <p className="text-text-secondary max-w-lg mx-auto mb-10 text-sm font-medium leading-relaxed">
             The laboratory engine is processing your artifact, executing feature dimensioning, and running hyperparameter convergence algorithms.
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
                 <StepIndicator label="Environment initialization" sublabel="Verified & Sealed" done />
                 <StepIndicator label={`Artifact Ingestion: ${typeof model.datasetId === 'object' ? model.datasetId?.name : String(model.datasetId).substring(0,8)}...`} sublabel="Memory Allocation Complete" done />
                 <StepIndicator label="Executing model training epochs" sublabel="Calculating Gradients..." active />
              </div>
           </div>
        </div>
      </Layout>
    );
  }

  // Training failed
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
                 <ArrowLeft size={16} className="mr-3" />
                 Redefine Parameters
              </Link>
           </div>
        </div>
      </Layout>
    );
  }

  // Completed - Show results
  const isClassification = model.taskType === 'classification' || !!model.metrics?.accuracy;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto pb-20 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Header */}
        <header className="mb-14 flex flex-col md:flex-row justify-between items-start gap-6 relative z-10 p-8 glass-card border-accent/20 bg-gradient-to-r from-accent/5 to-transparent">
           <div>
             <div className="flex items-center space-x-4 mb-5">
                <span className="bg-accent/10 text-accent border border-accent/30 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase flex items-center shadow-[0_0_15px_rgba(57,255,20,0.15)]">
                  <CheckCircle2 size={14} className="mr-2" />
                  Synthesis Verified
                </span>
                {model.trainingDuration && (
                  <span className="text-text-muted text-[10px] font-mono tracking-widest font-bold bg-white/5 px-2 py-1 rounded border border-white/5 flex items-center">
                    <Clock size={10} className="mr-1.5" /> {model.trainingDuration.toFixed(1)}s
                  </span>
                )}
             </div>
             <h1 className="text-4xl font-black text-white mb-3 tracking-tighter font-display uppercase">{model.name}</h1>
             <p className="text-text-secondary font-medium tracking-wide">
               {isClassification ? 'Classification' : 'Regression'} model using <span className="text-primary font-bold">{model.algorithm}</span>
               {model.datasetId?.name && <> on <span className="text-secondary font-bold">{model.datasetId.name}</span></>}
             </p>
           </div>
           <div className="flex space-x-4">
              <Link to="/models" className="p-3 border border-white/10 rounded-xl text-text-muted hover:text-white bg-surface hover:bg-surface-light transition-all shadow-sm">
                 <ArrowLeft size={20} />
              </Link>
              <Link to={`/predictions?modelId=${model._id}`} className="btn-primary flex items-center space-x-3 px-6 shadow-lg shadow-primary/20 group hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                 <Zap size={18} className="group-hover:scale-110 transition-transform" />
                 <span className="font-bold tracking-widest text-xs uppercase">Begin Inference</span>
              </Link>
           </div>
        </header>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 relative z-10">
           {isClassification ? (
              <>
                 <MetricCard title="System Accuracy" value={`${(model.metrics.accuracy * 100).toFixed(2)}%`} icon={Trophy} color="text-primary" border="border-primary/20" glow="shadow-[0_0_15px_rgba(168,85,247,0.1)]" />
                 <MetricCard title="Precision Rate" value={`${(model.metrics.precision * 100).toFixed(2)}%`} icon={Target} color="text-secondary" border="border-secondary/20" glow="shadow-[0_0_15px_rgba(255,46,147,0.1)]" />
                 <MetricCard title="Recall Index" value={`${(model.metrics.recall * 100).toFixed(2)}%`} icon={Activity} color="text-accent" border="border-accent/20" glow="shadow-[0_0_15px_rgba(57,255,20,0.1)]" />
                 <MetricCard title="F1-Score Unity" value={`${(model.metrics.f1 * 100).toFixed(2)}%`} icon={Zap} color="text-warning" border="border-warning/20" glow="shadow-[0_0_15px_rgba(245,158,11,0.1)]" />
              </>
           ) : (
              <>
                 <MetricCard title="R² Distribution" value={(model.metrics.r2).toFixed(4)} icon={Trophy} color="text-primary" border="border-primary/20" glow="shadow-[0_0_15px_rgba(168,85,247,0.1)]" />
                 <MetricCard title="Mean Squared Error" value={(model.metrics.mse).toFixed(4)} icon={Activity} color="text-error" border="border-error/20" glow="shadow-[0_0_15px_rgba(239,68,68,0.1)]" />
                 <MetricCard title="Mean Absolute Error" value={(model.metrics.mae || 0).toFixed(4)} icon={Target} color="text-warning" border="border-warning/20" glow="shadow-[0_0_15px_rgba(245,158,11,0.1)]" />
                 <MetricCard title="R² Gauge" value={`${(model.metrics.r2 * 100).toFixed(1)}%`} icon={BarChart3} color="text-accent" border="border-accent/20" glow="shadow-[0_0_15px_rgba(57,255,20,0.1)]" gauge={model.metrics.r2} />
              </>
           )}
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-12 gap-8 relative z-10 mb-12">
           {/* Confusion Matrix or Actual vs Predicted */}
           <div className="lg:col-span-7">
             {isClassification && model.metrics?.confusion_matrix ? (
               <ConfusionMatrixChart matrix={model.metrics.confusion_matrix} labels={model.classLabels} />
             ) : model.actualVsPredicted ? (
               <ActualVsPredictedChart data={model.actualVsPredicted} />
             ) : (
               <div className="glass-card p-12 h-full flex items-center justify-center text-text-muted text-sm">No visualization data available</div>
             )}
           </div>

           {/* Feature Importance or Accuracy Gauge */}
           <div className="lg:col-span-5">
             {model.featureImportances ? (
               <FeatureImportanceChart importances={model.featureImportances} />
             ) : (
               <div className="glass-card p-12 h-full flex items-center justify-center text-text-muted text-sm">Feature importance unavailable for this algorithm</div>
             )}
           </div>
        </div>

        {/* Actual vs Predicted for Classification (if we also have it) */}
        {isClassification && model.actualVsPredicted && (
          <div className="mb-12 relative z-10">
            <ActualVsPredictedChart data={model.actualVsPredicted} isClassification />
          </div>
        )}

        {/* Model Details */}
        <div className="grid lg:grid-cols-12 gap-8 relative z-10">
           <div className="lg:col-span-5">
             <div className="glass-card p-10 h-full border-white/5 bg-gradient-to-b from-surface/80 to-surface relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-primary/5 rounded-full blur-[60px] pointer-events-none group-hover:bg-primary/10 transition-colors duration-700"></div>
                <h3 className="text-xl font-black mb-10 flex items-center font-display uppercase tracking-tight text-white relative z-10">
                   <Cpu className="mr-3 text-primary" size={22} />
                   Neural Specifications
                </h3>
                <div className="space-y-6 relative z-10">
                   <DetailRow label="Architecture Topology" value={model.algorithm} />
                   <DetailRow label="Task Type" value={isClassification ? 'Classification' : 'Regression'} accent />
                   <DetailRow label="Target Column" value={model.targetColumn} accent />
                   <div className="flex flex-col space-y-3 py-4 border-b border-white/5">
                      <span className="text-[10px] font-black tracking-[0.2em] text-text-muted uppercase">Input Feature Vectors</span>
                      <div className="flex flex-wrap gap-2">
                         {model.features.map(f => (
                            <span key={f} className="text-[10px] font-bold tracking-wider bg-surface-light border border-white/10 text-text-secondary px-2.5 py-1.5 rounded-md">{f}</span>
                         ))}
                      </div>
                   </div>
                   {model.datasetId?.name && <DetailRow label="Source Dataset" value={`${model.datasetId.name} (${model.datasetId.rowCount || '?'} rows)`} />}
                   <DetailRow label="Created" value={new Date(model.createdAt).toLocaleString()} />
                   <div className="flex flex-col space-y-2 py-4">
                      <span className="text-[10px] font-black tracking-[0.2em] text-text-muted uppercase">Model File Hash</span>
                      <span className="text-text-muted text-[10px] truncate w-full font-mono bg-black/30 p-2 rounded border border-black/50">{model.modelPath}</span>
                   </div>
                </div>
             </div>
           </div>

           <div className="lg:col-span-7">
             {isClassification ? (
               <AccuracyGaugeCard metrics={model.metrics} />
             ) : (
               <RegressionSummaryCard metrics={model.metrics} />
             )}
           </div>
        </div>
      </div>
    </Layout>
  );
};

// --- Sub Components ---

const StepIndicator = ({ label, sublabel, done, active }) => (
  <div className={`flex items-start text-sm group p-3 rounded-lg border relative overflow-hidden ${
    done ? 'text-accent bg-accent/5 border-accent/10' : 
    active ? 'text-primary bg-primary/5 border-primary/20' : 
    'text-text-muted bg-white/[0.02] border-white/5'
  }`}>
    {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.8)]"></div>}
    {done ? <CheckCircle2 size={16} className="mr-3 flex-shrink-0 mt-0.5" /> : <Activity size={16} className="mr-3 flex-shrink-0 mt-0.5 animate-pulse" />}
    <div>
       <div className="font-bold tracking-wide">{label}</div>
       <div className={`text-[10px] font-mono opacity-70 mt-1 uppercase tracking-widest ${done ? 'text-accent/70' : 'text-primary/70'}`}>{sublabel}</div>
    </div>
  </div>
);

const MetricCard = ({ title, value, icon: Icon, color, border, glow, gauge }) => (
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
      {gauge !== undefined && (
        <div className="mt-4 w-full h-2 bg-surface rounded-full overflow-hidden border border-white/5">
          <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-1000" style={{ width: `${Math.max(0, Math.min(100, gauge * 100))}%` }}></div>
        </div>
      )}
    </div>
  </motion.div>
);

const DetailRow = ({ label, value, accent }) => (
  <div className="flex flex-col space-y-2 py-4 border-b border-white/5">
    <span className="text-[10px] font-black tracking-[0.2em] text-text-muted uppercase">{label}</span>
    <span className={`font-mono font-bold text-sm w-fit px-3 py-1.5 rounded-lg border shadow-inner ${
      accent ? 'text-accent bg-accent/10 border-accent/20' : 'text-white bg-white/5 border-white/10'
    }`}>{value}</span>
  </div>
);

// --- Chart Components ---

const ConfusionMatrixChart = ({ matrix, labels }) => {
  if (!matrix || matrix.length === 0) return null;
  
  const classLabels = labels && labels.length > 0 ? labels : matrix.map((_, i) => `Class ${i}`);
  const maxVal = Math.max(...matrix.flat());
  
  return (
    <div className="glass-card p-8 border-white/5">
      <h3 className="text-lg font-black mb-8 flex items-center font-display uppercase tracking-tight text-white">
        <BarChart3 className="mr-3 text-secondary" size={20} />
        Confusion Matrix
      </h3>
      <div className="overflow-x-auto">
        <div className="min-w-fit">
          <div className="grid gap-1" style={{ gridTemplateColumns: `80px repeat(${matrix[0].length}, 1fr)` }}>
            {/* Header row */}
            <div className="text-[9px] font-mono text-text-muted p-2"></div>
            {classLabels.map((label, j) => (
              <div key={`h-${j}`} className="text-[9px] font-mono text-text-secondary p-2 text-center font-bold truncate">P: {String(label)}</div>
            ))}
            
            {/* Matrix rows */}
            {matrix.map((row, i) => (
              <React.Fragment key={`r-${i}`}>
                <div className="text-[9px] font-mono text-text-secondary p-2 flex items-center font-bold truncate">A: {String(classLabels[i])}</div>
                {row.map((val, j) => {
                  const intensity = maxVal > 0 ? val / maxVal : 0;
                  const isDiagonal = i === j;
                  return (
                    <div
                      key={`c-${i}-${j}`}
                      className={`p-3 text-center rounded-lg border transition-all hover:scale-105 cursor-default ${
                        isDiagonal
                          ? 'border-accent/30 text-white font-black'
                          : 'border-white/5 text-text-secondary font-bold'
                      }`}
                      style={{
                        backgroundColor: isDiagonal
                          ? `rgba(57, 255, 20, ${0.05 + intensity * 0.4})`
                          : `rgba(255, 46, 147, ${intensity * 0.3})`,
                      }}
                    >
                      <span className="text-sm font-mono">{val}</span>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-center gap-8 mt-6 text-[10px] text-text-muted font-mono uppercase tracking-widest">
            <span>A = Actual</span>
            <span>P = Predicted</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActualVsPredictedChart = ({ data, isClassification }) => {
  if (!data || !data.actual || !data.predicted) return null;

  const chartData = isClassification ? {
    labels: data.actual.map((_, i) => `#${i+1}`),
    datasets: [
      {
        label: 'Actual',
        data: data.actual.map((v, i) => typeof v === 'string' ? i : v),
        backgroundColor: 'rgba(168, 85, 247, 0.6)',
        borderColor: '#A855F7',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Predicted',
        data: data.predicted.map((v, i) => typeof v === 'string' ? i : v),
        backgroundColor: 'rgba(255, 46, 147, 0.6)',
        borderColor: '#FF2E93',
        borderWidth: 1,
        borderRadius: 4,
      }
    ]
  } : {
    datasets: [
      {
        label: 'Actual vs Predicted',
        data: data.actual.map((a, i) => ({ x: parseFloat(a), y: parseFloat(data.predicted[i]) })),
        backgroundColor: 'rgba(168, 85, 247, 0.6)',
        borderColor: '#A855F7',
        pointRadius: 5,
        pointHoverRadius: 8,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        labels: { color: 'rgba(255,255,255,0.6)', font: { family: 'monospace', size: 11 } }
      },
      tooltip: {
        backgroundColor: 'rgba(13, 13, 13, 0.95)',
        titleFont: { family: 'monospace', size: 12 },
        bodyFont: { family: 'monospace', size: 11 },
        padding: 12,
        cornerRadius: 8,
        borderColor: 'rgba(168, 85, 247, 0.3)',
        borderWidth: 1,
      }
    },
    scales: {
      x: {
        ticks: { color: 'rgba(255,255,255,0.4)', font: { family: 'monospace', size: 10 } },
        grid: { color: 'rgba(255,255,255,0.03)' },
        title: { display: !isClassification, text: 'Actual Values', color: 'rgba(255,255,255,0.5)' }
      },
      y: {
        ticks: { color: 'rgba(255,255,255,0.4)', font: { family: 'monospace', size: 10 } },
        grid: { color: 'rgba(255,255,255,0.03)' },
        title: { display: !isClassification, text: 'Predicted Values', color: 'rgba(255,255,255,0.5)' }
      }
    }
  };

  return (
    <div className="glass-card p-8 border-white/5">
      <h3 className="text-lg font-black mb-6 flex items-center font-display uppercase tracking-tight text-white">
        <Activity className="mr-3 text-primary" size={20} />
        {isClassification ? 'Prediction Comparison' : 'Actual vs Predicted'}
      </h3>
      <div className="h-[300px]">
        {isClassification ? <Bar data={chartData} options={options} /> : <Scatter data={chartData} options={options} />}
      </div>
    </div>
  );
};

const FeatureImportanceChart = ({ importances }) => {
  if (!importances) return null;
  
  const sorted = Object.entries(importances).sort((a, b) => b[1] - a[1]);
  const maxImp = Math.max(...sorted.map(s => s[1]));

  return (
    <div className="glass-card p-8 border-white/5 h-full">
      <h3 className="text-lg font-black mb-8 flex items-center font-display uppercase tracking-tight text-white">
        <Target className="mr-3 text-accent" size={20} />
        Feature Importance
      </h3>
      <div className="space-y-4">
        {sorted.map(([feature, importance], i) => {
          const pct = maxImp > 0 ? (importance / maxImp) * 100 : 0;
          const colors = ['from-primary to-secondary', 'from-secondary to-warning', 'from-accent to-primary', 'from-warning to-secondary'];
          const color = colors[i % colors.length];
          return (
            <div key={feature} className="group">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] font-bold text-text-secondary group-hover:text-white transition-colors truncate mr-4">{feature}</span>
                <span className="text-[10px] font-mono font-bold text-primary">{(importance * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full h-2 bg-surface rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                  className={`h-full bg-gradient-to-r ${color} rounded-full`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AccuracyGaugeCard = ({ metrics }) => {
  const gaugeData = {
    labels: ['Accuracy', 'Precision', 'Recall', 'F1 Score'],
    datasets: [{
      data: [
        metrics.accuracy * 100,
        metrics.precision * 100,
        metrics.recall * 100,
        metrics.f1 * 100,
      ],
      backgroundColor: [
        'rgba(168, 85, 247, 0.8)',
        'rgba(255, 46, 147, 0.8)',
        'rgba(57, 255, 20, 0.8)',
        'rgba(245, 158, 11, 0.8)',
      ],
      borderColor: ['#A855F7', '#FF2E93', '#39FF14', '#F59E0B'],
      borderWidth: 2,
    }]
  };

  return (
    <div className="glass-card p-8 border-white/5 h-full">
      <h3 className="text-lg font-black mb-8 flex items-center font-display uppercase tracking-tight text-white">
        <Trophy className="mr-3 text-warning" size={20} />
        Performance Overview
      </h3>
      <div className="flex items-center justify-center mb-8">
        <div className="w-64 h-64">
          <Doughnut data={gaugeData} options={{
            responsive: true,
            maintainAspectRatio: true,
            cutout: '65%',
            plugins: {
              legend: { 
                position: 'bottom',
                labels: { color: 'rgba(255,255,255,0.6)', font: { family: 'monospace', size: 10 }, padding: 16, usePointStyle: true }
              },
              tooltip: {
                backgroundColor: 'rgba(13, 13, 13, 0.95)',
                bodyFont: { family: 'monospace' },
                callbacks: { label: (ctx) => `${ctx.label}: ${ctx.raw.toFixed(1)}%` }
              }
            }
          }} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Accuracy', value: metrics.accuracy, color: 'text-primary' },
          { label: 'Precision', value: metrics.precision, color: 'text-secondary' },
          { label: 'Recall', value: metrics.recall, color: 'text-accent' },
          { label: 'F1 Score', value: metrics.f1, color: 'text-warning' },
        ].map(m => (
          <div key={m.label} className="text-center p-3 bg-surface-light/50 rounded-xl border border-white/5">
            <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">{m.label}</p>
            <p className={`text-2xl font-black font-mono ${m.color}`}>{(m.value * 100).toFixed(1)}%</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const RegressionSummaryCard = ({ metrics }) => (
  <div className="glass-card p-8 border-white/5 h-full">
    <h3 className="text-lg font-black mb-8 flex items-center font-display uppercase tracking-tight text-white">
      <Trophy className="mr-3 text-primary" size={20} />
      Regression Performance
    </h3>
    <div className="space-y-8">
      <div className="text-center p-8 bg-surface-light/30 rounded-2xl border border-primary/10">
        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-3">R² Score</p>
        <p className="text-6xl font-black font-mono text-primary tracking-tighter">{(metrics.r2 * 100).toFixed(1)}%</p>
        <div className="mt-4 w-full h-3 bg-surface rounded-full overflow-hidden border border-white/5">
          <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all" style={{ width: `${Math.max(0, metrics.r2 * 100)}%` }}></div>
        </div>
        <p className="text-text-muted text-[10px] mt-3 font-mono">{metrics.r2 > 0.9 ? 'Excellent fit' : metrics.r2 > 0.7 ? 'Good fit' : metrics.r2 > 0.5 ? 'Moderate fit' : 'Poor fit'}</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-surface-light/30 rounded-xl border border-white/5 text-center">
          <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-2">MSE</p>
          <p className="text-xl font-black font-mono text-error">{metrics.mse.toFixed(4)}</p>
        </div>
        <div className="p-4 bg-surface-light/30 rounded-xl border border-white/5 text-center">
          <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-2">MAE</p>
          <p className="text-xl font-black font-mono text-warning">{(metrics.mae || 0).toFixed(4)}</p>
        </div>
      </div>
    </div>
  </div>
);

export default TrainingResults;
