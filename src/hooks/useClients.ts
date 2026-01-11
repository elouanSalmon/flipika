import { useState, useEffect } from 'react';
import { clientService } from '../services/clientService';
import type { Client, CreateClientInput, UpdateClientInput } from '../types/client';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Or reuse auth from config
import toast from 'react-hot-toast';

export const useClients = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null); // Quick fix for user

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            if (user) {
                fetchClients(user.uid);
            } else {
                setClients([]);
                setIsLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchClients = async (userId: string) => {
        setIsLoading(true);
        try {
            const data = await clientService.getClients(userId);
            setClients(data);
        } catch (error) {
            console.error(error);
            toast.error('Erreur lors du chargement des clients');
        } finally {
            setIsLoading(false);
        }
    };

    const createClient = async (input: CreateClientInput) => {
        if (!currentUser) return;
        try {
            await clientService.createClient(currentUser.uid, input);
            toast.success('Client créé avec succès');
            fetchClients(currentUser.uid); // Simple refresh
        } catch (error) {
            console.error(error);
            toast.error('Erreur lors de la création du client');
            throw error;
        }
    };

    const updateClient = async (id: string, input: UpdateClientInput) => {
        if (!currentUser) return;
        try {
            await clientService.updateClient(currentUser.uid, id, input);
            toast.success('Client mis à jour');
            fetchClients(currentUser.uid);
        } catch (error) {
            console.error(error);
            toast.error('Erreur lors de la mise à jour');
            throw error;
        }
    };

    const deleteClient = async (client: Client) => {
        if (!currentUser) return;
        // Logic moved to component
        // if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) return;

        try {
            await clientService.deleteClient(currentUser.uid, client.id, client.logoUrl);
            toast.success('Client supprimé');
            fetchClients(currentUser.uid);
        } catch (error) {
            console.error(error);
            toast.error('Erreur lors de la suppression');
        }
    };

    return {
        clients,
        isLoading,
        createClient,
        updateClient,
        deleteClient
    };
};
