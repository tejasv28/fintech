import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import api from '../../services/api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const ApplyLoan = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [step, setStep] = useState(1);
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIdempotencyKey(uuidv4());
  }, []);

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        loanAmount: Number(data.loanAmount),
        annualIncome: Number(data.annualIncome),
        debtToIncomeRatio: Number(data.debtToIncomeRatio),
        loanTermMonths: Number(data.loanTermMonths),
        creditScore: data.creditScore ? Number(data.creditScore) : null
      };

      await api.post('/loans/apply', payload, {
        headers: { 'X-Idempotency-Key': idempotencyKey }
      });
      
      toast.success('Loan application submitted successfully!');
      navigate('/applicant/applications');
    } catch (error) {
      toast.error(error.response?.data || 'Failed to submit application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-surface-card rounded-card shadow-card border border-border p-10">
      <h1 className="font-display text-2xl font-bold text-ink-900 mb-10">Apply for a Loan</h1>
      
      <div className="flex items-center justify-between mb-12 relative px-4">
        <div className="absolute left-0 top-1/2 w-full h-[2px] bg-border -z-10 transform -translate-y-1/2"></div>
        {[1, 2, 3].map((num) => (
          <div key={num} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[15px] transition-colors duration-300 ${
            step >= num ? 'bg-accent text-white shadow-md' : 'bg-surface border-2 border-border text-ink-300'
          }`}>
            {num}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h2 className="font-display text-lg font-semibold text-ink-900">Step 1: Loan Details</h2>
              <p className="text-[13px] text-ink-500 mt-1">Specify how much you want to borrow.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Loan Amount (₹)"
                type="number"
                {...register('loanAmount', { required: 'Required', min: 1000 })}
                error={errors.loanAmount?.message}
              />
              <Input
                label="Loan Term (Months)"
                type="number"
                {...register('loanTermMonths', { required: 'Required', min: 1 })}
                error={errors.loanTermMonths?.message}
              />
              <div className="md:col-span-2">
                <Input
                  label="Loan Purpose"
                  type="text"
                  placeholder="e.g. Home Renovation, Education"
                  {...register('loanPurpose', { required: 'Required' })}
                  error={errors.loanPurpose?.message}
                />
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-border">
              <Button type="button" onClick={nextStep} variant="primary" className="px-8">Next Step</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h2 className="font-display text-lg font-semibold text-ink-900">Step 2: Financial Information</h2>
              <p className="text-[13px] text-ink-500 mt-1">Tell us about your income and employment.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Annual Income (₹)"
                type="number"
                {...register('annualIncome', { required: 'Required', min: 0 })}
                error={errors.annualIncome?.message}
              />
              <div className="flex flex-col">
                <label className="text-[13px] font-medium text-ink-700 mb-1.5">Employment Status</label>
                <select
                  {...register('employmentStatus', { required: 'Required' })}
                  className="px-4 py-2.5 border border-border rounded-lg text-sm text-ink-900 transition-all duration-150 focus:outline-none focus:ring-3 focus:ring-accent-soft focus:border-accent bg-surface-card appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%238B92A3' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                >
                  <option value="EMPLOYED">Employed</option>
                  <option value="SELF_EMPLOYED">Self-Employed</option>
                  <option value="UNEMPLOYED">Unemployed</option>
                </select>
              </div>
              <Input
                label="Debt-to-Income Ratio (%)"
                type="number"
                step="0.01"
                {...register('debtToIncomeRatio', { required: 'Required', min: 0, max: 100 })}
                error={errors.debtToIncomeRatio?.message}
              />
              <Input
                label="Simulate Credit Score (Optional)"
                type="number"
                placeholder="Leave empty to fetch from bureau"
                {...register('creditScore')}
              />
            </div>
            <div className="flex justify-between pt-4 border-t border-border">
              <Button type="button" onClick={prevStep} variant="secondary">Back</Button>
              <Button type="button" onClick={nextStep} variant="primary" className="px-8">Review</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h2 className="font-display text-lg font-semibold text-ink-900">Step 3: Review & Submit</h2>
              <p className="text-[13px] text-ink-500 mt-1">Please confirm your details before applying.</p>
            </div>
            <div className="bg-surface p-6 rounded-xl border border-border grid grid-cols-2 gap-y-4 gap-x-8">
              <div><p className="text-xs font-semibold text-ink-300 uppercase tracking-wider">Loan Amount</p><p className="font-mono text-sm text-ink-900 mt-1">₹{watch('loanAmount')}</p></div>
              <div><p className="text-xs font-semibold text-ink-300 uppercase tracking-wider">Loan Term</p><p className="font-mono text-sm text-ink-900 mt-1">{watch('loanTermMonths')} months</p></div>
              <div className="col-span-2"><p className="text-xs font-semibold text-ink-300 uppercase tracking-wider">Purpose</p><p className="text-sm font-medium text-ink-900 mt-1">{watch('loanPurpose')}</p></div>
              <div className="col-span-2 border-t border-border my-2"></div>
              <div><p className="text-xs font-semibold text-ink-300 uppercase tracking-wider">Annual Income</p><p className="font-mono text-sm text-ink-900 mt-1">₹{watch('annualIncome')}</p></div>
              <div><p className="text-xs font-semibold text-ink-300 uppercase tracking-wider">Employment</p><p className="text-sm font-medium text-ink-900 mt-1">{watch('employmentStatus')}</p></div>
              <div><p className="text-xs font-semibold text-ink-300 uppercase tracking-wider">DTI Ratio</p><p className="font-mono text-sm text-ink-900 mt-1">{watch('debtToIncomeRatio')}%</p></div>
            </div>
            <div className="flex justify-between pt-4 border-t border-border">
              <Button type="button" onClick={prevStep} variant="secondary">Back</Button>
              <Button type="submit" variant="primary" disabled={loading} className="px-8">
                {loading ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default ApplyLoan;
