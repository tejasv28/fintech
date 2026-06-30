import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import api from '../../services/api';

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
        creditScore: data.creditScore ? Number(data.creditScore) : null // Mocking bureau fetch if not provided
      };

      await api.post('/loans/apply', payload, {
        headers: {
          'X-Idempotency-Key': idempotencyKey
        }
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
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Apply for a Loan</h1>
      
      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-200 -z-10 transform -translate-y-1/2"></div>
        {[1, 2, 3].map((num) => (
          <div key={num} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= num ? 'bg-finBlue text-white' : 'bg-gray-200 text-gray-500'}`}>
            {num}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold border-b pb-2">Step 1: Loan Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Loan Amount (₹)</label>
                <input
                  type="number"
                  {...register('loanAmount', { required: 'Required', min: 1000 })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-finBlue focus:border-finBlue sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Loan Term (Months)</label>
                <input
                  type="number"
                  {...register('loanTermMonths', { required: 'Required', min: 1 })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-finBlue focus:border-finBlue sm:text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Loan Purpose</label>
                <input
                  type="text"
                  {...register('loanPurpose', { required: 'Required' })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-finBlue focus:border-finBlue sm:text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={nextStep} className="bg-finBlue text-white px-4 py-2 rounded-md hover:bg-blue-700">Next Step</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold border-b pb-2">Step 2: Financial Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Annual Income (₹)</label>
                <input
                  type="number"
                  {...register('annualIncome', { required: 'Required', min: 0 })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-finBlue focus:border-finBlue sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Employment Status</label>
                <select
                  {...register('employmentStatus', { required: 'Required' })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-finBlue focus:border-finBlue sm:text-sm"
                >
                  <option value="EMPLOYED">Employed</option>
                  <option value="SELF_EMPLOYED">Self-Employed</option>
                  <option value="UNEMPLOYED">Unemployed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Debt-to-Income Ratio (%)</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('debtToIncomeRatio', { required: 'Required', min: 0, max: 100 })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-finBlue focus:border-finBlue sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Simulate Credit Score (Optional)</label>
                <input
                  type="number"
                  placeholder="Leave empty to fetch from bureau"
                  {...register('creditScore')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-finBlue focus:border-finBlue sm:text-sm text-gray-500 bg-gray-50"
                />
                <p className="text-xs text-gray-400 mt-1">For demo purposes only.</p>
              </div>
            </div>
            <div className="flex justify-between">
              <button type="button" onClick={prevStep} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">Back</button>
              <button type="button" onClick={nextStep} className="bg-finBlue text-white px-4 py-2 rounded-md hover:bg-blue-700">Review</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold border-b pb-2">Step 3: Review & Submit</h2>
            <div className="bg-gray-50 p-4 rounded-md space-y-2 text-sm">
              <p><span className="font-medium text-gray-600">Loan Amount:</span> ₹{watch('loanAmount')}</p>
              <p><span className="font-medium text-gray-600">Term:</span> {watch('loanTermMonths')} months</p>
              <p><span className="font-medium text-gray-600">Purpose:</span> {watch('loanPurpose')}</p>
              <p><span className="font-medium text-gray-600">Annual Income:</span> ₹{watch('annualIncome')}</p>
              <p><span className="font-medium text-gray-600">Employment:</span> {watch('employmentStatus')}</p>
              <p><span className="font-medium text-gray-600">DTI Ratio:</span> {watch('debtToIncomeRatio')}%</p>
            </div>
            <div className="flex justify-between">
              <button type="button" onClick={prevStep} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">Back</button>
              <button type="submit" disabled={loading} className="bg-finGreen text-white px-6 py-2 rounded-md hover:bg-green-600 disabled:bg-green-300 font-medium">
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default ApplyLoan;
