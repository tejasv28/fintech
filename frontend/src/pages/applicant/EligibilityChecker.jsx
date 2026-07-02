import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const EligibilityChecker = () => {
    const [formData, setFormData] = useState({
        loanAmount: '',
        annualIncome: '',
        creditScore: '',
        debtToIncomeRatio: ''
    });
    const [result, setResult] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const checkEligibility = (e) => {
        e.preventDefault();
        const { loanAmount, annualIncome, creditScore, debtToIncomeRatio } = formData;
        
        let riskScore = 0;
        let reasons = [];
        
        if (creditScore < 600) {
            riskScore += 50;
            reasons.push("Credit score is below 600.");
        } else if (creditScore < 700) {
            riskScore += 20;
        }

        if (debtToIncomeRatio > 40) {
            riskScore += 40;
            reasons.push("Debt-to-Income ratio exceeds 40%.");
        } else if (debtToIncomeRatio > 30) {
            riskScore += 15;
        }

        if (loanAmount > annualIncome * 0.5) {
            riskScore += 30;
            reasons.push("Loan amount exceeds 50% of annual income.");
        }

        if (riskScore >= 60) {
            setResult({ eligible: false, message: "Likely to be rejected based on the entered criteria.", reasons });
        } else if (riskScore > 30) {
            setResult({ eligible: null, message: "May require manual review.", reasons });
        } else {
            setResult({ eligible: true, message: "Likely to be approved!", reasons });
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h1 className="font-display text-2xl font-bold text-ink-900">Loan Eligibility Pre-Checker</h1>
              <p className="text-sm text-ink-500 mt-2">Quickly see if you meet the basic requirements for a loan before applying.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Enter your details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={checkEligibility} className="space-y-5">
                        <Input
                            label="Loan Amount Requested (₹)"
                            name="loanAmount"
                            type="number"
                            value={formData.loanAmount}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Annual Income (₹)"
                            name="annualIncome"
                            type="number"
                            value={formData.annualIncome}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Estimated Credit Score"
                            name="creditScore"
                            type="number"
                            value={formData.creditScore}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Debt-to-Income Ratio (%)"
                            name="debtToIncomeRatio"
                            type="number"
                            value={formData.debtToIncomeRatio}
                            onChange={handleChange}
                            required
                        />
                        <div className="pt-2">
                          <Button type="submit" variant="primary" className="w-full">Check Eligibility</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {result && (
                <div className={`mt-6 p-6 rounded-xl border-l-[6px] shadow-sm flex flex-col gap-4 ${
                  result.eligible === true ? 'bg-success-soft border-l-success' : 
                  result.eligible === false ? 'bg-danger-soft border-l-danger' : 
                  'bg-warning-soft border-l-warning'
                }`}>
                    <div className="flex items-center gap-3">
                      {result.eligible === true ? <CheckCircle2 className="h-6 w-6 text-success" /> : 
                       <AlertCircle className={`h-6 w-6 ${result.eligible === false ? 'text-danger' : 'text-warning'}`} />}
                      <h3 className={`text-base font-semibold ${
                        result.eligible === true ? 'text-success' : 
                        result.eligible === false ? 'text-danger' : 
                        'text-warning'
                      }`}>
                          {result.message}
                      </h3>
                    </div>
                    {result.reasons.length > 0 && (
                        <ul className="list-disc pl-11 text-sm text-ink-700 space-y-1">
                            {result.reasons.map((r, i) => <li key={i}>{r}</li>)}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default EligibilityChecker;
