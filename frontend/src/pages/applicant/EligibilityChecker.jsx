import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

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
            <h1 className="text-3xl font-bold text-slate-800">Loan Eligibility Pre-Checker</h1>
            <p className="text-slate-600">Quickly see if you meet the basic requirements for a loan before applying.</p>
            
            <Card>
                <CardHeader>
                    <CardTitle>Enter your details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={checkEligibility} className="space-y-4">
                        <Input
                            label="Loan Amount Requested ($)"
                            name="loanAmount"
                            type="number"
                            value={formData.loanAmount}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Annual Income ($)"
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
                        <Button type="submit" className="w-full">Check Eligibility</Button>
                    </form>
                </CardContent>
            </Card>

            {result && (
                <Card className={`border-l-4 ${result.eligible === true ? 'border-green-500' : result.eligible === false ? 'border-red-500' : 'border-yellow-500'}`}>
                    <CardContent className="pt-6">
                        <h3 className={`text-xl font-semibold mb-2 ${result.eligible === true ? 'text-green-700' : result.eligible === false ? 'text-red-700' : 'text-yellow-700'}`}>
                            {result.message}
                        </h3>
                        {result.reasons.length > 0 && (
                            <ul className="list-disc pl-5 text-slate-700 space-y-1 mt-3">
                                {result.reasons.map((r, i) => <li key={i}>{r}</li>)}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default EligibilityChecker;
