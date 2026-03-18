import React, { useContext } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Database, 
  Cpu, 
  History, 
  Activity, 
  Settings, 
  LogOut,
  ChevronRight,
  Sparkles,
  Zap
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Datasets', icon: Database, path: '/datasets' },
    { name: 'Models', icon: Cpu, path: '/models' },
    { name: 'Experiments', icon: History, path: '/experiments' },
    { name: 'Predictions', icon: Activity, path: '/predictions' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="w-72 h-screen glass-panel border-r border-primary/10 flex flex-col fixed left-0 top-0 z-50">
      <div className="p-8">
        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)] group-hover:shadow-[0_0_30px_rgba(255,46,147,0.5)] transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <Sparkles className="text-white w-5 h-5 relative z-10" />
          </div>
          <div>
             <span className="text-2xl font-black tracking-tighter text-white uppercase font-display block leading-none">ModelLab</span>
             <span className="text-[9px] font-mono text-primary font-bold tracking-[0.2em] uppercase">Neural Engine</span>
          </div>
        </div>
      </div>

      <div className="px-6 mb-4">
         <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-hide py-2">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={`
                relative flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 group overflow-hidden
                ${isActive 
                  ? 'bg-primary/10 text-white' 
                  : 'text-text-secondary hover:bg-primary/5 hover:text-white'}
              `}
            >
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active"
                  className="absolute inset-0 border border-primary/30 rounded-xl bg-primary/5 shadow-[inset_0_0_20px_rgba(168,85,247,0.08)]"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              
              <div className="flex items-center space-x-4 relative z-10">
                <item.icon 
                  size={20} 
                  className={`transition-colors duration-300 ${isActive ? 'text-primary' : 'group-hover:text-primary/70'}`} 
                />
                <span className="font-semibold text-sm tracking-wide">{item.name}</span>
              </div>
              
              {isActive && (
                <div className="relative z-10 text-primary">
                   <ChevronRight size={16} />
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-6 mt-auto">
        <div className="p-4 rounded-xl bg-gradient-to-br from-surface-light/80 to-surface border border-primary/10 relative overflow-hidden group mb-4">
           <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/15 blur-xl rounded-full group-hover:bg-secondary/20 transition-colors"></div>
           <div className="flex items-center space-x-3 relative z-10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-secondary to-primary flex items-center justify-center text-white font-bold font-display shadow-lg ring-2 ring-primary/20">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-sm font-bold text-white truncate">{user?.name || 'Developer'}</p>
                <p className="text-[10px] text-primary font-mono truncate uppercase flex items-center">
                   <Zap size={10} className="mr-1" />
                   Active Session
                </p>
              </div>
           </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-text-secondary hover:bg-error/10 hover:text-error hover:border-error/20 border border-transparent rounded-xl transition-all font-semibold text-sm group"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>Terminate Session</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
