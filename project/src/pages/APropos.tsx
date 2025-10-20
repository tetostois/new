import { BookOpen, Users, Award, Lightbulb, Globe, Heart } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { LandingHeader } from '../components/layout/LandingHeader';
import Footer from '../components/layout/Footer';

const APropos = () => {
  const features = [
    {
      icon: <BookOpen className="h-8 w-8 text-blue-600" />,
      title: 'Formation de Qualité',
      description: 'Des programmes conçus par des experts en leadership et entrepreneuriat.'
    },
    {
      icon: <Users className="h-8 w-8 text-green-600" />,
      title: 'Communauté Active',
      description: 'Rejoignez un réseau de professionnels ambitieux et motivés.'
    },
    {
      icon: <Award className="h-8 w-8 text-purple-600" />,
      title: 'Certification Reconnue',
      description: 'Des certifications valorisées sur le marché professionnel.'
    },
    {
      icon: <Lightbulb className="h-8 w-8 text-yellow-600" />,
      title: 'Approche Innovante',
      description: 'Méthodes pédagogiques modernes et adaptées aux réalités africaines.'
    },
    {
      icon: <Globe className="h-8 w-8 text-red-600" />,
      title: 'Portée Panafricaine',
      description: 'Accessible partout en Afrique et dans la diaspora.'
    },
    {
      icon: <Heart className="h-8 w-8 text-pink-600" />,
      title: 'Engagement Social',
      description: 'Une partie des bénéfices est réinvestie dans des projets éducatifs.'
    }
  ];

  const team = [
    {
      name: 'Staff 1',
      role: 'Fondateur & Expert en Leadership',
      bio: 'Plus de 15 ans d\'expérience dans le développement du leadership en Afrique.',
      image: '/images/02.png'
    },
    {
      name: 'Staff 2',
      role: 'Directrice Pédagogique',
      bio: 'Spécialiste en ingénierie de formation avec une expertise en entrepreneuriat.',
      image: '/images/04.png'
    },
    {
      name: 'Staff 3',
      role: 'Responsable Certification',
      bio: 'Expert en évaluation et certification des compétences professionnelles.',
      image: '/images/05.png'
    }
  ];

  return (
    <div className="min-h-screen">
      <LandingHeader 
        onLoginClick={() => window.location.href = '/login'}
        onRegisterClick={() => window.location.href = '/register'}
      />
      
      {/* Hero Section */}
      <div className="relative py-32 text-white">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(/images/bg-about.jpg)',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-blue-600/70 z-0"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">À Propos de Notre Programme</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Découvrez notre mission, notre vision et notre engagement pour le développement du leadership au Cameroun.
          </p>
        </div>
      </div>

      {/* Notre Mission */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Notre Mission</h2>
            <div className="max-w-3xl mx-auto">
              <p className="text-lg text-gray-600 mb-8">
                Chez ENALE, nous nous engageons à former une nouvelle génération de leaders africains compétents, 
                éthiques et innovants, capables de relever les défis du 21ème siècle et de contribuer 
                au développement durable de notre continent.
              </p>
            </div>
          </div>

          {/* Nos Valeurs */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Nos Valeurs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-lg hover:shadow-md transition-shadow">
                  <div className="mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notre Équipe */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Notre Équipe</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md">
                <div className="h-64 bg-gray-200 overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://ui-avatars.com/api/?name=' + member.name.split(' ').join('+') + '&background=4f46e5&color=fff&size=200';
                    }}
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-2">{member.role}</p>
                  <p className="text-gray-600">{member.bio}</p>
                </div>
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

export default APropos;
