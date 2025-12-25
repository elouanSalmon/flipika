import React, { useState } from 'react';
import { Lock, AlertCircle } from 'lucide-react';
import './PasswordPrompt.css';

interface PasswordPromptProps {
    onSubmit: (password: string) => Promise<boolean>;
    reportTitle: string;
}

const PasswordPrompt: React.FC<PasswordPromptProps> = ({ onSubmit, reportTitle }) => {
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!password.trim()) {
            setError('Veuillez entrer un mot de passe');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const isValid = await onSubmit(password);

            if (!isValid) {
                setError('Mot de passe incorrect');
                setPassword('');
            }
        } catch (err) {
            setError('Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="password-prompt-overlay">
            <div className="password-prompt-container">
                <div className="password-prompt-icon">
                    <Lock size={48} />
                </div>

                <h1 className="password-prompt-title">Rapport protégé</h1>
                <p className="password-prompt-subtitle">{reportTitle}</p>

                <form onSubmit={handleSubmit} className="password-prompt-form">
                    <div className="password-input-wrapper">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError(null);
                            }}
                            placeholder="Entrez le mot de passe"
                            className={`password-input ${error ? 'error' : ''}`}
                            disabled={isLoading}
                            autoFocus
                        />
                        {error && (
                            <div className="password-error">
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="password-submit-btn"
                        disabled={isLoading || !password.trim()}
                    >
                        {isLoading ? 'Vérification...' : 'Accéder au rapport'}
                    </button>
                </form>

                <p className="password-prompt-help">
                    Ce rapport est protégé par mot de passe. Contactez l'auteur si vous n'avez pas reçu le mot de passe.
                </p>
            </div>
        </div>
    );
};

export default PasswordPrompt;
