import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Zap, Database, BarChart3, ArrowRight, Github, Sparkles, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background text-white selection:bg-primary/30 relative overflow-hidden">
      {/* Dynamic Animated Background Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-primary/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/3 animate-pulse-glow"></div>
         <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-secondary/10 rounded-full blur-[150px] translate-y-1/3 -translate-x-1/4"></div>
         <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2"></div>
      </div>

      {/* Navbar */}
      <nav className="border-b border-white/5 bg-background/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)] group-hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <Sparkles className="text-white w-5 h-5 relative z-10" />
              </div>
              <div>
                 <span className="text-2xl font-black tracking-tighter text-white uppercase font-display block leading-none">ModelLab</span>
                 <span className="text-[9px] font-mono text-primary font-bold tracking-[0.2em] uppercase">Neural Engine</span>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8 text-sm font-semibold tracking-wide text-text-secondary">
              <a href="#features" className="hover:text-white transition-colors">Architecture</a>
              <a href="#demo" className="hover:text-white transition-colors">Telemetry</a>
              <a href="#docs" className="hover:text-white transition-colors">Docs</a>
              <div className="h-4 w-px bg-gray-800"></div>
              <Link to="/login" className="hover:text-white transition-colors font-mono uppercase tracking-widest text-xs">Initialize_Session</Link>
              <Link to="/register" className="btn-primary group">
                 <span className="relative z-10">Access Platform</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-40 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.2 }}
               className="inline-flex items-center space-x-2 px-4 py-2 mb-8 text-xs font-bold font-mono tracking-widest text-primary uppercase bg-primary/10 border border-primary/20 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.15)]"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span>ModelLab Engine v2.0 Online</span>
            </motion.div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 text-white leading-[1.1]">
              Zero-Friction <br />
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent neon-text-glow">Neural Training.</span>
            </h1>
            
            <p className="max-w-3xl mx-auto text-xl text-text-secondary mb-14 font-medium leading-relaxed">
              Ingest raw telemetry, synthesize feature architectures, and deploy intelligent models. 
              An elite AutoML proving ground built for modern AI researchers.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
              <Link to="/register" className="btn-primary px-10 py-5 text-lg flex items-center group w-full sm:w-auto justify-center">
                <span>Engage Laboratory</span>
                <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </Link>
              <button className="px-10 py-5 text-lg font-bold border border-white/10 rounded-lg hover:bg-white/5 hover:border-white/20 transition-all flex items-center bg-gray-900/40 backdrop-blur-sm w-full sm:w-auto justify-center">
                <Activity className="mr-3 w-5 h-5 text-secondary" />
                View Neural Metrics
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative z-10 border-t border-white/5 bg-gray-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Core Infrastructure</h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">A unified, precision-engineered stack for data telemetry, algorithmic selection, and real-time inference.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Database, title: "Data Ingestion", desc: "Drag and drop massive CSV/XLSX artifacts. High-speed parsing with automated schema null-indexing." },
              { icon: BarChart3, title: "Spectral Analysis", desc: "Real-time distribution mapping to detect data drift and outlier anomalies across deep feature sets." },
              { icon: Cpu, title: "AutoML Engine", desc: "Select from Random Forest, Logistic Regression, KNN, and more. Instant hyperparameter scaffolding." },
              { icon: Zap, title: "Live Inference", desc: "Execute immediate predictions against deployed neural state. View detailed confidence probabilities." },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="glass-card p-10 group"
              >
                <div className="w-14 h-14 bg-gray-900 border border-gray-800 group-hover:border-primary/50 group-hover:bg-primary/10 rounded-xl flex items-center justify-center mb-8 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <f.icon className="text-primary w-7 h-7 relative z-10" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-primary transition-colors">{f.title}</h3>
                <p className="text-text-secondary leading-relaxed font-medium">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-white/5 relative z-10 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-text-secondary">
          <div className="flex items-center space-x-3 mb-6 md:mb-0">
            <Sparkles className="text-primary w-6 h-6" />
            <span className="text-xl font-black text-white tracking-tighter uppercase font-display">ModelLab <span className="text-primary">OS</span></span>
          </div>
          <div className="flex items-center space-x-4 mb-6 md:mb-0 font-mono text-xs uppercase tracking-widest text-text-muted">
             <span>System Build: 2.0.404.1</span>
             <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
             <span>Status: Optimal</span>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="p-2 border border-gray-800 rounded-lg hover:border-primary hover:text-primary transition-colors bg-gray-900"><Github size={20} /></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
