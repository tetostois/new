import React, { useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ExamInformation from '../components/exam/ExamInformation';
import { useExam } from '../contexts/ExamContext';

const ExamConditions: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { startModule } = useExam();

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const certificationId = params.get('cert') || '';
  const moduleId = params.get('module') || '';

  useEffect(() => {
    if (!certificationId) {
      navigate('/candidate-dashboard', { replace: true });
    }
  }, [certificationId, navigate]);
  return (
    <ExamInformation
      certification={certificationId}
      onBack={() => navigate('/candidate-dashboard')}
      onContinue={async () => {
        // Si un module est spécifié (paiement par module), démarrer ce module après acceptation
        if (certificationId && moduleId) {
          await startModule(certificationId, moduleId);
          navigate('/exam');
          return;
        }
        // Sinon (paiement complet), revenir au dashboard
        navigate('/candidate-dashboard');
      }}
    />
  );
};

export default ExamConditions;


