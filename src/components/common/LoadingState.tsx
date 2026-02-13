import React from 'react';
import Spinner from './Spinner';

const LoadingState: React.FC<{ message?: string }> = ({ message = 'Chargement...' }) => {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <Spinner size={48} className="mb-4" />
            <p className="text-neutral-500">{message}</p>
        </div>
    );
};

export default LoadingState;
