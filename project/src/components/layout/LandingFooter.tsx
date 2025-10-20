// import React from 'react';
// import { BookOpen, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

// export const LandingFooter: React.FC = () => {
//   const currentYear = new Date().getFullYear();

//   const footerSections = [
//     {
//       title: 'Leadership Cameroun',
//       links: [
//         { label: 'À propos de nous', href: '#about' },
//         { label: 'Notre mission', href: '#mission' },
//         { label: 'Nos valeurs', href: '#values' },
//         { label: 'Équipe', href: '#team' }
//       ]
//     },
//     {
//       title: 'Certification',
//       links: [
//         { label: 'Processus d\'examen', href: '#process' },
//         { label: 'Critères d\'évaluation', href: '#criteria' },
//         { label: 'Tarification', href: '#pricing' },
//         { label: 'FAQ', href: '#faq' }
//       ]
//     },
//     {
//       title: 'Support',
//       links: [
//         { label: 'Centre d\'aide', href: '#help' },
//         { label: 'Guides', href: '#guides' },
//         { label: 'Contact', href: '#contact' },
//         { label: 'Support technique', href: '#support' }
//       ]
//     },
//     {
//       title: 'Légal',
//       links: [
//         { label: 'Conditions d\'utilisation', href: '#terms' },
//         { label: 'Politique de confidentialité', href: '#privacy' },
//         { label: 'Politique de remboursement', href: '#refund' },
//         { label: 'Mentions légales', href: '#legal' }
//       ]
//     }
//   ];

//   return (
//     <footer className="bg-gray-900 text-white">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//         {/* Main Footer Content */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
//           {/* Company Info */}
//           <div className="lg:col-span-2">
//             <div className="flex items-center space-x-3 mb-4">
//               <BookOpen className="h-8 w-8 text-green-500" />
//               <div>
//                 <h3 className="text-xl font-bold">Leadership Cameroun</h3>
//                 <p className="text-sm text-gray-400">Excellence • Intégrité • Vision</p>
//               </div>
//             </div>
            
//             <p className="text-gray-300 mb-6 leading-relaxed">
//               Développez vos compétences en leadership avec notre certification professionnelle. 
//               Un processus rigoureux et reconnu pour les leaders d'aujourd'hui et de demain.
//             </p>

//             {/* Contact Info */}
//             <div className="space-y-3">
//               <div className="flex items-center space-x-3">
//                 <MapPin className="h-5 w-5 text-green-500" />
//                 <span className="text-gray-300">Yaoundé, Cameroun</span>
//               </div>
//               <div className="flex items-center space-x-3">
//                 <Phone className="h-5 w-5 text-green-500" />
//                 <span className="text-gray-300">+237 6XX XXX XXX</span>
//               </div>
//               <div className="flex items-center space-x-3">
//                 <Mail className="h-5 w-5 text-green-500" />
//                 <span className="text-gray-300">contact@leadership-cameroun.com</span>
//               </div>
//             </div>

//             {/* Social Media */}
//             <div className="flex space-x-4 mt-6">
//               <a href="#" className="text-gray-400 hover:text-green-500 transition-colors">
//                 <Facebook className="h-6 w-6" />
//               </a>
//               <a href="#" className="text-gray-400 hover:text-green-500 transition-colors">
//                 <Twitter className="h-6 w-6" />
//               </a>
//               <a href="#" className="text-gray-400 hover:text-green-500 transition-colors">
//                 <Linkedin className="h-6 w-6" />
//               </a>
//               <a href="#" className="text-gray-400 hover:text-green-500 transition-colors">
//                 <Instagram className="h-6 w-6" />
//               </a>
//             </div>
//           </div>

//           {/* Footer Links */}
//           {footerSections.map((section) => (
//             <div key={section.title}>
//               <h4 className="text-lg font-semibold mb-4 text-white">{section.title}</h4>
//               <ul className="space-y-2">
//                 {section.links.map((link) => (
//                   <li key={link.label}>
//                     <a
//                       href={link.href}
//                       className="text-gray-300 hover:text-green-500 transition-colors text-sm"
//                     >
//                       {link.label}
//                     </a>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           ))}
//         </div>

//         {/* Newsletter Signup */}
//         <div className="border-t border-gray-800 mt-12 pt-8">
//           <div className="max-w-md">
//             <h4 className="text-lg font-semibold mb-2">Restez informé</h4>
//             <p className="text-gray-300 text-sm mb-4">
//               Recevez nos dernières actualités et conseils en leadership
//             </p>
//             <div className="flex space-x-2">
//               <input
//                 type="email"
//                 placeholder="Votre email"
//                 className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
//               />
//               <button className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium">
//                 S'abonner
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Bottom Bar */}
//         <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
//           <p className="text-gray-400 text-sm">
//             © {currentYear} Leadership Cameroun. Tous droits réservés.
//           </p>
//           <div className="flex space-x-6 mt-4 md:mt-0">
//             <a href="#terms" className="text-gray-400 hover:text-green-500 text-sm transition-colors">
//               Conditions d'utilisation
//             </a>
//             <a href="#privacy" className="text-gray-400 hover:text-green-500 text-sm transition-colors">
//               Confidentialité
//             </a>
//             <a href="#cookies" className="text-gray-400 hover:text-green-500 text-sm transition-colors">
//               Cookies
//             </a>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// };