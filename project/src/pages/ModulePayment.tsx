import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PaymentForm } from '../components/payment/PaymentForm';
import { useAuth } from '../contexts/AuthContext';
import { useExam } from '../contexts/ExamContext';
import { getCertificationById } from '../components/data/certifications';

const ModulePayment: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startModule } = useExam();
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  // get selected certification from user
  const certificationId = user?.selectedCertification || '';
  const certification = getCertificationById(certificationId);

  if (!user || !certification) return <div>Chargement...</div>;

  const handlePayAndStart = (moduleId: string) => {
    setSelectedModule(moduleId);
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    if (!selectedModule) return;

    // Optionally call backend to record module payment here
    // For now update local user and start module
    user.hasPaid = user.hasPaid || false;

    // start the module
    startModule(certification.id, selectedModule);
    navigate('/exam');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-4">Paiement par module - {certification.name}</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {certification.modules.map((m: any, idx: number) => (
            <Card key={m.id} className="p-4">
              <h3 className="font-semibold mb-2">{m.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{m.description}</p>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-700">Prix:</span>
                <span className="font-bold text-blue-600">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 }).format(certification.pricePerModule || 0)}</span>
              </div>
              <Button onClick={() => handlePayAndStart(m.id)} className="w-full bg-green-600 hover:bg-green-700">Payer et commencer</Button>
            </Card>
          ))}
        </div>

        <div className="mt-6">
          <Button variant="secondary" onClick={() => navigate('/candidate-dashboard')}>Retour</Button>
        </div>
      </div>

      {showPayment && selectedModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full p-4">
            <h3 className="text-lg font-medium mb-3">Paiement - Module sélectionné</h3>
            <PaymentForm
              amount={certification.pricePerModule || 0}
              certificationType={certification.id}
              paymentType={'per-module'}
              moduleId={selectedModule}
              onPaymentSuccess={handlePaymentSuccess}
            />
            <div className="mt-3 text-right">
              <Button variant="secondary" onClick={() => setShowPayment(false)}>Annuler</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ModulePayment;
