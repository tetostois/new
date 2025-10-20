import React, { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle, User, Star, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ExaminerService, ExaminerSubmission, SubmissionDetails } from '../services/examinerService';


export const ExaminerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionDetails | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [submissionsError, setSubmissionsError] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<{ [key: string]: ExaminerSubmission[] }>({});
  const [loadingStats, setLoadingStats] = useState(false);
  const [stats, setStats] = useState({
    total_assigned: 0,
    pending: 0,
    graded: 0,
    average_score: 0
  });
  
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    specialization: user?.specialization || '',
    experience: user?.experience || ''
  });
  
  const [supportForm, setSupportForm] = useState({
    subject: '',
    message: ''
  });

  // Charger les soumissions depuis l'API
  const loadSubmissions = async () => {
    try {
      setLoadingSubmissions(true);
      setSubmissionsError(null);
      
      const response = await ExaminerService.getSubmissions({
        status: statusFilter === 'all' ? undefined : statusFilter
      });
      
      if (response.success) {
        // Grouper les soumissions par candidat
        const groupedSubmissions = groupSubmissionsByCandidate(response.submissions);
        setSubmissions(groupedSubmissions);
      } else {
        setSubmissionsError('Erreur lors du chargement des soumissions');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des soumissions:', error);
      setSubmissionsError('Erreur lors du chargement des soumissions');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // Grouper les soumissions par candidat et certification
  const groupSubmissionsByCandidate = (submissions: ExaminerSubmission[]) => {
    const grouped: { [key: string]: ExaminerSubmission[] } = {};
    
    submissions.forEach(submission => {
      // Utiliser candidate_id comme clé pour grouper par candidat
      const candidateKey = submission.candidate_id;
      
      if (!grouped[candidateKey]) {
        grouped[candidateKey] = [];
      }
      grouped[candidateKey].push(submission);
    });
    
    return grouped;
  };

  // Charger les statistiques
  const loadStats = async () => {
    try {
      setLoadingStats(true);
      const response = await ExaminerService.getStats();
      
      if (response.success) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  // Charger les détails d'une soumission
  const loadSubmissionDetails = async (submissionId: string) => {
    try {
      const response = await ExaminerService.getSubmission(submissionId);
      
      if (response.success) {
        setSelectedSubmission(response.submission);
        
        // Initialiser les scores et feedback
        const initialScores: Record<string, number> = {};
        const initialFeedback: Record<string, string> = {};
        
        if (response.submission.questions_details && Array.isArray(response.submission.questions_details)) {
          response.submission.questions_details.forEach((qa: any) => {
            if (qa.question_id) {
              initialScores[qa.question_id] = 0;
              initialFeedback[qa.question_id] = '';
            }
          });
        }
        
        setScores(initialScores);
        setFeedback(initialFeedback);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des détails de la soumission:', error);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    loadSubmissions();
    loadStats();
  }, []);

  // Recharger quand le filtre change
  useEffect(() => {
    loadSubmissions();
  }, [statusFilter]);

  // Calculer les statistiques à partir des soumissions groupées
  const allSubmissions = Object.values(submissions).flat();
  const correctedSubmissions = allSubmissions.filter(s => s.status === 'graded');

  const handleScoreChange = (questionId: string, score: number) => {
    setScores(prev => ({ ...prev, [questionId]: score }));
  };

  const handleFeedbackChange = (questionId: string, text: string) => {
    setFeedback(prev => ({ ...prev, [questionId]: text }));
  };

  const handleSubmitCorrection = async () => {
    if (!selectedSubmission) return;

    try {
      const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
      
      // Préparer les données de notation
      const grades = Object.entries(scores).map(([questionId, score]) => ({
        question_id: questionId,
        score: score,
        feedback: feedback[questionId] || ''
      }));

      const response = await ExaminerService.gradeSubmission(
        selectedSubmission.id.toString(),
        grades,
        'Correction terminée',
        totalScore
      );

      if (response.success) {
        // Recharger les soumissions et les statistiques
        await loadSubmissions();
        await loadStats();

    setSelectedSubmission(null);
    setScores({});
    setFeedback({});
        
        alert('Correction soumise avec succès !');
      } else {
        alert('Erreur lors de la soumission de la correction');
      }
    } catch (error) {
      console.error('Erreur lors de la soumission de la correction:', error);
      alert('Erreur lors de la soumission de la correction');
    }
  };
  
  const saveProfile = () => {
    console.log('Profil examinateur mis à jour:', profileForm);
    alert('Profil mis à jour avec succès !');
    setShowProfileModal(false);
  };
  
  const sendSupportMessage = () => {
    if (!supportForm.subject || !supportForm.message) {
      alert('Veuillez remplir tous les champs');
      return;
    }
    console.log('Message de support envoyé:', supportForm);
    alert('Votre message a été envoyé à l\'administration !');
    setSupportForm({ subject: '', message: '' });
    setShowSupportModal(false);
  };
  
  const exportCorrections = () => {
    console.log('Export des corrections...');
    alert('Export des corrections en cours...');
  };
  
  // Filtrer les soumissions groupées par candidat
  const filteredSubmissionsByCandidate = Object.entries(submissions).map(([candidateId, candidateSubmissions]) => {
    const filtered = candidateSubmissions.filter(submission => {
      const candidateName = submission.candidate_name || '';
      const candidateEmail = submission.candidate_email || '';
      const matchesSearch = candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           candidateEmail.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    
    return { candidateId, submissions: filtered };
  }).filter(candidate => candidate.submissions.length > 0);

  // Noms des modules pour l'affichage
  const moduleNames: { [key: string]: string } = {
    'leadership': 'Leadership',
    'competences_professionnelles': 'Compétences Professionnelles',
    'entrepreneuriat': 'Entrepreneuriat'
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date non disponible';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Date invalide';
      }
      
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
      }).format(date);
    } catch (error) {
      return 'Date invalide';
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Examinateur
          </h1>
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowStatsModal(true)}
              >
                Mes statistiques
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowProfileModal(true)}
              >
                Mon profil
              </Button>
              <Button
                variant="secondary"
                onClick={exportCorrections}
              >
                Exporter
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowSupportModal(true)}
              >
                Support
              </Button>
            </div>
          </div>
          <p className="text-gray-600 mt-2">
            Gérez les corrections des examens qui vous sont attribués
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">En attente</h3>
                <p className="text-2xl font-bold text-orange-600">
                  {loadingStats ? <Loader2 className="h-5 w-5 animate-spin" /> : (stats?.pending || 0)}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Corrigés</h3>
                <p className="text-2xl font-bold text-green-600">
                  {loadingStats ? <Loader2 className="h-5 w-5 animate-spin" /> : (stats?.graded || 0)}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Total</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {loadingStats ? <Loader2 className="h-5 w-5 animate-spin" /> : (stats?.total_assigned || 0)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submissions List */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900 mb-4">Corrections en attente</h3>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Tous</option>
                    <option value="under_review">En attente</option>
                    <option value="graded">Corrigés</option>
                  </select>
                </div>
              </div>
              
              {loadingSubmissions ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : submissionsError ? (
                <div className="flex items-center justify-center py-8 text-red-600">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {submissionsError}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSubmissionsByCandidate.map(({ candidateId, submissions: candidateSubmissions }) => {
                    const firstSubmission = candidateSubmissions[0];
                    const pendingSubmissions = candidateSubmissions.filter(s => s.status === 'under_review');
                    
                    if (pendingSubmissions.length === 0) return null;
                    
                    return (
                      <div key={candidateId} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {firstSubmission.candidate_name || 'Candidat inconnu'}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {firstSubmission.candidate_email || ''}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">
                              {formatDate(firstSubmission.submitted_at || '')}
                            </p>
                            <span className="text-xs text-blue-600">
                              {candidateSubmissions.length} module(s)
                            </span>
                          </div>
                        </div>
                        
                        {/* Afficher les modules de ce candidat */}
                        <div className="space-y-2">
                          {candidateSubmissions.map(submission => {
                            // Extraire le module de l'exam_id
                            const moduleMatch = submission.exam_id.match(/exam-.*?-(.*?)$/);
                            const moduleId = moduleMatch ? moduleMatch[1] : 'unknown';
                            
                            return (
                              <div
                                key={submission.id}
                                className={`p-2 border rounded cursor-pointer transition-colors ${
                                  selectedSubmission?.id === submission.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => loadSubmissionDetails(submission.id.toString())}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <User className="h-4 w-4 text-gray-400" />
                                    <div>
                                      <p className="font-medium text-gray-900 text-sm">
                                        {moduleNames[moduleId] || moduleId}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        Status: {submission.status === 'under_review' ? 'En attente' : 'Corrigé'}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                      submission.status === 'under_review' 
                                        ? 'bg-orange-100 text-orange-800' 
                                        : 'bg-green-100 text-green-800'
                                    }`}>
                                      {submission.status === 'under_review' ? 'À corriger' : 'Corrigé'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  {filteredSubmissionsByCandidate.length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      Aucune correction en attente
                    </p>
                  )}
                </div>
              )}
            </Card>

            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Récemment corrigés</h3>
              <div className="space-y-4">
                {filteredSubmissionsByCandidate.map(({ candidateId, submissions: candidateSubmissions }) => {
                  const gradedSubmissions = candidateSubmissions.filter(s => s.status === 'graded');
                  if (gradedSubmissions.length === 0) return null;
                  
                  const firstSubmission = candidateSubmissions[0];
                  
                  return (
                    <div key={candidateId} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-700 text-sm">
                          {firstSubmission.candidate_name || 'Candidat inconnu'}
                        </h4>
                        <span className="text-xs text-green-600">
                          {gradedSubmissions.length}/3 modules corrigés
                        </span>
                      </div>
                      <div className="space-y-1">
                        {gradedSubmissions.map(submission => {
                          const moduleMatch = submission.exam_id.match(/exam-.*?-(.*?)$/);
                          const moduleId = moduleMatch ? moduleMatch[1] : 'unknown';
                          
                          return (
                            <div
                              key={submission.id}
                              className="p-2 border border-gray-100 rounded flex items-center justify-between"
                            >
                              <div>
                                <p className="font-medium text-gray-900 text-xs">
                                  {moduleNames[moduleId] || moduleId}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatDate(submission.submitted_at || '')}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Star className="h-3 w-3 text-yellow-500" />
                                <span className="font-bold text-green-600 text-xs">
                                  {submission.total_score || 0}/100
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                {correctedSubmissions.length === 0 && (
                  <p className="text-gray-500 text-center py-4 text-sm">
                    Aucune correction terminée
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Correction Interface */}
          <div className="lg:col-span-2">
            {selectedSubmission ? (
              <Card>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Correction de l'examen
                    </h3>
                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                      En cours
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Candidat :</span>
                      <span className="ml-2 font-medium">{selectedSubmission.candidate?.first_name} {selectedSubmission.candidate?.last_name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Email :</span>
                      <span className="ml-2 font-medium">{selectedSubmission.candidate?.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Soumis le :</span>
                      <span className="ml-2 font-medium">{formatDate(selectedSubmission.submitted_at || '')}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Questions :</span>
                      <span className="ml-2 font-medium">{selectedSubmission.questions_details?.length || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 mb-6">
                  {selectedSubmission.questions_details?.map((qa: any, index: number) => (
                    <div key={qa.question_id} className="border border-gray-200 rounded-lg p-4">
                      <div className="mb-3">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Question {index + 1} ({qa.points_possible} points)
                        </h4>
                        <p className="text-gray-700 text-sm mb-3">{qa.question_text}</p>
                        
                        {/* Instructions supplémentaires */}
                        {qa.instructions && (
                          <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                            <p className="text-sm text-blue-800">
                              <strong>Instructions :</strong> {qa.instructions}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="mb-4">
                        <h5 className="font-medium text-gray-800 mb-2">Réponse du candidat :</h5>
                        <div className="bg-gray-50 p-3 rounded border">
                          <p className="text-gray-900">{qa.candidate_answer}</p>
                        </div>
                      </div>

                      {/* Réponse de référence pour l'examinateur */}
                      {qa.reference_answer && (
                        <div className="mb-4">
                          <h5 className="font-medium text-gray-800 mb-2">Réponse de référence :</h5>
                          <div className="bg-green-50 p-3 rounded border border-green-200">
                            <p className="text-gray-900 text-sm">{qa.reference_answer}</p>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Score attribué
                          </label>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              min="0"
                              max={qa.points_possible}
                              value={scores[qa.question_id] || ''}
                              onChange={(e) => handleScoreChange(qa.question_id, parseInt(e.target.value) || 0)}
                              className="w-20"
                            />
                            <span className="text-gray-600">/ {qa.points_possible}</span>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Commentaire (optionnel)
                          </label>
                          <Input
                            value={feedback[qa.question_id] || ''}
                            onChange={(e) => handleFeedbackChange(qa.question_id, e.target.value)}
                            placeholder="Commentaire sur la réponse..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="text-lg font-medium text-gray-900">Score total :</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {Object.values(scores).reduce((sum, score) => sum + score, 0)} / {selectedSubmission.questions_details?.reduce((sum: number, qa: any) => sum + qa.points_possible, 0) || 0}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button
                      variant="secondary"
                      onClick={() => setSelectedSubmission(null)}
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={handleSubmitCorrection}
                      disabled={selectedSubmission.questions_details?.some((qa: any) => scores[qa.question_id] === undefined) || false}
                      className="flex items-center space-x-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Valider la correction</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun examen sélectionné
                </h3>
                <p className="text-gray-600">
                  Sélectionnez un examen en attente de correction pour commencer
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Stats Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">Mes Statistiques</h3>
              <button 
                onClick={() => setShowStatsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{stats?.total_assigned || 0}</div>
                  <div className="text-sm text-gray-600">Examens assignés</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{stats?.graded || 0}</div>
                  <div className="text-sm text-gray-600">Examens corrigés</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{stats?.pending || 0}</div>
                  <div className="text-sm text-gray-600">En attente</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{stats?.average_score || 0}%</div>
                  <div className="text-sm text-gray-600">Score moyen</div>
                </div>
              </div>
              
              <div className="mt-6">
                <Button onClick={() => setShowStatsModal(false)} className="w-full">
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">Mon Profil</h3>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Prénom"
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})}
                />
                <Input
                  label="Nom"
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})}
                />
                <Input
                  label="Email"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                />
                <Input
                  label="Téléphone"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                />
                <Input
                  label="Spécialisation"
                  value={profileForm.specialization}
                  onChange={(e) => setProfileForm({...profileForm, specialization: e.target.value})}
                />
                <Input
                  label="Expérience"
                  value={profileForm.experience}
                  onChange={(e) => setProfileForm({...profileForm, experience: e.target.value})}
                />
              </div>
              
              <div className="flex space-x-3 mt-6">
                <Button variant="secondary" onClick={() => setShowProfileModal(false)} className="flex-1">
                  Annuler
                </Button>
                <Button onClick={saveProfile} className="flex-1">
                  Sauvegarder
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">Contacter l'Administration</h3>
              <button 
                onClick={() => setShowSupportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
                  <select
                    value={supportForm.subject}
                    onChange={(e) => setSupportForm({...supportForm, subject: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner un sujet</option>
                    <option value="technical">Problème technique</option>
                    <option value="exam">Question sur un examen</option>
                    <option value="schedule">Planification</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    value={supportForm.message}
                    onChange={(e) => setSupportForm({...supportForm, message: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={4}
                    placeholder="Décrivez votre problème ou votre question..."
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <Button variant="secondary" onClick={() => setShowSupportModal(false)} className="flex-1">
                  Annuler
                </Button>
                <Button onClick={sendSupportMessage} className="flex-1">
                  Envoyer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};