import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Pagination.css';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems?: number;
    itemsPerPage?: number;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    itemsPerPage
}) => {
    if (totalPages <= 1) return null;

    const renderPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages.map((page, index) => {
            if (page === '...') {
                return <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>;
            }
            return (
                <button
                    key={page}
                    className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                    onClick={() => onPageChange(page as number)}
                >
                    {page}
                </button>
            );
        });
    };

    const startItem = itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const endItem = itemsPerPage ? Math.min(currentPage * itemsPerPage, totalItems || 0) : 0;

    return (
        <div className="pagination-container">
            {totalItems !== undefined && itemsPerPage !== undefined && (
                <div className="pagination-info">
                    Affichage de {startItem} à {endItem} sur {totalItems} résultats
                </div>
            )}

            <div className="pagination-controls">
                <button
                    className="pagination-btn"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    title="Page précédente"
                >
                    <ChevronLeft size={18} />
                </button>

                <div className="pagination-numbers">
                    {renderPageNumbers()}
                </div>

                <button
                    className="pagination-btn"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    title="Page suivante"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
