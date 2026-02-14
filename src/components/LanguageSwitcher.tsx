import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Globe } from 'lucide-react';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    const isApp = location.pathname.startsWith('/app');

    if (isApp) {
      // For app routes, just change the state
      i18n.changeLanguage(languageCode);
      return;
    }

    // For public routes, change the URL silo
    let newPath = location.pathname;

    // Remove existing language prefix if any
    const prefixes = ['/fr', '/es'];
    for (const prefix of prefixes) {
      if (newPath.startsWith(prefix)) {
        newPath = newPath.substring(prefix.length) || '/';
        break;
      }
    }

    // Add new prefix if not English
    if (languageCode !== 'en') {
      newPath = `/${languageCode}${newPath === '/' ? '' : newPath}`;
    }

    i18n.changeLanguage(languageCode);
    navigate(newPath);
  };

  return (
    <div className="language-switcher">
      <div className="language-switcher__current">
        <Globe size={16} />
        <span>{currentLanguage.flag} {currentLanguage.name}</span>
      </div>
      <div className="language-switcher__dropdown">
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`language-switcher__option ${language.code === i18n.language ? 'language-switcher__option--active' : ''
              }`}
          >
            {language.flag} {language.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;