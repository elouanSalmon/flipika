import { Search, Filter, ArrowUpRight, MoreHorizontal } from 'lucide-react';

const Campaigns = () => {
    const campaigns = [
        { id: 1, name: "Search | Generic | SaaS", status: "Active", spend: "1,240 €", roas: "3.8x", clicks: "854" },
        { id: 2, name: "Display | Retargeting | Q1", status: "Active", spend: "850 €", roas: "4.2x", clicks: "620" },
        { id: 3, name: "Video | Brand Awareness", status: "Paused", spend: "2,100 €", roas: "1.5x", clicks: "3,400" },
        { id: 4, name: "Search | Competitors", status: "Active", spend: "430 €", roas: "2.1x", clicks: "120" },
        { id: 5, name: "PMax | All Products", status: "Learning", spend: "600 €", roas: "-", clicks: "450" },
    ];

    // Status badges aligned with connected design system

    return (
        <div>
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Campagnes</h2>
                    <p className="text-[var(--color-text-secondary)] text-sm">Gérez et analysez vos performances</p>
                </div>
                <div className="flex gap-3">
                    <button className="btn btn-secondary btn-sm gap-2">
                        <Filter size={16} />
                        Filtrer
                    </button>
                    <button className="btn btn-primary btn-sm gap-2">
                        <Search size={16} />
                        Rechercher
                    </button>
                </div>
            </div>

            {/* Glass Table Container */}
            <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table text-left">
                        <thead className="border-b border-[var(--color-border)]">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Nom de la campagne</th>
                                <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Statut</th>
                                <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Dépenses</th>
                                <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">ROAS</th>
                                <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Clics</th>
                                <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border)]">
                            {campaigns.map((campaign) => (
                                <tr key={campaign.id} className="hover:bg-[var(--glass-bg-hover)] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-[var(--color-text-primary)]">{campaign.name}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`status-badge ${campaign.status === 'Active' ? 'active' : campaign.status === 'Paused' ? 'paused' : 'learning'}`}>
                                            {campaign.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-[var(--color-text-secondary)] font-mono">
                                        {campaign.spend}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 font-medium text-green-600 dark:text-green-400">
                                            {campaign.roas}
                                            {campaign.roas !== '-' && <ArrowUpRight size={14} />}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-[var(--color-text-secondary)] font-mono">
                                        {campaign.clicks}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] transition-colors">
                                            <MoreHorizontal size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="p-4 border-t border-[var(--color-border)] flex items-center justify-between text-sm text-[var(--color-text-secondary)]">
                    <span>Affichage de 1 à 5 sur 12 campagnes</span>
                    <div className="flex gap-2">
                        <button className="btn btn-secondary btn-sm disabled:opacity-50" disabled>Précédent</button>
                        <button className="btn btn-secondary btn-sm">Suivant</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Campaigns;
