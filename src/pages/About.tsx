import React from 'react';
import { Users, Target, Award, Heart } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Quem Somos
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Somos uma plataforma dedicada a transformar a maneira como eventos católicos são organizados e gerenciados.
          </p>
        </div>

        {/* Mission, Vision, Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <Target className="h-8 w-8 text-indigo-600" />
              <h2 className="text-xl font-bold ml-2">Nossa Missão</h2>
            </div>
            <p className="text-gray-600">
              Facilitar a organização e promoção de eventos católicos, conectando organizadores e participantes em uma plataforma intuitiva e eficiente.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <Award className="h-8 w-8 text-indigo-600" />
              <h2 className="text-xl font-bold ml-2">Nossa Visão</h2>
            </div>
            <p className="text-gray-600">
              Ser a principal referência em gestão de eventos católicos, promovendo a evangelização através da tecnologia.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <Heart className="h-8 w-8 text-indigo-600" />
              <h2 className="text-xl font-bold ml-2">Nossos Valores</h2>
            </div>
            <p className="text-gray-600">
              Fé, Compromisso, Inovação, Comunidade e Excelência em tudo o que fazemos.
            </p>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Nossa Equipe</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'João Silva',
                role: 'Fundador & CEO',
                image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?fit=facearea&facepad=2&w=256&h=256&q=80'
              },
              {
                name: 'Maria Santos',
                role: 'Diretora de Operações',
                image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?fit=facearea&facepad=2&w=256&h=256&q=80'
              },
              {
                name: 'Pedro Oliveira',
                role: 'Líder de Tecnologia',
                image: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?fit=facearea&facepad=2&w=256&h=256&q=80'
              }
            ].map((member, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-lg text-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4"
                />
                <h3 className="text-xl font-semibold">{member.name}</h3>
                <p className="text-gray-600">{member.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center mb-8">Entre em Contato</h2>
          <div className="max-w-2xl mx-auto">
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Mensagem</label>
                <textarea
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Enviar Mensagem
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}