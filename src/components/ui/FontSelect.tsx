import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronDown, Check, Loader2, X } from 'lucide-react';
import {
    GOOGLE_FONTS,
    searchFonts,
    getFontFamilyString,
    extractFontFamily,
    type GoogleFont,
} from '../../data/googleFonts';
import { loadSingleFont, isFontAvailable } from '../../hooks/useFontLoader';
import { useTranslation } from 'react-i18next';
import './FontSelect.css';

interface FontSelectProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

type CategoryKey = GoogleFont['category'] | 'all';

const CATEGORY_LABELS: Record<CategoryKey, string> = {
    all: 'All Fonts',
    'sans-serif': 'Sans Serif',
    serif: 'Serif',
    display: 'Display',
    handwriting: 'Handwriting',
    monospace: 'Monospace',
};

const CATEGORY_ORDER: CategoryKey[] = ['all', 'sans-serif', 'serif', 'display', 'monospace'];

/**
 * FontSelect - A searchable combobox for selecting Google Fonts
 *
 * Features:
 * - Real-time search with fuzzy matching
 * - Category filtering (Sans-Serif, Serif, Display, etc.)
 * - Live font preview in dropdown
 * - Lazy font loading (only loads fonts when hovered/selected)
 * - Loading states for fonts being fetched
 * - Keyboard navigation support
 */
