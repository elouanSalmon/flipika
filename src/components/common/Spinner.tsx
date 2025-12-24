import React from 'react';
import { Loader2 } from 'lucide-react';

interface SpinnerProps {
    size?: number;
    className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 24, className = '' }) => {
    return (
        <Loader2
            size={size}
            className={`animate-spin text-blue-600 dark:text-blue-400 ${className}`}
        />
    );
};

export default Spinner;
