import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Globe } from 'lucide-react';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
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

    if (languageCode === 'fr') {
      // Go to French silo
      if (!newPath.startsWith('/fr')) {
        newPath = `/fr${newPath === '/' ? '' : newPath}`;
      }
    } else {
      // Go to English silo (Root)
      if (newPath.startsWith('/fr')) {
        newPath = newPath.substring(3) || '/';
      }
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