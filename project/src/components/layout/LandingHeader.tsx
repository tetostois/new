// import React from 'react';
// import { BookOpen, Menu, X } from 'lucide-react';
// import { Link } from 'react-router-dom';
// import { Button } from '../ui/Button';

// interface LandingHeaderProps {
//   onLoginClick: () => void;
//   onRegisterClick: () => void;
// }

// export const LandingHeader: React.FC<LandingHeaderProps> = ({ onLoginClick, onRegisterClick }) => {
//   const [isMenuOpen, setIsMenuOpen] = React.useState(false);

//   const navigationItems = [
//     { label: 'À propos', href: '/a-propos' },
//     { label: 'Processus', href: '#process' },
//     { label: 'Tarifs', href: '#pricing' },
//     { label: 'Contact', href: '#contact' }
//   ];

//   return (
//     <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-16">
//           {/* Logo */}
//           <div className="flex items-center space-x-3">
//             <div className="flex items-center space-x-2">
//               <BookOpen className="h-8 w-8 text-green-600" />
//               <div>
//                 <h1 className="text-xl font-bold text-gray-900">Leadership Cameroun</h1>
//                 <p className="text-xs text-gray-600">Excellence • Intégrité • Vision</p>
//               </div>
//             </div>
//           </div>

//           {/* Desktop Navigation */}
//           <nav className="hidden md:flex items-center space-x-8">
//             {navigationItems.map((item) => (
//               item.label === 'À propos' ? (
//                 <Link
//                   key={item.label}
//                   to={item.href}
//                   className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
//                 >
//                   {item.label}
//                 </Link>
//               ) : (
//                 <a
//                   key={item.label}
//                   href={item.href}
//                   className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
//                 >
//                   {item.label}
//                 </a>
//               )
//             ))}
//           </nav>

//           {/* Desktop Auth Buttons */}
//           <div className="hidden md:flex items-center space-x-3">
//             <Button
//               variant="secondary"
//               onClick={onLoginClick}
//               className="border-green-200 text-green-700 hover:bg-green-50"
//             >
//               Connexion
//             </Button>
//             <Button
//               onClick={onRegisterClick}
//               className="bg-green-600 hover:bg-green-700"
//             >
//               S'inscrire
//             </Button>
//           </div>

//           {/* Mobile menu button */}
//           <div className="md:hidden">
//             <button
//               onClick={() => setIsMenuOpen(!isMenuOpen)}
//               className="text-gray-600 hover:text-gray-900"
//             >
//               {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
//             </button>
//           </div>
//         </div>

//         {/* Mobile Navigation */}
//         {isMenuOpen && (
//           <div className="md:hidden border-t border-gray-200 py-4">
//             <nav className="flex flex-col space-y-4">
//               {navigationItems.map((item) => (
//               item.label === 'À propos' ? (
//                 <Link
//                   key={item.label}
//                   to={item.href}
//                   className="text-gray-600 hover:text-gray-900 transition-colors font-medium px-2 block"
//                   onClick={() => setIsMenuOpen(false)}
//                 >
//                   {item.label}
//                 </Link>
//               ) : (
//                 <a
//                   key={item.label}
//                   href={item.href}
//                   className="text-gray-600 hover:text-gray-900 transition-colors font-medium px-2 block"
//                   onClick={() => setIsMenuOpen(false)}
//                 >
//                   {item.label}
//                 </a>
//               )
//             ))}
//               <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
//                 <Button
//                   variant="secondary"
//                   onClick={() => {
//                     onLoginClick();
//                     setIsMenuOpen(false);
//                   }}
//                   className="border-green-200 text-green-700 hover:bg-green-50"
//                 >
//                   Connexion
//                 </Button>
//                 <Button
//                   onClick={() => {
//                     onRegisterClick();
//                     setIsMenuOpen(false);
//                   }}
//                   className="bg-green-600 hover:bg-green-700"
//                 >
//                   S'inscrire
//                 </Button>
//               </div>
//             </nav>
//           </div>
//         )}
//       </div>
//     </header>
//   );
// };


import React from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

interface LandingHeaderProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({ onLoginClick, onRegisterClick }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navigationItems = [
    { label: 'À propos', href: '/a-propos' },
    // { label: 'Processus', href: '#process' },
    // { label: 'Tarifs', href: '#pricing' },
    // { label: 'Contact', href: '#contact' }
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 h-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="flex items-center">
              <img 
                src="/images/04.png" 
                alt="Logo ENALE" 
                className="h-16 w-70 object-cover"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Button
              variant="secondary"
              onClick={onLoginClick}
              className="border-green-200 text-green-700 hover:bg-green-50"
            >
              Connexion
            </Button>
            <Button
              onClick={onRegisterClick}
              className="bg-green-600 hover:bg-green-700"
            >
              S'inscrire
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                <Button
                  variant="secondary"
                  onClick={() => {
                    onLoginClick();
                    setIsMenuOpen(false);
                  }}
                  className="border-green-200 text-green-700 hover:bg-green-50"
                >
                  Connexion
                </Button>
                <Button
                  onClick={() => {
                    onRegisterClick();
                    setIsMenuOpen(false);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  S'inscrire
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};