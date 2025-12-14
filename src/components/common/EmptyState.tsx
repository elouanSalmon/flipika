import React from 'react';

interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    message: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message, action }) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 text-gray-400">{icon}</div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">{message}</p>
            {action && (
                <button onClick={action.onClick} className="btn btn-primary">
                    {action.label}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
