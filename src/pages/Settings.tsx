import { useState, useEffect } from 'react';
import { Moon, Sun, LogOut, User, Shield, Link as LinkIcon, Palette, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useDemoMode } from '../contexts/DemoModeContext';
import { useNavigate } from 'react-router-dom';

const Settings = () => {

    {/* Notifications Section */ }
    <div className="card bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700">
        <div className="p-6">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <Bell size={24} className="text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                    <h2 className="text-lg font-bold mb-1">Notifications</h2>
                    <p className="text-gray-500 text-sm mb-4">
                        Configurez vos préférences de notifications
                    </p>
                    <button className="btn btn-ghost text-sm" disabled>
                        Gérer les notifications
                    </button>
                </div>
            </div>
        </div>
    </div>

    {/* API Section */ }
    <div className="card bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700">
        <div className="p-6">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                    <Key size={24} className="text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                    <h2 className="text-lg font-bold mb-1">API & Intégrations</h2>
                    <p className="text-gray-500 text-sm mb-4">
                        Gérez vos connexions et clés API
                    </p>
                    <button className="btn btn-ghost text-sm" disabled>
                        Gérer les intégrations
                    </button>
                </div>
            </div>
        </div>
    </div>
        </div >
    );
};

export default Settings;