export const FontSelect: React.FC<FontSelectProps> = ({
    value,
    onChange,
    label,
    placeholder = 'Select a font...',
    disabled = false,
    className = '',
}) => {
    const { t } = useTranslation('themes');

    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('all');
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const [loadingFonts, setLoadingFonts] = useState<Set<string>>(new Set());
    const [loadedPreviewFonts, setLoadedPreviewFonts] = useState<Set<string>>(new Set());

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Extract current font name from value (e.g., '"Inter", sans-serif' -> 'Inter')
    const currentFontName = useMemo(() => extractFontFamily(value), [value]);

    // Filter fonts based on search and category
    const filteredFonts = useMemo(() => {
        let fonts = searchQuery ? searchFonts(searchQuery) : [...GOOGLE_FONTS];

        if (selectedCategory !== 'all') {
            fonts = fonts.filter(font => font.category === selectedCategory);
        }

        return fonts.sort((a, b) => b.popularity - a.popularity);
    }, [searchQuery, selectedCategory]);

    // Handle font selection
    const handleSelectFont = useCallback((font: GoogleFont) => {
        const fontFamilyString = getFontFamilyString(font);
        onChange(fontFamilyString);
        setIsOpen(false);
        setSearchQuery('');

        // Ensure the font is loaded
        loadSingleFont(font.family);
    }, [onChange]);

    // Preload font for preview on hover
    const handleFontHover = useCallback(async (font: GoogleFont) => {
        if (loadedPreviewFonts.has(font.family) || isFontAvailable(font.family)) {
            return;
        }

        setLoadingFonts(prev => new Set(prev).add(font.family));

        try {
            await loadSingleFont(font.family);
            setLoadedPreviewFonts(prev => new Set(prev).add(font.family));
        } finally {
            setLoadingFonts(prev => {
                const next = new Set(prev);
                next.delete(font.family);
                return next;
            });
        }
    }, [loadedPreviewFonts]);

    // Keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                e.preventDefault();
                setIsOpen(true);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev < filteredFonts.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (filteredFonts[highlightedIndex]) {
                    handleSelectFont(filteredFonts[highlightedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setIsOpen(false);
                setSearchQuery('');
                break;
            case 'Tab':
                setIsOpen(false);
                setSearchQuery('');
                break;
        }
    }, [isOpen, highlightedIndex, filteredFonts, handleSelectFont]);

    // Reset highlight when search changes
    useEffect(() => {
        setHighlightedIndex(0);
    }, [searchQuery, selectedCategory]);

    // Scroll highlighted item into view
    useEffect(() => {
        if (isOpen && listRef.current) {
            const highlightedElement = listRef.current.querySelector(
                `[data-index="${highlightedIndex}"]`
            );
            if (highlightedElement) {
                highlightedElement.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [highlightedIndex, isOpen]);

    // Focus input when dropdown opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node) &&
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
                setSearchQuery('');
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    // Calculate dropdown position
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

    useEffect(() => {
        if (isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const dropdownHeight = 400; // Approximate max height

            // Determine if dropdown should open above or below
            const spaceBelow = viewportHeight - rect.bottom;
            const openAbove = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

            setDropdownPosition({
                top: openAbove ? rect.top - dropdownHeight - 4 : rect.bottom + 4,
                left: rect.left,
                width: Math.max(rect.width, 320),
            });
        }
    }, [isOpen]);

    // Load current font if not already loaded
    useEffect(() => {
        if (currentFontName && !isFontAvailable(currentFontName)) {
            loadSingleFont(currentFontName);
        }
    }, [currentFontName]);

    const renderDropdown = () => {
        if (!isOpen) return null;

        return createPortal(
            <div
                ref={dropdownRef}
                className="font-select-dropdown"
                style={{
                    position: 'fixed',
                    top: dropdownPosition.top,
                    left: dropdownPosition.left,
                    width: dropdownPosition.width,
                    zIndex: 9999,
                }}
            >
                {/* Search Input */}
                <div className="font-select-search">
                    <Search size={16} className="font-select-search-icon" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('editor.fontSearchPlaceholder') || 'Search fonts...'}
                        className="font-select-search-input"
                        onKeyDown={handleKeyDown}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="font-select-search-clear"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Category Tabs */}
                <div className="font-select-categories">
                    {CATEGORY_ORDER.map(category => (
                        <button
                            key={category}
                            className={`font-select-category ${selectedCategory === category ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(category)}
                        >
                            {CATEGORY_LABELS[category]}
                        </button>
                    ))}
                </div>

                {/* Font List */}
                <div ref={listRef} className="font-select-list">
                    {filteredFonts.length === 0 ? (
                        <div className="font-select-empty">
                            {t('editor.noFontsFound') || 'No fonts found'}
                        </div>
                    ) : (
                        filteredFonts.map((font, index) => {
                            const isSelected = currentFontName === font.family;
                            const isHighlighted = index === highlightedIndex;
                            const isLoading = loadingFonts.has(font.family);

                            return (
                                <button
                                    key={font.family}
                                    data-index={index}
                                    className={`font-select-option ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''}`}
                                    onClick={() => handleSelectFont(font)}
                                    onMouseEnter={() => {
                                        setHighlightedIndex(index);
                                        handleFontHover(font);
                                    }}
                                >
                                    <span
                                        className="font-select-option-name"
                                        style={{ fontFamily: `"${font.family}", ${font.fallback}` }}
                                    >
                                        {font.family}
                                    </span>
                                    <span className="font-select-option-category">
                                        {font.category}
                                    </span>
                                    {isLoading && (
                                        <Loader2 size={14} className="font-select-option-loading animate-spin" />
                                    )}
                                    {isSelected && !isLoading && (
                                        <Check size={16} className="font-select-option-check" />
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Footer with count */}
                <div className="font-select-footer">
                    {filteredFonts.length} {filteredFonts.length === 1 ? 'font' : 'fonts'}
                </div>
            </div>,
            document.body
        );
    };

    return (
        <div
            ref={containerRef}
            className={`font-select ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''} ${className}`}
        >
            {label && <label className="font-select-label">{label}</label>}

            <button
                type="button"
                className="font-select-trigger"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <span
                    className="font-select-value"
                    style={currentFontName ? { fontFamily: value } : undefined}
                >
                    {currentFontName || placeholder}
                </span>
                <ChevronDown
                    size={18}
                    className={`font-select-chevron ${isOpen ? 'rotated' : ''}`}
                />
            </button>

            {renderDropdown()}
        </div>
    );
};

export default FontSelect;
