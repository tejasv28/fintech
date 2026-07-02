import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const RegisterPage = () => {
  const { register: registerForm, handleSubmit, formState: { errors } } = useForm();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await register(data);
      toast.success('Registration successful. Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data || 'Registration failed.');
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
            Join FinShield
          </h2>
          <p className="mt-2 text-sm text-ink-500">
            Create an account to get started
          </p>
        </div>
        
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
            error={errors.fullName?.message}
            {...registerForm('fullName', { required: 'Full name is required' })}
          />
          
          <Input
            label="Email address"
            type="email"
            placeholder="john@example.com"
            error={errors.email?.message}
            {...registerForm('email', { required: 'Email is required' })}
          />
          
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...registerForm('password', { required: 'Password is required' })}
          />

          <div className="flex flex-col">
            <label className="text-[13px] font-medium text-ink-700 mb-1.5">Role</label>
            <select
              {...registerForm('role')}
              className="px-4 py-2.5 border border-border rounded-lg text-sm text-ink-900 transition-all duration-150 focus:outline-none focus:ring-3 focus:ring-accent-soft focus:border-accent bg-surface-card appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%238B92A3' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
            >
              <option value="APPLICANT">Applicant</option>
              <option value="LOAN_OFFICER">Loan Officer</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full py-3 text-[15px]"
            >
              {loading ? 'Registering...' : 'Create Account'}
            </Button>
          </div>
          
          <div className="text-center mt-6">
            <Link to="/login" className="text-[13px] font-semibold text-accent hover:text-accent-dark transition-colors">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
