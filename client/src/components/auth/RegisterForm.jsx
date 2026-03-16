import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { User, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import axios from 'axios';

const RegisterForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Use the register method from context
      const data = await register(formData.name, formData.email, formData.password);
      onSuccess(data.message || 'Registered successfully. Please login.');
    } catch (err) {
      setError(err.response?.data?.message || 'User already registered');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {error && (
        <div className="p-4 bg-error/10 border border-error/20 text-error rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      <div className="space-y-1">
        <label className="text-sm font-medium text-text-secondary px-1">Full Name</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
          <input
            type="text"
            required
            className="input-field w-full pl-12! h-11 bg-gray-900"
            placeholder="e.g. Dr. Ada Lovelace"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-text-secondary px-1">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
          <input
            type="email"
            required
            className="input-field w-full pl-12! h-11 bg-gray-900"
            placeholder="Enter your research email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-text-secondary px-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
            <input
              type="password"
              required
              className="input-field w-full pl-12! h-11 bg-gray-900"
              placeholder="Choose a strong password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-text-secondary px-1">Confirm</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
            <input
              type="password"
              required
              className="input-field w-full pl-12! h-11 bg-gray-900"
              placeholder="Re-type your password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full h-11 text-lg flex items-center justify-center space-x-2 group mt-4"
      >
        {isSubmitting ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <>
            <span>Register</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>
    </form>
  );
};

export default RegisterForm;
