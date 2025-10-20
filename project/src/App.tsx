import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ExamProvider, useExam } from './contexts/ExamContext';
import { Header } from './components/layout/Header';
import { LandingPage } from './pages/LandingPage';
import { CandidateDashboard } from './pages/CandidateDashboard';
import { ExaminerDashboard } from './pages/ExaminerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ExamInterface } from './components/exam/ExamInterface';
import APropos from './pages/APropos';
import ModulePayment from './pages/ModulePayment';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const { isExamActive } = useExam();

  // Show exam interface if exam is active
  if (isExamActive) {
    return <ExamInterface />;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/a-propos" element={<APropos />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Routes>
        {user.role === 'admin' && (
          <>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/" element={<AdminDashboard />} />
          </>
        )}
        {user.role === 'examiner' && (
          <>
            <Route path="/examiner" element={<ExaminerDashboard />} />
            <Route path="/" element={<ExaminerDashboard />} />
          </>
        )}
        {user.role === 'candidate' && (
          <>
            <Route path="/candidate-dashboard" element={<CandidateDashboard />} />
            <Route path="/module-payment" element={<ModulePayment />} />
            <Route path="/" element={<CandidateDashboard />} />
          </>
        )}
        <Route path="*" element={<CandidateDashboard />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ExamProvider>
          <AppContent />
        </ExamProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;