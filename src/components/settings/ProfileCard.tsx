import { User, Mail, Building } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

const ProfileCard = () => {
    const [formData, setFormData] = useState({
        name: 'Elouan Salmon',
        email: 'elouan.salmon@ekwateur.fr',
        company: 'Ekwateur'
    });

    const handleSave = () => {
        console.log('Saving profile...', formData);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-blue-500/10 dark:border-blue-500/20 p-6 shadow-lg shadow-blue-500/5 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300"
        >
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <div className="p-2 bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 rounded-lg border border-blue-500/20">
                    <User size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                Profil
            </h2>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Nom complet
                    </label>
                    <div className="relative">
                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500/70 dark:text-blue-400/70 pointer-events-none transition-all duration-300" />
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 bg-white/10 dark:bg-white/5 backdrop-blur-sm border-2 border-blue-500/30 dark:border-blue-500/40 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 shadow-lg shadow-blue-500/10 transition-all duration-300 hover:border-blue-500/40 dark:hover:border-blue-500/50"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Email
                    </label>
                    <div className="relative">
                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500/70 dark:text-blue-400/70 pointer-events-none transition-all duration-300" />
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 bg-white/10 dark:bg-white/5 backdrop-blur-sm border-2 border-blue-500/30 dark:border-blue-500/40 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 shadow-lg shadow-blue-500/10 transition-all duration-300 hover:border-blue-500/40 dark:hover:border-blue-500/50"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Entreprise
                    </label>
                    <div className="relative">
                        <Building size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500/70 dark:text-blue-400/70 pointer-events-none transition-all duration-300" />
                        <input
                            type="text"
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 bg-white/10 dark:bg-white/5 backdrop-blur-sm border-2 border-blue-500/30 dark:border-blue-500/40 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 shadow-lg shadow-blue-500/10 transition-all duration-300 hover:border-blue-500/40 dark:hover:border-blue-500/50"
                        />
                    </div>
                </div>

                <motion.button
                    onClick={handleSave}
                    className="w-full mt-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                >
                    Enregistrer les modifications
                </motion.button>
            </div>
        </motion.div>
    );
};

export default ProfileCard;
