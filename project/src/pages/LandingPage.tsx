import React, { useState } from "react";
import {
  BookOpen,
  Users,
  Award,
  Clock,
  CheckCircle,
  ArrowRight,
  // Star,
} from "lucide-react";
import { LandingHeader } from "../components/layout/LandingHeader";
import Footer from "../components/layout/Footer";
import { LoginForm } from "../components/auth/LoginForm";
import { RegisterForm } from "../components/auth/RegisterForm";
// import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export const LandingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  const features = [
    {
      icon: <BookOpen className="w-8 h-8 text-blue-600" />,
      title: "Examen Certifiant",
      description:
        "Évaluation complète de vos compétences en leadership avec questions théoriques et pratiques.",
    },
    {
      icon: <Clock className="w-8 h-8 text-green-600" />,
      title: "Session Chronométrée",
      description:
        "Examen de 60 minutes avec timer en temps réel pour une évaluation authentique.",
    },
    {
      icon: <Users className="w-8 h-8 text-purple-600" />,
      title: "Correction Professionnelle",
      description:
        "Évaluation par des examinateurs qualifiés avec feedback détaillé.",
    },
    {
      icon: <Award className="w-8 h-8 text-orange-600" />,
      title: "Certification Officielle",
      description:
        "Attestation PDF automatique après validation de votre examen.",
    },
  ];

  const steps = [
    {
      number: 1,
      title: "Inscription",
      description:
        "Créez votre compte candidat avec vos informations personnelles.",
    },
    {
      number: 2,
      title: "Paiement",
      description:
        "Réglez les frais d'examen via Stripe, Cinetpay(Orange Money ou MTN Money).",
    },
    {
      number: 3,
      title: "Examen",
      description: "Passez l'examen chronométré en ligne.",
    },
    {
      number: 4,
      title: "Certification",
      description:
        "Recevez votre attestation officielle par email après correction.",
    },
  ];

  // const testimonials = [
  //   {
  //     name: 'Marie Dubois',
  //     role: 'Manager, TechCorp',
  //     content: 'Cette certification m\'a aidée à développer mes compétences managériales. Le processus est professionnel et rigoureux.',
  //     rating: 5
  //   },
  //   {
  //     name: 'Jean Kamga',
  //     role: 'Chef de Projet',
  //     content: 'Examen bien structuré avec des questions pertinentes. La correction est détaillée et constructive.',
  //     rating: 5
  //   }
  // ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <LandingHeader
        onLoginClick={() => setActiveTab("login")}
        onRegisterClick={() => setActiveTab("register")}
      />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Image de fond */}
        <div
          className="absolute inset-0 z-0 bg-center bg-cover"
          style={{
            backgroundImage: "url(/images/03.jpg)",
            // opacity: 0.1
          }}
        />
        <div className="relative z-10 px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2">
            <div>
              <div className="flex items-center mb-4 space-x-2">
                <BookOpen className="w-10 h-10 text-white" />
                <span className="text-2xl font-bold text-white">
                  Leadership Exam
                </span>
              </div>

              <h1 className="mb-6 text-4xl font-bold leading-tight text-purple-600 md:text-5xl">
                Obtenez Votre
                <span className="block text-yellow-300 drop-shadow-lg">
                  Certification Leadership.
                </span>
              </h1>

              <p className="mb-8 text-lg leading-relaxed text-white drop-shadow-md">
                Évaluez et certifiez vos compétences en leadership avec notre
                examen professionnel en ligne. Processus sécurisé, correction
                par des experts, et certification officielle.
              </p>

              <div className="flex items-center mb-8 space-x-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <span className="text-white drop-shadow-sm">
                    Certification officielle
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <span className="text-white drop-shadow-sm">
                    Correction professionnelle
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg shadow-lg lg:pl-8 bg-white/90 backdrop-blur-sm">
              <div className="p-2 bg-white shadow-xl rounded-2xl">
                <div className="flex border-b border-gray-200">
                  <button
                    className={`flex-1 py-3 px-4 text-center font-medium rounded-t-lg transition-colors ${
                      activeTab === "login"
                        ? "bg-green-700 text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                    onClick={() => setActiveTab("login")}
                  >
                    Connexion
                  </button>
                  <button
                    className={`flex-1 py-3 px-4 text-center font-medium rounded-t-lg transition-colors ${
                      activeTab === "register"
                        ? "bg-green-700 text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                    onClick={() => setActiveTab("register")}
                  >
                    Inscription
                  </button>
                </div>

                <div className="p-6">
                  {activeTab === "login" ? <LoginForm /> : <RegisterForm />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              Pourquoi Choisir Notre Certification ?
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-gray-600">
              Un processus rigoureux et professionnel pour évaluer vos
              compétences en leadership
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="text-center transition-shadow hover:shadow-xl"
              >
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="mb-3 text-xl font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Process Section */}
      <div className="py-16 bg-gray-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              Comment Ça Marche ?
            </h2>
            <p className="text-lg text-gray-600">
              4 étapes simples pour obtenir votre certification
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="flex items-center justify-center w-12 h-12 text-xl font-bold text-white bg-green-700 rounded-full">
                    {step.number}
                  </div>
                </div>
                <h3 className="mb-3 text-xl font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="absolute hidden transform translate-x-6 lg:block top-6 left-1/2">
                    <ArrowRight className="w-6 h-6 text-blue-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};
