import React from 'react';
import { TrendingUp, Target, Users, DollarSign, BarChart, ShoppingBag } from 'lucide-react';

export default function Marketing() {
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Marketing e Vendas
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Estratégias eficientes para impulsionar seus eventos católicos e alcançar mais fiéis.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: Target,
              title: 'Segmentação Precisa',
              description: 'Alcance seu público-alvo com estratégias personalizadas para cada tipo de evento.'
            },
            {
              icon: TrendingUp,
              title: 'Análise de Dados',
              description: 'Acompanhe métricas importantes e tome decisões baseadas em dados reais.'
            },
            {
              icon: Users,
              title: 'Engajamento',
              description: 'Construa uma comunidade engajada e aumente a participação em seus eventos.'
            },
            {
              icon: DollarSign,
              title: 'Vendas Otimizadas',
              description: 'Maximize suas vendas com estratégias de precificação e promoções.'
            },
            {
              icon: BarChart,
              title: 'Relatórios Detalhados',
              description: 'Acesse relatórios completos sobre o desempenho de suas campanhas.'
            },
            {
              icon: ShoppingBag,
              title: 'E-commerce',
              description: 'Venda ingressos e produtos relacionados de forma integrada.'
            }
          ].map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center mb-4">
                <feature.icon className="h-8 w-8 text-indigo-600" />
                <h2 className="text-xl font-bold ml-2">{feature.title}</h2>
              </div>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Resultados Comprovados</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { value: '500+', label: 'Eventos Realizados' },
              { value: '50k+', label: 'Participantes' },
              { value: '95%', label: 'Satisfação' },
              { value: '30%', label: 'Aumento em Vendas' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-indigo-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-indigo-600 rounded-lg shadow-lg p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Comece a Impulsionar Seus Eventos Hoje
          </h2>
          <p className="text-lg mb-8">
            Nossa equipe está pronta para ajudar você a alcançar resultados extraordinários.
          </p>
          <button className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors">
            Fale com um Especialista
          </button>
        </div>
      </div>
    </div>
  );
}