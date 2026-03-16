import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Cpu, CheckCircle2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

const AuthPage = ({ type }) => {
  const [activeTab, setActiveTab] = useState(type || 'login');
  const [successMessage, setSuccessMessage] = useState('');
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  useEffect(() => {
    setActiveTab(type || 'login');
  }, [type]);

  const handleRegisterSuccess = (msg) => {
    setSuccessMessage(msg);
    setActiveTab('login');
    // Clear message after 5 seconds
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Mesh */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 bg-background">
        <div className="absolute top-[10%] left-[15%] w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full animate-pulse-glow"></div>
        <div className="absolute bottom-[10%] right-[15%] w-[600px] h-[600px] bg-secondary/10 blur-[150px] rounded-full" style={{ animation: 'pulse-glow 4s infinite alternate' }}></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[460px] relative z-10"
      >
        {/* Branding */}
        <div className="text-center mb-10 text-white">
          <div className="inline-flex items-center space-x-3 mb-8 group cursor-pointer" onClick={() => navigate('/')}>
             <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)] group-hover:shadow-[0_0_35px_rgba(59,130,246,0.5)] transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <Sparkles className="text-white w-6 h-6 relative z-10" />
             </div>
             <div>
                <span className="text-3xl font-black tracking-tighter uppercase font-display block leading-none text-left">ModelLab</span>
             </div>
          </div>
          
          <h1 className="text-4xl font-black tracking-tight mb-2 font-display">
            {activeTab === 'login' ? 'Authentication' : 'Initialization'}
          </h1>
          <p className="text-text-secondary font-medium px-4">
            {activeTab === 'login' 
              ? 'Establish a secure connection to your neural workspace.' 
              : 'Create an identity matrix to access the laboratory.'
            }
          </p>
        </div>

        {/* Success Notification */}
        <AnimatePresence>
          {successMessage && (
            <motion.div 
              initial={{ height: 0, opacity: 0, marginBottom: 0 }}
              animate={{ height: 'auto', opacity: 1, marginBottom: 24 }}
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-success/10 border border-success/30 text-success p-4 rounded-xl flex items-center space-x-3 shadow-[0_0_20px_rgba(16,185,129,0.15)] backdrop-blur-md">
                <CheckCircle2 size={20} className="flex-shrink-0" />
                <span className="text-sm font-bold tracking-wide">{successMessage}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auth Card */}
        <div className="glass-card bg-surface/80 backdrop-blur-2xl border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          
          {/* Neon Top Border */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>

          {/* Tabs */}
          <div className="flex p-1.5 bg-gray-950/50 m-8 mb-8 rounded-xl border border-white/5 relative">
            <button
              onClick={() => { setActiveTab('login'); setSuccessMessage(''); }}
              className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 z-10 ${
                activeTab === 'login' 
                ? 'text-white shadow-lg shadow-black/20' 
                : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Session Login
            </button>
            <button
              onClick={() => { setActiveTab('register'); setSuccessMessage(''); }}
              className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 z-10 ${
                activeTab === 'register' 
                ? 'text-white shadow-lg shadow-black/20' 
                : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Registry
            </button>
            
            {/* Animated Tab Background */}
            <div 
              className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-primary rounded-lg transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_0_15px_rgba(59,130,246,0.5)] z-0"
              style={{ transform: activeTab === 'login' ? 'translateX(0)' : 'translateX(100%)', left: '6px' }}
            >
               <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-lg"></div>
            </div>
          </div>

          {/* Form Content */}
          <div className="px-8 pb-10 relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: activeTab === 'login' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: activeTab === 'login' ? 20 : -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'login' ? (
                  <LoginForm />
                ) : (
                  <RegisterForm onSuccess={handleRegisterSuccess} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Link */}
        <div className="mt-8 text-center text-sm text-text-muted font-medium">
          {activeTab === 'login' ? (
            <p>New to ModelLab? <button onClick={() => setActiveTab('register')} className="text-primary hover:text-primary-glow hover:underline font-bold transition-all ml-1 underline-offset-4">Initialize Identity</button></p>
          ) : (
            <p>Identity established? <button onClick={() => setActiveTab('login')} className="text-primary hover:text-primary-glow hover:underline font-bold transition-all ml-1 underline-offset-4">Authenticate</button></p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
