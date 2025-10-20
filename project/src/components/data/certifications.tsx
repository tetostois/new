import { CertificationType } from "../../types";

export const certificationTypes: CertificationType[] = [
  {
    id: 'initiation-pratique',
    name: 'Certification d\'Initiation Pratique Générale',
    description: 'Acquérir les bases pratiques pour initier un projet entrepreneurial',
    price: 50000,
    pricePerModule: 25000,
    targetAudience: 'Élèves, étudiants ou toute personne souhaitant débuter une carrière entrepreneuriale en Afrique',
    objective: 'Acquérir les bases pratiques pour initier un projet entrepreneurial',
    color: 'green',
    isActive: true,
    modules: [
      {
        id: 'leadership-init',
        name: 'Module Leadership',
        description: 'Fondamentaux du leadership pour débutants',
        duration: 60,
        order: 1,
        questions: [] // Sera rempli dynamiquement
      },
      {
        id: 'competences-init',
        name: 'Module Compétences Professionnelles',
        description: 'Compétences de base pour le monde professionnel',
        duration: 60,
        order: 2,
        questions: []
      },
      {
        id: 'entrepreneuriat-init',
        name: 'Module Entrepreneuriat',
        description: 'Bases de l\'entrepreneuriat en Afrique',
        duration: 60,
        order: 3,
        questions: []
      }
    ]
  },
  {
    id: 'cadre-manager',
    name: 'Certification Cadre, Manager et Professionnel d\'entreprise',
    description: 'Maîtriser les réalités techniques, opérationnelles et stratégiques du fonctionnement d\'une entreprise',
    price: 150000,
    targetAudience: 'Professionnels souhaitant valider leur aptitude à exercer en entreprise en tant que cadre',
    objective: 'Maîtriser les réalités techniques, opérationnelles et stratégiques du fonctionnement d\'une entreprise, du niveau local au niveau international',
    color: 'blue',
    isActive: true,
    modules: [
      {
        id: 'leadership-cadre',
        name: 'Module Leadership',
        description: 'Leadership pour cadres et managers',
        duration: 60,
        order: 1,
        questions: []
      },
      {
        id: 'competences-cadre',
        name: 'Module Compétences Professionnelles',
        description: 'Compétences managériales avancées',
        duration: 60,
        order: 2,
        questions: []
      },
      {
        id: 'entrepreneuriat-cadre',
        name: 'Module Entrepreneuriat',
        description: 'Vision entrepreneuriale en entreprise',
        duration: 60,
        order: 3,
        questions: []
      }
    ]
  },
  {
    id: 'rentabilite-entrepreneuriale',
    name: 'Certification en Rentabilité Entrepreneuriale',
    description: 'Optimiser la rentabilité de l\'entreprise et diversifier les sources de revenus',
    price: 300000,
    targetAudience: 'Entrepreneurs déjà en activité',
    objective: 'Optimiser la rentabilité de l\'entreprise à chaque dépense et charge, diversifier les sources de revenus, et réduire les coûts de manière stratégique',
    color: 'orange',
    isActive: true,
    modules: [
      {
        id: 'leadership-rentabilite',
        name: 'Module Leadership',
        description: 'Leadership orienté performance et rentabilité',
        duration: 60,
        order: 1,
        questions: []
      },
      {
        id: 'competences-rentabilite',
        name: 'Module Compétences Professionnelles',
        description: 'Analyse financière et optimisation',
        duration: 60,
        order: 2,
        questions: []
      },
      {
        id: 'entrepreneuriat-rentabilite',
        name: 'Module Entrepreneuriat',
        description: 'Stratégies de rentabilité entrepreneuriale',
        duration: 60,
        order: 3,
        questions: []
      }
    ]
  },
  {
    id: 'dirigeant-africain',
    name: 'Certification Chef ou Dirigeant d\'Entreprise Locale Africaine',
    description: 'Assurer une gestion opérationnelle et stratégique durable dans un contexte local africain',
    price: 600000,
    targetAudience: 'Dirigeants de start-ups ou PME en Afrique',
    objective: 'Assurer une gestion opérationnelle et stratégique durable dans un contexte local africain',
    color: 'purple',
    isActive: true,
    modules: [
      {
        id: 'leadership-dirigeant',
        name: 'Module Leadership',
        description: 'Leadership stratégique en contexte africain',
        duration: 60,
        order: 1,
        questions: []
      },
      {
        id: 'competences-dirigeant',
        name: 'Module Compétences Professionnelles',
        description: 'Gestion d\'entreprise en Afrique',
        duration: 60,
        order: 2,
        questions: []
      },
      {
        id: 'entrepreneuriat-dirigeant',
        name: 'Module Entrepreneuriat',
        description: 'Entrepreneuriat et développement local',
        duration: 60,
        order: 3,
        questions: []
      }
    ]
  },
  {
    id: 'investisseur-africain',
    name: 'Certification Investisseur en Entreprises Africaines',
    description: 'Maîtriser l\'écosystème africain pour l\'investissement',
    price: 1500000,
    targetAudience: 'Investisseurs souhaitant comprendre l\'écosystème africain avant d\'y engager des capitaux',
    objective: 'Maîtriser les dimensions politiques, économiques, culturelles, juridiques et technologiques du marché africain, avec des méthodes de gestion adaptées',
    color: 'indigo',
    isActive: true,
    modules: [
      {
        id: 'leadership-investisseur',
        name: 'Module Leadership',
        description: 'Leadership pour investisseurs en Afrique',
        duration: 60,
        order: 1,
        questions: []
      },
      {
        id: 'competences-investisseur',
        name: 'Module Compétences Professionnelles',
        description: 'Analyse d\'investissement en contexte africain',
        duration: 60,
        order: 2,
        questions: []
      },
      {
        id: 'entrepreneuriat-investisseur',
        name: 'Module Entrepreneuriat',
        description: 'Écosystème entrepreneurial africain',
        duration: 60,
        order: 3,
        questions: []
      }
    ]
  },
  {
    id: 'ingenieries-specifiques',
    name: 'Certifications en Ingénieries Spécifiques',
    description: 'Technologies de traitement définitif pour des problématiques de masse',
    price: 400000,
    targetAudience: 'Professionnels spécialisés (médecine, criminalité, armée, administration, finance, etc.)',
    objective: 'Acquérir des technologies de traitement définitif pour des problématiques de masse, avec une approche de leadership et de performance',
    color: 'gray',
    isActive: true,
    modules: [
      {
        id: 'leadership-ingenierie',
        name: 'Module Leadership',
        description: 'Leadership technique et spécialisé',
        duration: 60,
        order: 1,
        questions: []
      },
      {
        id: 'competences-ingenierie',
        name: 'Module Compétences Professionnelles',
        description: 'Compétences techniques spécialisées',
        duration: 60,
        order: 2,
        questions: []
      },
      {
        id: 'entrepreneuriat-ingenierie',
        name: 'Module Entrepreneuriat',
        description: 'Innovation et entrepreneuriat technique',
        duration: 60,
        order: 3,
        questions: []
      }
    ]
  }
];

export const getCertificationById = (id: string): CertificationType | undefined => {
  return certificationTypes.find(cert => cert.id === id);
};

export const getCertificationColor = (color: string): string => {
  const colors: Record<string, string> = {
    green: 'bg-green-100 text-green-800 border-green-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200'
  };
  return colors[color] || colors.blue;
};