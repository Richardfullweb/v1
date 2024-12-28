# Meu Evento

Este é o projeto Meu Evento, uma aplicação desenvolvida para gerenciar eventos e agendamentos.

## Funcionalidades
- **Dashboard do Cuidador**: Permite que os cuidadores visualizem e gerenciem seus agendamentos.
- **Dashboard do Cliente**: Permite que os clientes visualizem seus agendamentos e status de pagamento.
- **Sistema de Avaliação**: Os clientes podem avaliar os cuidadores após a conclusão dos serviços.
- **Notificações**: Notificações pendentes são geradas para os cuidadores sobre novos agendamentos.

## Estrutura do Projeto
- **src/**: Contém todos os componentes da aplicação.
  - **components/**: Componentes reutilizáveis da interface do usuário.
  - **Dashboard/**: Contém os dashboards para cuidadores e clientes.
  - **Payments/**: Gerencia o processamento de pagamentos.
  - **notifications/**: Gerencia as notificações pendentes.

## Regras de Segurança do Firestore
As regras de segurança do Firestore estão configuradas para garantir que os usuários autenticados possam acessar e modificar apenas seus próprios dados.

## Como Executar o Projeto
1. Clone o repositório.
2. Instale as dependências com `npm install`.
3. Inicie o servidor de desenvolvimento com `npm run dev`.

## Contribuições
Contribuições são bem-vindas! Sinta-se à vontade para abrir um pull request ou issue para discutir melhorias ou correções.

## Licença
Este projeto está licenciado sob a MIT License.

## Resumo do Sistema

### Regras de Negócio
- **Taxa da Plataforma**: 25% sobre os serviços.
- **Taxas Diferentes**: Não haverá taxas diferentes para diferentes tipos de serviço.
- **Planos para Profissionais**: Não haverá planos diferentes com taxas diferentes.

### Dados Bancários
- **Cadastro de Dados Bancários**: Os cuidadores devem cadastrar seus dados bancários no perfil, com uma aba específica para dados de recebimento.

### Fluxo de Pagamento
- **Valor Mínimo para Pagamentos**: R$100.
- **Opção de Parcelamento**: Sim.
- **Reembolsos**: Cancelamentos devem ser feitos com 24 horas de antecedência.

### Notificações
- **Tipos de Notificações**:
  - Confirmação de pagamento.
  - Status de pagamento (pendente, efetuado, recusado).
- **Acompanhamento de Recebimentos**: Os profissionais poderão acompanhar seus recebimentos pelo painel e no status de pagamento.

### Relatórios
- **Informações nos Relatórios Financeiros**:
  - Visão geral dos pagamentos (mensais, semanais, diários).
  - Visão por cliente e por cuidador.
- **Frequência de Geração de Relatórios**: A definir.

### Fluxo Atualizado e Melhorado
1. **Cliente faz a solicitação**: Escolhe a categoria, analisa detalhes do cuidador, seleciona um profissional e preenche o formulário.
2. **Cuidador recebe a solicitação**: Visualiza detalhes e pode aceitar ou recusar. O cliente é notificado da decisão.
3. **Se aceito**: O cliente é notificado e deve pagar até 24h antes do atendimento.
4. **Após o atendimento**: O cuidador marca o serviço como concluído e o cliente recebe notificação para avaliação.
5. **Pagamento e Avaliação**: O cliente realiza o pagamento e a plataforma retém 10% do valor.

### Ajustes Necessários no Código
1. **Status do Request**: Adicionar novos status (rejected, payment_pending, evaluation_pending).
2. **Sistema de Notificações**: Implementar notificações em tempo real.
3. **Pagamento**: Integrar interface de pagamento e gerenciar splits.
4. **Avaliações**: Lógica para avaliação automática e exibição no dashboard.
5. **Informações de Contato**: Compartilhar após aceite.

### Interface do Sistema
1. **Página de Busca**: Exibir cuidadores disponíveis.
2. **Formulário de Solicitação**: Input para data, hora e detalhes.
3. **Dashboard do Cuidador**: Lista de solicitações recebidas.
4. **Dashboard do Cliente**: Histórico de solicitações.
5. **Sistema de Notificações**: Banner ou modal para eventos importantes.

### Design e Implementação
- **Frameworks e Tecnologias**: React com Tailwind CSS.
- **Interface Moderna e Responsiva**: Design acessível para todos os dispositivos.

### Aspectos Técnicos
- **Stack**: React/TypeScript, Tailwind CSS, Firebase.
- **Segurança**: Autenticação robusta e proteção de dados.

### O Que Já Temos
- **Sistema de Usuários e Perfis**: Implementado.
- **Interface do Usuário**: Design responsivo e componentes reutilizáveis.
- **Sistema de Agendamento**: Funcionalidades básicas implementadas.
- **Dashboards**: Dashboards do Cliente e Cuidador implementados.
- **Sistema de Notificações**: Estrutura básica implementada.
- **Sistema de Pagamentos**: Estrutura de preços definida.
- **Sistema de Avaliações**: Estrutura básica implementada.
- **Área Administrativa**: CRUD de usuários e serviços implementados.
- **Infraestrutura Técnica**: Firebase configurado.

## Próximos Passos
1. Implementar componentes de interface do usuário para:
   - Processamento de pagamento.
   - Envio de avaliações.
   - Exibição aprimorada de notificações.
2. Focar em:
   - Fluxo de agendamento.
   - Melhorias no painel de controle.
   - Recursos de monitoramento para administradores.
