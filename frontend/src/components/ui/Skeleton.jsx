import React from 'react';

const Skeleton = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200/60 dark:bg-slate-700/60 ${className}`}
      {...props}
    />
  );
};

export { Skeleton };
