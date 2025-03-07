import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function About() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 text-gray-400 hover:text-gray-500"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          À propos de CYNEPROD
        </h1>
      </div>

      <div className="prose prose-blue max-w-none">
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Notre Histoire</h2>
          <p className="text-gray-600">
            CYNEPROD est une entreprise passionnée par l'aéromodélisme depuis plus de 20 ans. 
            Notre collection unique de magazines spécialisés représente l'une des plus importantes 
            archives documentaires dans le domaine de l'aéromodélisme en France.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Notre Mission</h2>
          <p className="text-gray-600">
            Notre mission est de préserver et partager le patrimoine de l'aéromodélisme 
            à travers notre collection exceptionnelle de magazines. Nous nous efforçons 
            de rendre accessible à tous les passionnés ces précieuses ressources documentaires.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Nos Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Vente de Magazines
              </h3>
              <p className="text-gray-600">
                Accédez à notre collection complète de magazines d'aéromodélisme, 
                avec des numéros rares et des éditions spéciales.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Support Client
              </h3>
              <p className="text-gray-600">
                Notre équipe est à votre disposition pour vous aider dans vos recherches 
                et répondre à toutes vos questions.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Engagement Qualité</h2>
          <p className="text-gray-600">
            Nous garantissons l'authenticité et la qualité de tous nos magazines. 
            Chaque exemplaire est soigneusement vérifié et conservé dans les meilleures 
            conditions pour assurer sa préservation.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Nous Trouver</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-gray-700 mb-4">
              Notre entreprise est située à Quarante (34310), dans l'Hérault.
            </p>
            <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d23210.624966261606!2d2.9575648999999995!3d43.349246699999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sfr!2sfr!4v1738764712408!5m2!1sfr!2sfr"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Carte de Quarante"
                className="absolute inset-0"
              />
            </div>
            <p className="mt-4 text-sm text-gray-500 text-center">
              Carte fournie par Google Maps
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Contact</h2>
          <p className="text-gray-600">
            Pour toute question ou demande spécifique, n'hésitez pas à nous contacter :
          </p>
          <div className="mt-4 bg-gray-50 p-6 rounded-lg">
            <p className="text-gray-700">Email : contact@cyneprod.fr</p>
            <p className="text-gray-700">Horaires : Du lundi au vendredi, 9h-18h</p>
            <p className="text-gray-700">Adresse : 34310 Quarante, France</p>
          </div>
        </section>
      </div>
    </div>
  );
}
