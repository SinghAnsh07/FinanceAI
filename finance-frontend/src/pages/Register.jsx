import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { DollarSign, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getErrorMsg } from '../utils/formatters';

const schema = yup.object({
  name:     yup.string().min(2, 'Min 2 characters').required('Name is required'),
  email:    yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Min 6 characters').required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async ({ name, email, password }) => {
    try {
      await registerUser({ name, email, password });
      toast.success('Account created! Welcome 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(getErrorMsg(err));
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #080d18 0%, #0f172a 50%, #1a103a 100%)',
      }}
    >
      <div className="fixed top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: 'var(--color-primary-600)', transform: 'translate(50%, -50%)' }} />

      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: 'var(--color-primary-600)' }}>
            <DollarSign size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-surface-50)' }}>
            Create Account
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-surface-400)' }}>
            Join FinanceAI today
          </p>
        </div>

        <div className="card-glass p-8 rounded-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5"
                style={{ color: 'var(--color-surface-300)' }}>Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--color-surface-400)' }} />
                <input {...register('name')} placeholder="John Doe"
                  className="input-field pl-9" autoComplete="name" />
              </div>
              {errors.name && <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5"
                style={{ color: 'var(--color-surface-300)' }}>Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--color-surface-400)' }} />
                <input {...register('email')} type="email" placeholder="you@example.com"
                  className="input-field pl-9" autoComplete="email" />
              </div>
              {errors.email && <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5"
                style={{ color: 'var(--color-surface-300)' }}>Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--color-surface-400)' }} />
                <input {...register('password')} type={showPwd ? 'text' : 'password'}
                  placeholder="Min 6 characters" className="input-field pl-9 pr-10" />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--color-surface-400)' }}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>{errors.password.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5"
                style={{ color: 'var(--color-surface-300)' }}>Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--color-surface-400)' }} />
                <input {...register('confirmPassword')} type="password"
                  placeholder="Repeat password" className="input-field pl-9" />
              </div>
              {errors.confirmPassword && <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" className="btn btn-primary w-full justify-center py-2.5 text-base mt-2"
              disabled={isSubmitting}>
              {isSubmitting ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--color-surface-400)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-medium" style={{ color: 'var(--color-primary-400)' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
