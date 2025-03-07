import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function TermsOfService() {
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
          Conditions Générales de Vente
        </h1>
      </div>

      <div className="prose prose-blue max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Article 1 - Objet</h2>
          <p>
            Les présentes conditions générales de vente régissent les relations contractuelles entre
            Collection AéroMag et ses clients dans le cadre de la vente de magazines d'aéromodélisme.
            Toute commande implique l'acceptation sans réserve par l'acheteur des présentes conditions
            de vente.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Article 2 - Prix</h2>
          <p>
            Les prix de nos produits sont indiqués en euros toutes taxes comprises (TVA et autres taxes
            applicables au jour de la commande), sauf indication contraire et hors frais de traitement
            et d'expédition.
          </p>
          <p className="mt-4">
            En cas de commande vers un pays autre que la France métropolitaine, vous êtes l'importateur
            du ou des produits concernés. Des droits de douane ou autres taxes locales ou droits
            d'importation ou taxes d'État sont susceptibles d'être exigibles.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Article 3 - Commandes</h2>
          <p>
            Les informations contractuelles sont présentées en langue française et feront l'objet d'une
            confirmation au plus tard au moment de la validation de votre commande.
          </p>
          <p className="mt-4">
            Collection AéroMag se réserve le droit de ne pas enregistrer un paiement, et de ne pas
            confirmer une commande pour quelque raison que ce soit, et plus particulièrement en cas de
            problème d'approvisionnement, ou en cas de difficulté concernant la commande reçue.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Article 4 - Validation de votre commande</h2>
          <p>
            Toute commande figurant sur le site Internet Collection AéroMag suppose l'adhésion aux
            présentes Conditions Générales. Toute confirmation de commande entraîne votre adhésion
            pleine et entière aux présentes conditions générales de vente, sans exception ni réserve.
          </p>
          <p className="mt-4">
            L'ensemble des données fournies et la confirmation enregistrée vaudront preuve de la
            transaction.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Article 5 - Paiement</h2>
          <p>
            Le fait de valider votre commande implique pour vous l'obligation de payer le prix indiqué.
            Le règlement de vos achats s'effectue par carte bancaire grâce au système sécurisé.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Article 6 - Livraison</h2>
          <p>
            Les produits sont livrés à l'adresse de livraison indiquée au cours du processus de
            commande, dans le délai indiqué sur la page de validation de la commande.
          </p>
          <p className="mt-4">
            En cas de retard d'expédition, un mail vous sera adressé pour vous informer d'une
            éventuelle conséquence sur le délai de livraison qui vous a été indiqué.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Article 7 - Rétractation</h2>
          <p>
            Conformément aux dispositions de l'article L.121-21 du Code de la Consommation, vous
            disposez d'un délai de rétractation de 14 jours à compter de la réception de vos produits
            pour exercer votre droit de rétraction sans avoir à justifier de motifs ni à payer de
            pénalité.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Article 8 - Disponibilité</h2>
          <p>
            Nos produits sont proposés tant qu'ils sont visibles sur le site Collection AéroMag et dans
            la limite des stocks disponibles. En cas d'indisponibilité de produit après passation de
            votre commande, nous vous en informerons par mail. Votre commande sera automatiquement
            annulée et aucun débit bancaire ne sera effectué.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Article 9 - Contact</h2>
          <p>
            Pour toute information, question ou réclamation, le client peut s'adresser au service
            client de Collection AéroMag via le chat en ligne disponible sur le site ou par email.
          </p>
        </section>
      </div>
    </div>
  );
}
