export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '₹0';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: '2-digit' });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString('en-IN', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};

export const formatPercent = (value) => `${parseFloat(value || 0).toFixed(2)}%`;

export const getRiskColor = (score) => {
  if (score <= 33) return 'text-success';
  if (score <= 66) return 'text-warning';
  return 'text-danger';
};
