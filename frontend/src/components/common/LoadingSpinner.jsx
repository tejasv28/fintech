import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ text = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <Loader2 className="h-8 w-8 text-accent animate-spin mb-4" />
    <p className="text-ink-500 text-sm font-medium">{text}</p>
  </div>
);

export default LoadingSpinner;
