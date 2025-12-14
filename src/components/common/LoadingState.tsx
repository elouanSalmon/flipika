import React from 'react';

const LoadingState: React.FC<{ message?: string }> = ({ message = 'Chargement...' }) => {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="loading loading-spinner loading-lg text-blue-600 dark:text-blue-400 mb-4"></div>
            <p className="text-gray-500">{message}</p>
        </div>
    );
};

export default LoadingState;
