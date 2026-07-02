import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const LoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const user = await login(data.email, data.password);
      toast.success('Login successful');
      
      if (user.role === 'ADMIN') navigate('/admin');
      else if (user.role === 'LOAN_OFFICER') navigate('/officer');
      else navigate('/applicant');
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-surface-card p-10 rounded-card shadow-card border border-border">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent-soft mb-4">
            <Shield className="h-7 w-7 text-accent" />
          </div>
          <h2 className="font-display text-2xl font-bold text-ink-900">
            FinShield
          </h2>
          <p className="mt-2 text-sm text-ink-500">
            Enterprise Underwriting Engine
          </p>
        </div>
        
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Email address"
            type="email"
            placeholder="Enter your email"
            error={errors.email?.message}
            {...register('email', { required: 'Email is required' })}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password', { required: 'Password is required' })}
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full py-3 text-[15px]"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
          
          <div className="text-center mt-6">
            <Link to="/register" className="text-[13px] font-semibold text-accent hover:text-accent-dark transition-colors">
              Don't have an account? Register here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
