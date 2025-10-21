import React, { useState } from 'react';
import { CheckCircle, Clock, FileText, Award, Users, BookOpen, AlertCircle } from 'lucide-react';

interface ExamInformationProps {
  certification: string;
  onContinue: () => void;
  onBack: () => void;
}

const ExamInformation: React.FC<ExamInformationProps> = ({ certification, onContinue, onBack }) => {
  const [hasRead, setHasRead] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const certificationName = certification
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());

  const examSteps = [
    {
      icon: <BookOpen className="h-6 w-6 text-blue-600" />,
      title: "1. Sélection des Modules",
      description: "Choisissez les modules que vous souhaitez composer selon votre certification.",
      details: [
        "Chaque certification comprend 3 modules obligatoires",
        "La certification 'Initiation Pratique Générale' permet de choisir un seul module",
        "Vous pouvez composer les modules dans l'ordre de votre choix"
      ]
    },
    {
      icon: <FileText className="h-6 w-6 text-green-600" />,
      title: "2. Composition de l'Examen",
      description: "Composez votre examen module par module avec les questions fournies.",
      details: [
        "Chaque module contient des questions à choix multiples et des questions ouvertes",
        "Vous avez un temps limité pour chaque module",
        "Vos réponses sont sauvegardées automatiquement",
        "Vous pouvez revenir en arrière pour modifier vos réponses"
      ]
    },
    {
      icon: <Users className="h-6 w-6 text-purple-600" />,
      title: "3. Correction par un Examinateur",
      description: "Votre copie sera corrigée par un examinateur qualifié.",
      details: [
        "Un examinateur spécialisé dans votre domaine corrigera votre copie",
        "Chaque question sera notée individuellement",
        "Des commentaires détaillés seront fournis pour chaque réponse",
        "Le processus de correction peut prendre 3-5 jours ouvrés"
      ]
    },
    {
      icon: <Award className="h-6 w-6 text-yellow-600" />,
      title: "4. Résultats et Certification",
      description: "Recevez vos résultats et votre certificat de réussite.",
      details: [
        "Vous recevrez une note globale et par module",
        "Un certificat sera délivré si vous obtenez la note minimale requise",
        "Vous pourrez consulter les corrections détaillées",
        "Votre certificat sera disponible dans votre espace personnel"
      ]
    }
  ];

  const importantNotes = [
    {
      icon: <Clock className="h-5 w-5 text-orange-500" />,
      text: "Durée totale estimée : 2-4 heures selon la certification choisie"
    },
    {
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      text: "Assurez-vous d'avoir une connexion internet stable pendant l'examen"
    },
    {
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      text: "Vous pouvez interrompre et reprendre l'examen à tout moment"
    }
  ];

  const canContinue = hasRead && acceptedTerms;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Déroulement de l'Examen
          </h1>
          <p className="text-lg text-gray-600">
            Certification : <span className="font-semibold text-blue-600">{certificationName}</span>
          </p>
        </div>

        {/* Étapes de l'examen */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Les 4 étapes de votre parcours d'examen
          </h2>
          
          <div className="space-y-8">
            {examSteps.map((step, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {step.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 mb-3">
                    {step.description}
                  </p>
                  <ul className="space-y-1">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start space-x-2 text-sm text-gray-500">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes importantes */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-yellow-800 mb-4">
            ⚠️ Notes importantes
          </h3>
          <div className="space-y-3">
            {importantNotes.map((note, index) => (
              <div key={index} className="flex items-start space-x-3">
                {note.icon}
                <span className="text-yellow-700">{note.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Conditions d'acceptation */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Conditions d'acceptation
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="read-terms"
                checked={hasRead}
                onChange={(e) => setHasRead(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="read-terms" className="text-sm text-gray-700">
                J'ai lu et compris le déroulement de l'examen décrit ci-dessus
              </label>
            </div>
            
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="accept-terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="accept-terms" className="text-sm text-gray-700">
                J'accepte de respecter les règles et conditions de l'examen
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <button
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            ← Retour
          </button>
          
          <button
            onClick={onContinue}
            disabled={!canContinue}
            className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
              canContinue
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Commencer l'Examen →
          </button>
        </div>

        {!canContinue && (
          <p className="text-center text-sm text-gray-500 mt-4">
            Veuillez cocher les cases ci-dessus pour continuer
          </p>
        )}
      </div>
    </div>
  );
};

export default ExamInformation;


