
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message }) => {
  return (
    <div
      className="bg-red-900/30 border border-red-700/50 text-red-200 px-4 py-3 rounded-lg relative flex items-start"
      role="alert"
    >
      <AlertTriangle className="w-5 h-5 mr-3 mt-1 flex-shrink-0" />
      <div>
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{message}</span>
      </div>
    </div>
  );
};

export default ErrorAlert;
