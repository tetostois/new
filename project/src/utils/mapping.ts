// Mapping utilitaires entre schémas backend et frontend

import { Question } from '../types';

type BackendQuestionType = 'qcm' | 'free_text';

interface BackendQuestion {
  id: number | string;
  question_type: BackendQuestionType;
  question_text: string;
  answer_options?: string[] | null;
  points: number;
  // champs additionnels ignorés si présents
  [key: string]: unknown;
}

export function mapBackendQuestionToFrontend(q: BackendQuestion): Question {
  const type: Question['type'] = q.question_type === 'qcm' ? 'multiple-choice' : 'text';
  return {
    id: String(q.id),
    text: q.question_text,
    type,
    options: Array.isArray(q.answer_options) ? q.answer_options : undefined,
    points: Number(q.points ?? 1),
    category: 'exam',
  };
}

export function mapBackendQuestionsToFrontend(list: BackendQuestion[]): Question[] {
  return (list || []).map(mapBackendQuestionToFrontend);
}


// Mapping des identifiants frontend -> slugs backend
const certificationSlugMap: Record<string, string> = {
  // Exemple: UI id -> backend slug
  'initiation-pratique': 'initiation_pratique_generale',
  'cadre-manager': 'cadre_manager_professionnel',
  'rentabilite-entrepreneuriale': 'rentabilite_entrepreneuriale',
  'chef-dirigeant-entreprise-africaine': 'chef_dirigeant_entreprise_africaine',
  'investisseur-entreprises-africaines': 'investisseur_entreprises_africaines',
  'ingenieries-specifiques': 'ingenieries_specifiques',
};

const moduleSlugMap: Record<string, string> = {
  // Exemple: UI id -> backend slug
  'leadership-init': 'leadership',
  'competences-init': 'competences_professionnelles',
  'entrepreneuriat-init': 'entrepreneuriat',
  // variantes sans suffixe
  'leadership': 'leadership',
  'competences': 'competences_professionnelles',
  'entrepreneuriat': 'entrepreneuriat',
};

export function mapCertificationToBackendSlug(frontendId: string): string {
  if (!frontendId) return frontendId;
  if (certificationSlugMap[frontendId]) return certificationSlugMap[frontendId];
  const id = frontendId.toLowerCase();
  if (id.includes('initiation')) return 'initiation_pratique_generale';
  if (id.includes('cadre') || id.includes('manager')) return 'cadre_manager_professionnel';
  if (id.includes('rentabil')) return 'rentabilite_entrepreneuriale';
  if (id.includes('chef') || id.includes('dirigeant')) return 'chef_dirigeant_entreprise_africaine';
  if (id.includes('investisseur')) return 'investisseur_entreprises_africaines';
  if (id.includes('ingenier')) return 'ingenieries_specifiques';
  return frontendId;
}

export function mapModuleToBackendSlug(frontendId: string): string {
  if (!frontendId) return frontendId;
  if (moduleSlugMap[frontendId]) return moduleSlugMap[frontendId];
  const id = frontendId.toLowerCase();
  if (id.includes('leader')) return 'leadership';
  if (id.includes('compet')) return 'competences_professionnelles';
  if (id.includes('entrepren')) return 'entrepreneuriat';
  return frontendId;
}


