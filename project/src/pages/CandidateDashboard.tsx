import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, CreditCard, FileText, BookOpen, AlertCircle, Download, Play } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useExam } from '../contexts/ExamContext';
import { CertificationSelector } from '../components/certification/CertificationSelector';
import { ModuleProgress } from '../components/certification/ModuleProgress';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PaymentForm } from '../components/payment/PaymentForm';
import { Input } from '../components/ui/Input';
import { getCertificationById } from '../components/data/certifications';
import { ResultsService } from '../services/resultsService';
import apiRequest, { API_BASE_URL } from '../config/api';


export const CandidateDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, getToken } = useAuth();
  const { startModule, isExamActive } = useExam();
  const [showPayment, setShowPayment] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(user?.hasPaid || false);
  const [showExamInstructions, setShowExamInstructions] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showCertificationSelector, setShowCertificationSelector] = useState(!user?.selectedCertification);
  const [selectedCertification, setSelectedCertification] = useState(user?.selectedCertification);
  const [selectedPaymentType, setSelectedPaymentType] = useState<'full' | 'per-module'>('full');
  const [selectedModuleForPayment, setSelectedModuleForPayment] = useState<string>('');
  
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    profession: user?.profession || '',
    selectedCertification: user?.selectedCertification || ''
  });
  
  const [supportForm, setSupportForm] = useState({
    subject: '',
    message: ''
  });
  const [modulesCompletedCount, setModulesCompletedCount] = useState(0);
  const [myCertificates, setMyCertificates] = useState<Array<{ candidate_id: string; candidate_name: string; certification_type: string; url: string; sent_at?: string }>>([]);
  const [resultsData, setResultsData] = useState<any>(null);


  if (!user) return null;

  const currentCertification = selectedCertification ? getCertificationById(selectedCertification) : null;

  const handlePaymentSuccess = async () => {
    setPaymentCompleted(true);
    setShowPayment(false);
    // Mise à jour du statut utilisateur
    user.hasPaid = true;
    // Persister le paiement côté serveur (flux simulé)
    try {
      await apiRequest('/candidate/mark-paid', 'POST');
      try {
        const saved = localStorage.getItem('user');
        if (saved) {
          const parsed = JSON.parse(saved);
          parsed.hasPaid = true;
          localStorage.setItem('user', JSON.stringify(parsed));
        }
      } catch {}
    } catch (e) {
      console.warn('Impossible de persister le paiement côté serveur:', e);
    }
    // Si paiement complet, supprimer toute restriction de module payé seul
    try {
      if (selectedCertification) {
        localStorage.removeItem(`perModulePaid:${selectedCertification}`);
      }
    } catch {}
    // Rediriger vers les conditions d'examen avant la sélection des modules
    if (selectedCertification) {
      navigate(`/exam-conditions?cert=${encodeURIComponent(selectedCertification)}`);
    } else {
      navigate('/exam-conditions');
    }
  };

  const handleCertificationSelect = async (certification: any) => {
    // Interdire la modification une fois le paiement effectué
    if (paymentCompleted) {
      alert("Vous avez déjà réglé la certification. La modification n'est plus autorisée.");
      setShowCertificationSelector(false);
      return;
    }
    // Réinitialiser tout paiement par module précédent pour cette certification
    try {
      if (certification?.id) {
        localStorage.removeItem(`perModulePaid:${certification.id}`);
      }
    } catch {}
    // Persister côté serveur la certification
    try {
      await apiRequest('/candidate/certification', 'PUT', {
        selected_certification: certification.id
      });
      setSelectedCertification(certification.id);
      user.selectedCertification = certification.id;
      try {
        const saved = localStorage.getItem('user');
        if (saved) {
          const parsed = JSON.parse(saved);
          parsed.selectedCertification = certification.id;
          localStorage.setItem('user', JSON.stringify(parsed));
        }
      } catch {}
    } catch (e) {
      alert("Impossible d'enregistrer la certification. Réessayez.");
      return;
    } finally {
      setShowCertificationSelector(false);
    }
  };


  const handleStartModuleWithPayment = (moduleId: string) => {
    if (!currentCertification) return;
    
    if (!paymentCompleted) {
      setSelectedPaymentType('per-module');
      setSelectedModuleForPayment(moduleId);
      setShowPayment(true);
      return;
    }
    
    // Le module sera démarré directement par ModuleProgress
  };
  
  const handleContinueModule = (moduleId: string) => {
    if (!currentCertification) return;
    
    // Démarrer le module
    startModule(currentCertification.id, moduleId);
    
    // Mettre à jour l'état de l'utilisateur pour refléter le module en cours
    if (user) {
      user.currentModule = moduleId;
    }
    
    // Rediriger vers la page d'examen
    navigate('/exam');
  };

  const handlePaymentTypeSelect = (type: 'full' | 'per-module') => {
    setSelectedPaymentType(type);
    if (type === 'per-module') {
      // Redirect to per-module payment page
      navigate('/module-payment');
      return;
    }
    setShowPayment(true);
  };

  // Écouter la progression globale depuis ModuleProgress
  useEffect(() => {
    const listener = (e: any) => {
      if (e?.detail?.completedCount !== undefined) {
        setModulesCompletedCount(e.detail.completedCount);
      }
    };
    window.addEventListener('moduleProgressUpdate', listener);
    return () => window.removeEventListener('moduleProgressUpdate', listener);
  }, []);

  // Si le paiement est complété, fermer le sélecteur s'il est ouvert
  useEffect(() => {
    if (paymentCompleted && showCertificationSelector) {
      setShowCertificationSelector(false);
    }
    // Nettoyer toute trace de paiement par module si paiement complet
    if (paymentCompleted && selectedCertification) {
      try { localStorage.removeItem(`perModulePaid:${selectedCertification}`); } catch {}
    }
  }, [paymentCompleted, showCertificationSelector]);

  // Charger les résultats (notes/commentaires) pour affichage de la correction
  useEffect(() => {
    (async () => {
      try {
        const res = await ResultsService.getResults();
        if (res?.success) setResultsData(res.results || null);
      } catch {
        setResultsData(null);
      }
    })();
  }, []);

  // Charger les certificats envoyés à ce candidat
  useEffect(() => {
    (async () => {
      try {
        const res: any = await apiRequest('/candidate/certificates', 'GET');
        if (res?.success && Array.isArray(res.certificates)) {
          setMyCertificates(res.certificates);
        }
      } catch {
        // silencieux
      }
    })();
  }, []);

  const getPerModulePaid = (): string | null => {
    if (!selectedCertification) return null;
    try {
      const key = `perModulePaid:${selectedCertification}`;
      return localStorage.getItem(key);
    } catch { return null; }
  };

  const perModulePaidModuleId = getPerModulePaid();

  const saveProfile = () => {
    // Simulation de la sauvegarde
    console.log('Profil mis à jour:', profileForm);
    alert('Profil mis à jour avec succès !');
    setShowProfileModal(false);
  };
  
  const sendSupportMessage = () => {
    if (!supportForm.subject || !supportForm.message) {
      alert('Veuillez remplir tous les champs');
      return;
    }
    console.log('Message de support envoyé:', supportForm);
    alert('Votre message a été envoyé au support !');
    setSupportForm({ subject: '', message: '' });
    setShowSupportModal(false);
  };

  const hasCertificates = myCertificates.length > 0;
  const hasCorrection = Boolean(resultsData && Object.keys(resultsData || {}).length > 0);

  const isPaidOrModulePaid = paymentCompleted || !!perModulePaidModuleId;

  const statusInfo = useMemo(() => {
    if (!isPaidOrModulePaid) return { text: 'En attente de paiement', cls: 'text-gray-600' };
    if (isExamActive) return { text: 'Examen en cours', cls: 'text-blue-600' };
    if (hasCertificates) return { text: 'Certifié', cls: 'text-green-600' };
    if (hasCorrection) return { text: 'Correction disponible', cls: 'text-green-600' };
    if (user.examTaken) return { text: 'En correction', cls: 'text-blue-600' };
    if (modulesCompletedCount > 0) return { text: 'Modules en cours', cls: 'text-blue-600' };
    return { text: 'Prêt pour modules', cls: 'text-orange-600' };
  }, [isPaidOrModulePaid, isExamActive, hasCertificates, hasCorrection, user.examTaken, modulesCompletedCount]);

  const targetModulesCount = (currentCertification?.modules?.length || 0) > 0
    ? (perModulePaidModuleId ? 1 : (currentCertification?.modules?.length || 0))
    : (perModulePaidModuleId ? 1 : 0);

  const steps = [
    {
      id: 'payment',
      title: 'Paiement',
      description: 'Régler les frais d\'examen',
      completed: isPaidOrModulePaid,
      current: !isPaidOrModulePaid
    },
    {
      id: 'exam',
      title: 'Modules',
      description: `Compléter ${targetModulesCount} module${targetModulesCount > 1 ? 's' : ''}`,
      completed: modulesCompletedCount >= targetModulesCount,
      current: isPaidOrModulePaid && !user.examTaken && !isExamActive
    },
    {
      id: 'correction',
      title: 'Correction',
      description: 'Attendre l\'évaluation',
      completed: hasCorrection && !!resultsData,
      current: user.examTaken === true && !hasCorrection
    },
    {
      id: 'certificate',
      title: 'Certification',
      description: 'Récupérer l\'attestation',
      completed: hasCertificates,
      current: hasCorrection && !hasCertificates
    }
  ];

  if (isExamActive) {
    // L'interface d'examen sera affichée par App.tsx
    return null;
  }

  // Afficher le sélecteur de certification si aucune n'est sélectionnée
  if (showCertificationSelector) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CertificationSelector
            onSelect={handleCertificationSelect}
            selectedCertification={selectedCertification}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Bienvenue, {user.firstName} {user.lastName}
          </h1>
          <p className="text-gray-600 mt-2">
            {currentCertification ? 
              `Progression: ${currentCertification.name}` : 
              'Suivez votre progression vers la certification'
            }
          </p>
        </div>

        {/* Progress Steps */}
        <Card className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Votre Progression</h2>
          
          <div className="relative">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                    step.completed 
                      ? 'bg-green-600 text-white'
                      : step.current
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <span className="font-bold">{index + 1}</span>
                    )}
                  </div>
                  <div className="max-w-xs">
                    <p className="font-medium text-sm text-gray-900">{step.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Progress Line */}
            <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-300 -z-10">
              <div 
                className="h-full bg-green-600 transition-all duration-500"
                style={{
                  width: `${(steps.filter(s => s.completed).length / (steps.length - 1)) * 100}%`
                }}
              ></div>
            </div>
          </div>
        </Card>

        {/* Certification Progress */}
        {currentCertification && (paymentCompleted || !!perModulePaidModuleId) && (
          <ModuleProgress
            certification={currentCertification}
            completedModules={user.completedModules || []}
            unlockedModules={(user as any).unlockedModules || []}
            currentModule={user.currentModule}
            restrictToModules={paymentCompleted ? undefined : (perModulePaidModuleId ? [perModulePaidModuleId] : undefined)}
            onStartModuleWithPayment={handleStartModuleWithPayment}
            onContinueModule={handleContinueModule}
            examStartDate={user.examStartDate}
            hasPaid={paymentCompleted || !!perModulePaidModuleId}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {(!paymentCompleted && !perModulePaidModuleId) && (
              <Card>
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <CreditCard className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Paiement requis
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Pour accéder aux modules, vous devez d'abord régler les frais de certification.
                    </p>
                    {currentCertification && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-blue-900 font-medium">Certification :</span>
                          <span className="text-sm text-blue-700">{currentCertification.name}</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-blue-900 font-medium">Modules :</span>
                          <span className="text-blue-700">{currentCertification.modules.length} modules</span>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-blue-900 font-medium">Montant à payer :</span>
                          <span className="text-2xl font-bold text-blue-600">
                            {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'XAF',
                              minimumFractionDigits: 0
                            }).format(currentCertification.price)}
                          </span>
                        </div>
                        {currentCertification.pricePerModule && (
                          <div className="border-t border-blue-200 pt-3">
                            <p className="text-blue-800 text-sm mb-2">Options de paiement :</p>
                            <div className="space-y-2">
                              <button
                                onClick={() => handlePaymentTypeSelect('full')}
                                className="w-full text-left p-2 bg-white border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-blue-900">Certification complète</span>
                                  <span className="text-blue-600">{new Intl.NumberFormat('fr-FR', {
                                    style: 'currency',
                                    currency: 'XAF',
                                    minimumFractionDigits: 0
                                  }).format(currentCertification.price)}</span>
                                </div>
                                <p className="text-xs text-blue-700">Accès à tous les modules</p>
                              </button>
                              <button
                                onClick={() => handlePaymentTypeSelect('per-module')}
                                className="w-full text-left p-2 bg-white border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-blue-900">Paiement par module</span>
                                  <span className="text-blue-600">{new Intl.NumberFormat('fr-FR', {
                                    style: 'currency',
                                    currency: 'XAF',
                                    minimumFractionDigits: 0
                                  }).format(currentCertification.pricePerModule)}</span>
                                </div>
                                <p className="text-xs text-blue-700">Payez module par module</p>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <Button onClick={() => handlePaymentTypeSelect('full')}>
                      Procéder au paiement
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            

            {user.examTaken && !hasCorrection && (
              <Card>
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Modules soumis
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Vos modules ont été soumis avec succès et sont en cours de correction par nos examinateurs.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800 text-sm">
                        <Clock className="h-4 w-4 inline mr-2" />
                        Délai de correction : 48-72 heures
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {hasCorrection && resultsData && (
              <Card className="mt-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Correction disponible
                    </h3>
                    {(() => {
                      const certs = Object.values(resultsData || {}) as any[];
                      const first = certs[0];
                      const average20 = typeof first?.average_out_of_20 === 'number'
                        ? first.average_out_of_20
                        : (first && first.max_score > 0 ? (first.total_score / first.max_score) * 20 : null);
                      return (
                        <div>
                          {average20 !== null && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-green-800 font-medium">Moyenne :</span>
                                <span className="text-2xl font-bold text-green-600">{Number(average20).toFixed(1)}/20</span>
                              </div>
                            </div>
                          )}
                          <div className="space-y-3">
                            {first && first.modules && Object.values(first.modules).map((m: any) => {
                              const score20 = typeof m.score_out_of_20 === 'number' ? m.score_out_of_20 : (m.max_score > 0 ? (m.score / m.max_score) * 20 : 0);
                              // Parse des notes examinateur si c'est une chaîne JSON
                              let parsedNotes: Array<{ q: string; score?: any; feedback?: any }> = [];
                              if (m.examiner_notes) {
                                try {
                                  const obj = typeof m.examiner_notes === 'string' ? JSON.parse(m.examiner_notes) : m.examiner_notes;
                                  if (obj && typeof obj === 'object') {
                                    parsedNotes = Object.keys(obj).map((k) => ({ q: k, score: obj[k]?.score, feedback: obj[k]?.feedback }));
                                  }
                                } catch {}
                              }
                              return (
                                <div key={m.module_name} className="border border-gray-200 rounded-lg p-3">
                                  <div className="flex items-center justify-between">
                                    <div className="font-medium text-gray-900">{m.module_name}</div>
                                    <div className="text-sm font-semibold text-blue-600">{Number(score20).toFixed(1)}/20</div>
                                  </div>
                                  {parsedNotes.length > 0 && (
                                    <ul className="mt-2 text-sm text-gray-700 space-y-1">
                                      {parsedNotes.map((n) => (
                                        <li key={n.q} className="flex items-start justify-between">
                                          <span className="text-gray-600">Question {n.q}</span>
                                          <span className="ml-2 text-gray-900">Note: {n.score ?? '-'}{n.feedback ? ` — Commentaire: ${n.feedback}` : ''}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </Card>
            )}

            {hasCertificates && (
              <Card>
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Download className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Certification disponible
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 px-3 font-medium text-gray-900">Valeur</th>
                            <th className="text-left py-2 px-3 font-medium text-gray-900">Certification</th>
                            <th className="text-left py-2 px-3 font-medium text-gray-900">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {myCertificates.map((c) => (
                            <tr key={`${c.candidate_id}-${c.certification_type}-${c.sent_at || ''}`} className="border-b border-gray-100">
                              <td className="py-2 px-3 font-medium text-gray-900">{c.candidate_name || `${user.firstName} ${user.lastName}`}</td>
                              <td className="py-2 px-3 text-gray-900">{c.certification_type}</td>
                              <td className="py-2 px-3">
                                <button
                                  className="text-blue-600 hover:underline"
                                  onClick={async () => {
                                    try {
                                      const url = `${API_BASE_URL}/candidate/certificates/download/${c.certification_type}`;
                                      const res = await fetch(url, { headers: { Authorization: `Bearer ${getToken()}` } });
                                      if (!res.ok) throw new Error(`HTTP ${res.status}`);
                                      const blob = await res.blob();
                                      const a = document.createElement('a');
                                      const objectUrl = URL.createObjectURL(blob);
                                      a.href = objectUrl;
                                      a.download = `certificate-${c.candidate_id}-${c.certification_type}.pdf`;
                                      document.body.appendChild(a);
                                      a.click();
                                      a.remove();
                                      URL.revokeObjectURL(objectUrl);
                                    } catch (e) {
                                      alert('Téléchargement impossible. Réessayez plus tard.');
                                    }
                                  }}
                                >
                                  Télécharger
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className='mt-6'>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Certification</h3>
              {(!paymentCompleted && !perModulePaidModuleId) && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowCertificationSelector(true)}
                >
                  Changer
                </Button>
              )}
              </div>
              {currentCertification && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 text-sm mb-1">
                    {currentCertification.name}
                  </h4>
                  <p className="text-xs text-blue-700">
                    {currentCertification.modules.length} modules • {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'XAF',
                      minimumFractionDigits: 0
                    }).format(currentCertification.price)}
                  </p>
                </div>
              )}
              
              <h3 className="font-semibold text-gray-900 mb-4">Informations</h3>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium">Profil</span>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowProfileModal(true)}
                >
                  Modifier
                </Button>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Email :</span>
                  <span className="font-medium">{user.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Téléphone :</span>
                  <span className="font-medium">{user.phone}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Profession :</span>
                  <span className="font-medium">{user.profession}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Statut :</span>
                  <span className={`font-medium ${statusInfo.cls}`}>{statusInfo.text}</span>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Certificats</h3>
              </div>
              {myCertificates.length === 0 ? (
                <p className="text-sm text-gray-600">Aucun certificat envoyé pour le moment.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3 font-medium text-gray-900">Valeur</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-900">Certification</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-900">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myCertificates.map((c) => (
                        <tr key={`${c.candidate_id}-${c.certification_type}-${c.sent_at || ''}`} className="border-b border-gray-100">
                          <td className="py-2 px-3 font-medium text-gray-900">{c.candidate_name || `${user.firstName} ${user.lastName}`}</td>
                          <td className="py-2 px-3 text-gray-900">{c.certification_type}</td>
                          <td className="py-2 px-3">
                            <a className="text-blue-600 hover:underline" href={c.url} target="_blank" rel="noreferrer">Télécharger</a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            <Card>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Support</h3>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowSupportModal(true)}
                >
                  Contacter
                </Button>
              </div>
              <h3 className="font-semibold text-gray-900 mb-4">Détails des modules</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Durée par module :</span>
                  <span className="font-medium">60 minutes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Questions par module :</span>
                  <span className="font-medium">20 questions</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Score minimum :</span>
                  <span className="font-medium">70/100</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Format :</span>
                  <span className="font-medium">QCM + Texte libre</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Prix :</span>
                  <span className="font-medium">
                    {currentCertification ? 
                      new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'XAF',
                        minimumFractionDigits: 0
                      }).format(currentCertification.price) : 'Non défini'}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">Modifier mon profil</h3>
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
                  label="Profession"
                  value={profileForm.profession}
                  onChange={(e) => setProfileForm({...profileForm, profession: e.target.value})}
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
              <h3 className="text-lg font-semibold">Contacter le support</h3>
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
                    <option value="payment">Problème de paiement</option>
                    <option value="exam">Question sur l'examen</option>
                    <option value="technical">Problème technique</option>
                    <option value="certificate">Certificat</option>
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

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-1">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Paiement de l'examen</h3>
              <button 
                onClick={() => setShowPayment(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <PaymentForm 
                amount={
                  selectedPaymentType === 'full' 
                    ? (currentCertification?.price || 10)
                    : (currentCertification?.pricePerModule || 10)
                }
                certificationType={selectedCertification || ''}
                paymentType={selectedPaymentType}
                moduleId={selectedModuleForPayment}
                onPaymentSuccess={handlePaymentSuccess}
              />
            </div>
          </div>
        </div>
      )}

      {/* Module Instructions Modal */}
      {showExamInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Instructions des modules</h3>
              <button 
                onClick={() => setShowExamInstructions(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Règles importantes :</h4>
                <ul className="list-disc pl-6 text-sm text-gray-700 space-y-1">
                  <li>Chaque module dure exactement 60 minutes et ne peut pas être interrompu</li>
                  <li>Chaque module contient 20 questions variées</li>
                  <li>Vous pouvez naviguer entre les questions et modifier vos réponses</li>
                  <li>La soumission est automatique à la fin du temps imparti</li>
                  <li>Vous avez 3 jours pour terminer tous les modules</li>
                  <li>Assurez-vous d'avoir une connexion internet stable</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Conseils :</h4>
                <ul className="list-disc pl-6 text-sm text-gray-700 space-y-1">
                  <li>Lisez attentivement chaque question avant de répondre</li>
                  <li>Gérez votre temps efficacement</li>
                  <li>Complétez les modules dans l'ordre (Leadership → Compétences → Entrepreneuriat)</li>
                  <li>Pour les questions ouvertes, donnez des exemples concrets</li>
                  <li>Vérifiez vos réponses avant la soumission finale</li>
                </ul>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowExamInstructions(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={() => currentCertification && handleStartModuleWithPayment(currentCertification.modules[0].id)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Commencer les modules
              </Button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
};