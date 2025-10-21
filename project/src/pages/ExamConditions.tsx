import React, { useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ExamInformation from '../components/exam/ExamInformation';

const ExamConditions: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const certificationId = params.get('cert') || '';

  useEffect(() => {
    if (!certificationId) {
      navigate('/candidate-dashboard', { replace: true });
    }
  }, [certificationId, navigate]);
  return (
    <ExamInformation
      certification={certificationId}
      onBack={() => navigate('/candidate-dashboard')}
      onContinue={() => navigate('/candidate-dashboard')}
    />
  );
};

export default ExamConditions;


