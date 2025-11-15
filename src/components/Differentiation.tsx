import React from 'react';
import { 
  Brain, 
  Target, 
  Database, 
  TrendingUp, 
  Zap, 
  Shield,
  CheckCircle,
  X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './Differentiation.css';

const Differentiation: React.FC = () => {
  const { t } = useTranslation();
  
  const scrollToEmailForm = () => {
    const emailSection = document.getElementById('email-capture');
    if (emailSection) {
      emailSection.scrollIntoView({ behavior: 'smooth' });
    }
  };



  const differentiators = [
    {
      icon: Brain,
      title: t('common:differentiation.notCopywritingTool.title'),
      subtitle: t('common:differentiation.notCopywritingTool.subtitle'),
      description: t('common:differentiation.notCopywritingTool.description'),
      color: "primary"
    },
    {
      icon: Target,
      title: t('common:differentiation.designedForMediaBuyers.title'),
      subtitle: t('common:differentiation.designedForMediaBuyers.subtitle'),
      description: t('common:differentiation.designedForMediaBuyers.description'),
      color: "secondary"
    },
    {
      icon: Database,
      title: t('common:differentiation.usesRealData.title'),
      subtitle: t('common:differentiation.usesRealData.subtitle'),
      description: t('common:differentiation.usesRealData.description'),
      color: "accent"
    },
    {
      icon: TrendingUp,
      title: t('common:differentiation.learnsAndImproves.title'),
      subtitle: t('common:differentiation.learnsAndImproves.subtitle'),
      description: t('common:differentiation.learnsAndImproves.description'),
      color: "warning"
    }
  ];

  const comparison = [
    {
      feature: t('common:differentiation.comparison.campaignManagement'),
      flipika: true,
      others: false
    },
    {
      feature: t('common:differentiation.comparison.realTimeOptimization'),
      flipika: true,
      others: false
    },
    {
      feature: t('common:differentiation.comparison.directGoogleAds'),
      flipika: true,
      others: false
    },
    {
      feature: t('common:differentiation.comparison.specializedAI'),
      flipika: true,
      others: false
    },
    {
      feature: t('common:differentiation.comparison.continuousLearning'),
      flipika: true,
      others: false
    },
    {
      feature: t('common:differentiation.comparison.genericText'),
      flipika: false,
      others: true
    }
  ];

  return (
    <section className="differentiation">
      {/* Background Elements */}
      <div className="differentiation-bg">
        <div className="differentiation-gradient"></div>
        <div className="differentiation-grid"></div>
      </div>
      
      <div className="differentiation-container">
        <div className="differentiation-content">
          {/* Header */}
          <div className="differentiation-header">
            <div className="diff-badge">
              <Shield size={16} />
              <span>{t('common:differentiation.title')}</span>
            </div>
            <h2 className="diff-title">
              {t('common:differentiation.subtitle')}
            </h2>
            <p className="diff-subtitle">
              {t('common:differentiation.description')}
            </p>
          </div>

          {/* Differentiators Grid */}
          <div className="differentiators-grid">
            {differentiators.map((diff) => (
              <div
                key={diff.title}
                className="differentiator-card"
              >
                <div className="diff-icon">
                  <diff.icon size={32} />
                </div>
                <div className="diff-content">
                  <h3 className="diff-card-title">{diff.title}</h3>
                  <p className="diff-card-subtitle">{diff.subtitle}</p>
                  <p className="diff-card-description">{diff.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="comparison-section">
            <div className="comparison-header">
              <h3>{t('common:differentiation.comparison.title')}</h3>
              <p>{t('common:differentiation.comparison.subtitle')}</p>
            </div>
            
            <div className="comparison-table">
              <div className="comparison-headers">
                <div className="feature-header">{t('common:differentiation.comparison.featureHeader')}</div>
                <div className="flipika-header">
                  <Zap size={20} />
                  <span>{t('common:differentiation.comparison.flipikaHeader')}</span>
                </div>
                <div className="others-header">{t('common:differentiation.comparison.othersHeader')}</div>
              </div>
              
              <div className="comparison-rows">
                {comparison.map((item) => (
                  <div
                    key={item.feature}
                    className="comparison-row"
                  >
                    <div className="feature-cell">{item.feature}</div>
                    <div className="flipika-cell">
                      {item.flipika ? (
                        <CheckCircle size={16} className="check-icon" />
                      ) : (
                        <X size={16} className="x-icon" />
                      )}
                    </div>
                    <div className="others-cell">
                      {item.others ? (
                        <CheckCircle size={16} className="check-icon" />
                      ) : (
                        <X size={16} className="x-icon" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="diff-cta">
            <div className="cta-content">
              <h3>{t('common:differentiation.cta')}</h3>
              <p>{t('common:differentiation.ctaSubtitle') || 'Discover why Media Buyers choose Flipika'}</p>
            </div>
            <button
              className="cta-button"
              onClick={scrollToEmailForm}
            >
              <span>{t('common:hero.cta')}</span>
              <TrendingUp size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Differentiation;