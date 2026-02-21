import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, X, User } from 'lucide-react';
import { useCrmMode } from '../../contexts/CrmModeContext';

const CrmModeBanner: React.FC = () => {
    const navigate = useNavigate();
    const { isCrmMode, impersonatedUser, exitCrmMode } = useCrmMode();

    if (!isCrmMode || !impersonatedUser) return null;

    const displayName = [impersonatedUser.firstName, impersonatedUser.lastName]
        .filter(Boolean)
        .join(' ') || impersonatedUser.username || impersonatedUser.email;

    const handleExit = () => {
        exitCrmMode();
        navigate('/app/crm');
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: '72px',
                left: 0,
                right: 0,
                zIndex: 45,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                padding: '0.5rem 1.5rem',
                background: 'linear-gradient(90deg, #f59e0b 0%, #f97316 100%)',
                borderBottom: '1px solid rgba(0,0,0,0.12)',
                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
            }}
        >
            {/* Left: icon + user info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Eye size={16} color="white" />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Mode CRM Admin
                </span>
                <span style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.5)' }} />
                {/* User avatar */}
                <div
                    style={{
                        width: '24px', height: '24px', borderRadius: '50%',
                        background: 'rgba(255,255,255,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, overflow: 'hidden',
                    }}
                >
                    {impersonatedUser.photoURL ? (
                        <img src={impersonatedUser.photoURL} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <User size={14} color="white" />
                    )}
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'white', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    Connecté en tant que <strong>{displayName}</strong>
                    {impersonatedUser.email && (
                        <span style={{ fontWeight: 400, opacity: 0.85 }}> — {impersonatedUser.email}</span>
                    )}
                </span>
            </div>

            {/* Right: exit */}
            <button
                onClick={handleExit}
                style={{
                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                    padding: '0.25rem 0.75rem',
                    background: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.5)',
                    borderRadius: '6px', color: 'white',
                    fontSize: '0.75rem', fontWeight: 700,
                    cursor: 'pointer', transition: 'background 0.15s',
                    whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.35)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
            >
                <X size={14} /> Quitter
            </button>
        </div>
    );
};

export default CrmModeBanner;
