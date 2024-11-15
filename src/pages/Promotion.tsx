import React from 'react';
import { Megaphone, Share2, Globe, Mail, MessageCircle, Smartphone } from 'lucide-react';

export default function Promotion() {
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Divulgação de Eventos
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Alcance mais pessoas e aumente a visibilidade dos seus eventos católicos com nossas ferramentas de divulgação.
          </p>
        </div>

        {/* Channels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: Globe,
              title: 'Redes Sociais',
              description: 'Integração com as principais redes sociais para ampliar seu alcance.'
            },
            {
              icon: Mail,
              title: 'Email Marketing',
              description: 'Campanhas personalizadas de email para sua base de contatos.'
            },
            {
              icon: MessageCircle,
              title: 'WhatsApp',
              description: 'Comunicação direta via WhatsApp com lembretes e novidades.'
            },
            {
              icon: Share2,
              title: 'Compartilhamento',
              description: 'Ferramentas para compartilhamento fácil em diversas plataformas.'
            },
            {
              icon: Smartphone,
              title: 'App Mobile',
              description: 'Notificações push e acesso rápido pelo aplicativo móvel.'
            },
            {
              icon: Megaphone,
              title: 'Anúncios',
              description: 'Gestão de campanhas pagas para maior visibilidade.'
            }
          ].map((channel, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center mb-4">
                <channel.icon className="h-8 w-8 text-indigo-600" />
                <h2 className="text-xl font-bold ml-2">{channel.title}</h2>
              </div>
              <p className="text-gray-600">{channel.description}</p>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            Recursos de Divulgação
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: 'Templates Prontos',
                description: 'Modelos profissionais personalizáveis para suas divulgações.'
              },
              {
                title: 'Automação',
                description: 'Agende suas publicações e automatize a divulgação.'
              },
              {
                title: 'Análise de Alcance',
                description: 'Acompanhe o desempenho de suas campanhas em tempo real.'
              },
              {
                title: 'Segmentação',
                description: 'Direcione sua divulgação para o público mais relevante.'
              }
            ].map((feature, index) => (
              <div key={index} className="border-l-4 border-indigo-600 pl-4">
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            Planos de Divulgação
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Básico',
                price: 'R$ 99',
                features: [
                  'Redes sociais básicas',
                  'Email marketing limitado',
                  'Templates básicos',
                  'Suporte por email'
                ]
              },
              {
                name: 'Profissional',
                price: 'R$ 199',
                features: [
                  'Todas as redes sociais',
                  'Email marketing ilimitado',
                  'Templates premium',
                  'Suporte prioritário',
                  'Análise avançada'
                ]
              },
              {
                name: 'Enterprise',
                price: 'Personalizado',
                features: [
                  'Solução completa',
                  'Consultoria dedicada',
                  'API exclusiva',
                  'Suporte 24/7',
                  'Recursos personalizados'
                ]
              }
            ].map((plan, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-lg text-center">
                <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                <div className="text-4xl font-bold text-indigo-600 mb-6">{plan.price}</div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="text-gray-600">
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                  Começar Agora
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-indigo-600 rounded-lg shadow-lg p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Precisa de Ajuda com sua Divulgação?
          </h2>
          <p className="text-lg mb-8">
            Nossa equipe está pronta para ajudar você a criar a melhor estratégia de divulgação.
          </p>
          <button className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors">
            Falar com um Especialista
          </button>
        </div>
      </div>
    </div>
  );
}