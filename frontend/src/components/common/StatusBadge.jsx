import React from 'react';

const StatusBadge = ({ status }) => {
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-800';

  switch (status) {
    case 'APPROVED':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      break;
    case 'REJECTED':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      break;
    case 'PENDING':
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-600';
      break;
    case 'UNDER_REVIEW':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      break;
    case 'MANUAL_REVIEW':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      break;
    case 'ACTIVE':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      break;
    case 'CLOSED':
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
      break;
    case 'DEFAULTED':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      break;
    default:
      break;
  }

  const formattedStatus = status ? status.replace('_', ' ') : '';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {formattedStatus}
    </span>
  );
};

export default StatusBadge;
