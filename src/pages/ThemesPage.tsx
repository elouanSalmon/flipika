import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ThemeManager from '../components/themes/ThemeManager';
import { clientService } from '../services/clientService';
import type { Client } from '../types/client';
import './ThemesPage.css';

const ThemesPage: React.FC = () => {
    const { currentUser } = useAuth();
    const [clients, setClients] = useState<Client[]>([]);

    useEffect(() => {
        if (currentUser) {
            loadClients();
        }
    }, [currentUser]);

    const loadClients = async () => {
        if (!currentUser) return;
        try {
            const data = await clientService.getClients(currentUser.uid);
            setClients(data);
        } catch (error) {
            console.error('Error loading clients:', error);
        }
    };

    return (
        <div className="themes-page">
            <ThemeManager clients={clients} />
        </div>
    );
};

export default ThemesPage;
