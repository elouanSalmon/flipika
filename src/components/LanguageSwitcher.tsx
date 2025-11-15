import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
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
            className={`language-switcher__option ${
              language.code === i18n.language ? 'language-switcher__option--active' : ''
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