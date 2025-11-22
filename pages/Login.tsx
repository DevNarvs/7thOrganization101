
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Card, TextField } from '../components/UI';
import { UserRole } from '../types';
import { Shield, Users, User } from 'lucide-react';

const Login: React.FC = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, role, password);
      navigate('/admin', { replace: true });
    } catch (error: any) {
      console.error("Login failed", error);
      setError(error.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (quickEmail: string, quickRole: UserRole, quickPass?: string) => {
    setEmail(quickEmail);
    setRole(quickRole);
    if(quickPass) setPassword(quickPass);
    
    // Small timeout to let state update visually before submitting (optional, for UX)
    setTimeout(() => {
        login(quickEmail, quickRole, quickPass).then(() => navigate('/admin', { replace: true })).catch((err) => setError(err.message));
    }, 100);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">System Login</h1>
          <p className="text-gray-500">Access the management dashboard</p>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase mb-2 text-center">Quick Demo Access</p>
          <div className="grid grid-cols-1 gap-2">
            <button onClick={() => handleQuickLogin('admin@orgconnect.com', 'admin', 'admin123')} className="flex items-center gap-2 text-sm p-2 hover:bg-blue-50 rounded text-gray-700 transition-colors text-left">
              <Shield size={16} className="text-blue-600" /> Admin (Full Access)
            </button>
            <button onClick={() => handleQuickLogin('contact@innovators.org', 'president', 'password123')} className="flex items-center gap-2 text-sm p-2 hover:bg-green-50 rounded text-gray-700 transition-colors text-left">
              <User size={16} className="text-green-600" /> President 1 (Innovators Club)
            </button>
            <button onClick={() => handleQuickLogin('art@collective.org', 'president', 'password123')} className="flex items-center gap-2 text-sm p-2 hover:bg-purple-50 rounded text-gray-700 transition-colors text-left">
              <User size={16} className="text-purple-600" /> President 2 (Arts Collective)
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 border-t pt-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                role === 'admin' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300 text-gray-500'
              }`}
            >
              <Shield size={24} />
              <span className="font-semibold">Admin</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('president')}
              className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                role === 'president' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300 text-gray-500'
              }`}
            >
              <Users size={24} />
              <span className="font-semibold">President</span>
            </button>
          </div>

          <TextField 
            label="Email Address" 
            type="email" 
            placeholder="name@organization.org" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <TextField 
            label="Password" 
            type="password" 
            placeholder="Required" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" fullWidth isLoading={loading}>
            Sign In as {role}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Login;
