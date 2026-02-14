import { AlertCircle } from 'lucide-react';

interface ErrorCardProps {
    title?: string;
    message: string;
}

const ErrorCard = ({ title = 'Erreur', message }: ErrorCardProps) => {
    return (
        <div className="card bg-white dark:bg-black border-2 border-[var(--color-error)] shadow-lg">
            <div className="p-6">
                <div className="flex items-start gap-4">
                    <div className="shrink-0 p-3 bg-red-50 dark:bg-red-900/20 rounded-full">
                        <AlertCircle size={28} className="text-[var(--color-error)]" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-[var(--color-error)] mb-2">{title}</h3>
                        <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">{message}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ErrorCard;
