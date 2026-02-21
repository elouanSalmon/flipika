import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import { Shield, Search, LogIn } from 'lucide-react';
import { useCrmMode } from '../contexts/CrmModeContext';
import type { UserProfile } from '../types/userProfile';

const CrmPage: React.FC = () => {
    const navigate = useNavigate();
    const { isCrmModeAvailable, enterCrmMode } = useCrmMode();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [filtered, setFiltered] = useState<UserProfile[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Redirect if not admin
    useEffect(() => {
        if (!isCrmModeAvailable) {
            navigate('/app/reports', { replace: true });
        }
    }, [isCrmModeAvailable]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setIsLoading(true);
                // users collection is publicly readable — admin can list all
                const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
                const snap = await getDocs(q);
                const list: UserProfile[] = snap.docs.map(doc => {
                    const data = doc.data();
                    return {
                        uid: doc.id,
                        ...data,
                        createdAt: data.createdAt?.toDate() || new Date(),
                        updatedAt: data.updatedAt?.toDate() || new Date(),
                    } as UserProfile;
                });
                setUsers(list);
                setFiltered(list);
            } catch (err) {
                console.error('Error fetching users:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFiltered(users);
            return;
        }
        const q = searchQuery.toLowerCase();
        setFiltered(users.filter(u =>
            (u.firstName + ' ' + u.lastName).toLowerCase().includes(q)
            || u.email?.toLowerCase().includes(q)
            || u.username?.toLowerCase().includes(q)
            || u.company?.toLowerCase().includes(q)
        ));
    }, [searchQuery, users]);

    const handleImpersonate = (user: UserProfile) => {
        enterCrmMode(user);
        navigate('/app/reports');
    };

    if (!isCrmModeAvailable) return null;

    const getDisplayName = (user: UserProfile) =>
        [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || user.email || 'Utilisateur';

    return (
        <div className="crm-page" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{
                    width: '48px', height: '48px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                }}>
                    <Shield size={24} color="white" />
                </div>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>CRM Admin</h1>
                    <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '0.875rem' }}>
                        Se connecter en tant qu'un utilisateur Flipika pour voir sa vue
                    </p>
                </div>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                <Search size={16} style={{
                    position: 'absolute', left: '1rem', top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-secondary)',
                }} />
                <input
                    type="text"
                    placeholder="Rechercher un utilisateur..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '0.75rem 1rem 0.75rem 2.75rem',
                        borderRadius: '10px',
                        border: '2px solid var(--color-border, #e5e7eb)',
                        background: 'var(--color-bg-primary, #fff)',
                        color: 'var(--color-text-primary)',
                        fontSize: '0.875rem',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                        boxSizing: 'border-box',
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = '#f59e0b'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border, #e5e7eb)'}
                />
            </div>

            {/* Users list */}
            {isLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{
                            height: '72px', borderRadius: '12px',
                            background: 'var(--color-bg-secondary)', animation: 'pulse 2s infinite',
                        }} />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
                    Aucun utilisateur trouvé
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {filtered.map(user => (
                        <div
                            key={user.uid}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1rem 1.25rem',
                                borderRadius: '12px',
                                background: 'var(--color-bg-primary, #fff)',
                                border: '1px solid var(--color-border, #e5e7eb)',
                                transition: 'box-shadow 0.15s, border-color 0.15s',
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                                (e.currentTarget as HTMLDivElement).style.borderColor = '#f59e0b';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-border, #e5e7eb)';
                            }}
                        >
                            {/* Avatar */}
                            <div style={{
                                width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                overflow: 'hidden',
                                fontSize: '1rem', fontWeight: 700, color: 'white',
                            }}>
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt={getDisplayName(user)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    getDisplayName(user).charAt(0).toUpperCase()
                                )}
                            </div>

                            {/* Info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.9375rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {getDisplayName(user)}
                                </div>
                                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', display: 'flex', gap: '0.75rem', marginTop: '0.125rem' }}>
                                    {user.email && <span>{user.email}</span>}
                                    {user.company && <span>• {user.company}</span>}
                                    {user.username && <span style={{ opacity: 0.7 }}>@{user.username}</span>}
                                </div>
                            </div>

                            {/* Impersonate button */}
                            <button
                                onClick={() => handleImpersonate(user)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.5rem 1rem',
                                    background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                                    border: 'none', borderRadius: '8px',
                                    color: 'white', fontSize: '0.8125rem', fontWeight: 600,
                                    cursor: 'pointer', flexShrink: 0,
                                    transition: 'opacity 0.15s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                            >
                                <LogIn size={15} />
                                Se connecter
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CrmPage;
