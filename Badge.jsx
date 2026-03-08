import React from 'react';

const statusStyles = {
  ACTIVE: 'bg-green-500/20 text-green-400 border-green-500/30',
  PENDING_APPROVAL: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  INACTIVE: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  REJECTED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const statusLabels = {
  ACTIVE: 'Active',
  PENDING_APPROVAL: 'Pending',
  INACTIVE: 'Inactive',
  REJECTED: 'Rejected',
};

export default function Badge({ status, className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'} ${className}`}>
      {statusLabels[status] || status}
    </span>
  );
}
