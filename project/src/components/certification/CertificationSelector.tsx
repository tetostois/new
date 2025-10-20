import React, { useState } from 'react';
import { Check, Clock, Users, Target, ArrowRight } from 'lucide-react';
// import { CertificationType } from '../../types';
// import { certificationTypes, getCertificationColor } from '../../data/certifications';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { CertificationType } from '../../types';
import { certificationTypes, getCertificationColor } from '../data/certifications';

interface CertificationSelectorProps {
  onSelect: (certification: CertificationType) => void;
  selectedCertification?: string;
}

export const CertificationSelector: React.FC<CertificationSelectorProps> = ({
  onSelect,
  selectedCertification
}) => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string; border: string; button: string }> = {
      green: {
        bg: 'bg-green-50',
        text: 'text-green-800',
        border: 'border-green-200',
        button: 'bg-green-600 hover:bg-green-700'
      },
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-800',
        border: 'border-blue-200',
        button: 'bg-blue-600 hover:bg-blue-700'
      },
      orange: {
        bg: 'bg-orange-50',
        text: 'text-orange-800',
        border: 'border-orange-200',
        button: 'bg-orange-600 hover:bg-orange-700'
      },
      purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-800',
        border: 'border-purple-200',
        button: 'bg-purple-600 hover:bg-purple-700'
      },
      indigo: {
        bg: 'bg-indigo-50',
        text: 'text-indigo-800',
        border: 'border-indigo-200',
        button: 'bg-indigo-600 hover:bg-indigo-700'
      },
      gray: {
        bg: 'bg-gray-50',
        text: 'text-gray-800',
        border: 'border-gray-200',
        button: 'bg-gray-600 hover:bg-gray-700'
      }
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Choisissez votre parcours de certification
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Sélectionnez la certification qui correspond à votre profil et à vos objectifs professionnels.
          Chaque certification comprend 3 modules spécialisés.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificationTypes.map((cert) => {
          const colors = getColorClasses(cert.color);
          const isExpanded = expandedCard === cert.id;
          const isSelected = selectedCertification === cert.id;

          return (
            <Card
              key={cert.id}
              className={`relative transition-all duration-300 hover:shadow-xl cursor-pointer ${
                isSelected ? `${colors.border} border-2 ${colors.bg}` : 'border border-gray-200'
              } ${isExpanded ? 'transform scale-105 z-10' : ''}`}
              onClick={() => setExpandedCard(isExpanded ? null : cert.id)}
            >
              {isSelected && (
                <div className={`absolute -top-2 -right-2 w-6 h-6 ${colors.button} rounded-full flex items-center justify-center`}>
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}

              <div className="mb-4">
                <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getCertificationColor(cert.color)} mb-3`}>
                  {cert.color === 'green' && '🟢'}
                  {cert.color === 'blue' && '🔵'}
                  {cert.color === 'orange' && '🟠'}
                  {cert.color === 'purple' && '🟣'}
                  {cert.color === 'indigo' && '🟤'}
                  {cert.color === 'gray' && '⚫'}
                  <span className="ml-2">Niveau {cert.id.includes('initiation') ? 'Débutant' : cert.id.includes('cadre') ? 'Intermédiaire' : 'Avancé'}</span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                  {cert.name}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {cert.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatPrice(cert.price)}
                  </div>
                  {cert.pricePerModule && (
                    <div className="text-sm text-gray-500">
                      ou {formatPrice(cert.pricePerModule)}/module
                    </div>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="space-y-4 mb-4">
                  <div className="flex items-start space-x-3">
                    <Users className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Public cible</p>
                      <p className="text-gray-600 text-sm">{cert.targetAudience}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Target className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Objectif</p>
                      <p className="text-gray-600 text-sm">{cert.objective}</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <p className="font-medium text-gray-900 text-sm mb-3">Modules inclus :</p>
                    <div className="space-y-2">
                      {cert.modules.map((module, index) => (
                        <div key={module.id} className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-full ${colors.button} text-white text-xs flex items-center justify-center font-bold`}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{module.name}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>60 min</span>
                              </span>
                              <span>20 questions</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(cert);
                }}
                className={`w-full ${colors.button} flex items-center justify-center space-x-2`}
              >
                <span>Choisir cette certification</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Card>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
        <h3 className="font-semibold text-blue-900 mb-3">📋 Structure des examens</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span className="text-blue-800">3 modules par certification</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span className="text-blue-800">20 questions par module</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span className="text-blue-800">60 minutes par module</span>
          </div>
        </div>
        <div className="mt-3 text-sm text-blue-700">
          <strong>⏰ Durée totale :</strong> 3 jours maximum pour compléter tous les modules après le démarrage
        </div>
      </div>
    </div>
  );
};