# Firebase Integration - Flex Velozz | ATLAS

## 📋 Visão Geral

Este documento descreve a integração completa do Firebase no projeto System-Forge, incluindo configuração, inicialização e uso de Analytics.

## 🔧 Configuração Implementada

### Frontend (Client)

#### 1. Arquivo de Configuração: `client/src/lib/firebase.ts`

Configuração profissional do Firebase com:
- **Firebase App**: Inicialização singleton
- **Firebase Analytics**: Rastreamento de eventos e page views
- **Firestore**: Banco de dados NoSQL (preparado para uso futuro)
- **Auth**: Autenticação (preparado para uso futuro)
- **Storage**: Armazenamento de arquivos (preparado para uso futuro)

**Credenciais Configuradas:**
- Project ID: `forge-velozz`
- API Key: `AIzaSyB5uM4vjiUQv8zh1y1yUNpJEdDPNdYSxO4`
- Auth Domain: `forge-velozz.firebaseapp.com`
- Storage Bucket: `forge-velozz.firebasestorage.app`
- Measurement ID: `G-WPL85JGSPC`

#### 2. Inicialização: `client/src/main.tsx`

Firebase é inicializado automaticamente antes da renderização da aplicação React.

#### 3. Hooks de Analytics: `client/src/hooks/use-analytics.ts`

Hooks customizados para facilitar o uso de Analytics:

- **`useAnalytics()`**: Hook principal com funções de tracking
  - `trackPageView()`: Rastrear visualizações de página
  - `trackEvent()`: Rastrear eventos customizados
  - `trackUpload()`: Rastrear uploads de arquivos
  - `trackProcessing()`: Rastrear processamento de dados
  - `trackDashboardInteraction()`: Rastrear interações no dashboard
  - `trackExport()`: Rastrear exportações de dados
  - `trackTableInteraction()`: Rastrear interações em tabelas (sort, filter, paginate)
  - `trackChartInteraction()`: Rastrear interações em gráficos
  - `setUserProperty()`: Definir propriedades do usuário

- **`usePageTracking()`**: Hook para rastreamento automático de páginas

#### 4. Sistema de Cache: `client/src/lib/firestore-cache.ts`

Sistema profissional de cache usando Firestore:
- Cache automático de dados do dashboard
- TTL configurável (Time To Live)
- Invalidação automática de cache expirado
- Versionamento de cache para compatibilidade

#### 5. Autenticação: `client/src/lib/auth.ts` e `client/src/hooks/use-auth.ts`

Sistema completo de autenticação:
- Login com email/senha
- Cadastro de novos usuários
- Login com Google
- Recuperação de senha
- Gerenciamento de estado de autenticação
- Hook React para uso fácil (`useAuth()`)

### Backend (Server)

#### 1. Configuração: `server/app/config/firebase.py`

O backend usa **Firebase Admin SDK** para operações server-side:
- Inicialização lazy (não quebra se credenciais não estiverem disponíveis)
- Tratamento robusto de erros
- Suporte para desenvolvimento local sem credenciais

#### 2. Repositório Firestore: `server/app/repositories/firestore.py`

Repositório profissional com:
- Tratamento completo de exceções (não gera 500 errors)
- Métodos assíncronos para todas operações CRUD
- Retorno seguro em caso de falhas do Firestore

## 📊 Eventos Rastreados

### Eventos Automáticos

1. **Page Views** (`page_view`)
   - Rastreado automaticamente em todas as páginas
   - Parâmetros: `page_title`, `page_path`, `page_location`

### Eventos Customizados

2. **File Upload** (`file_upload`)
   - Rastreado na página de upload
   - Parâmetros: `file_type`, `success`, `file_size`, `error`

3. **Data Processing** (`data_processing`)
   - Rastreado durante processamento de planilhas
   - Parâmetros: `status`, `duration`, `error`

4. **Dashboard Interaction** (`dashboard_interaction`)
   - Rastreado em interações do dashboard (filtros, mudanças de modo)
   - Parâmetros: `action`, `component`, `details`

5. **Export** (`export`, `export_started`, `export_completed`, `export_failed`)
   - Rastreado em exportações de dados
   - Parâmetros: `export_type`, `format`, `success`, `file_size`, `record_count`, `error`

6. **Table Interaction** (`table_interaction`)
   - Rastreado automaticamente em todas as tabelas
   - Parâmetros: `action` (sort/filter/paginate/search), `table_name`, `details`

7. **Chart Interaction** (`chart_interaction`)
   - Preparado para rastrear interações em gráficos
   - Parâmetros: `action`, `chart_type`, `details`

8. **User Authentication** (`user_login`, `user_signup`, `user_logout`, `password_reset_requested`)
   - Rastreado em eventos de autenticação
   - Parâmetros: `method`, `user_id`, `error`

## 🚀 Como Usar

### Rastrear Eventos em Componentes

```typescript
import { useAnalytics } from "@/hooks/use-analytics";

function MyComponent() {
  const analytics = useAnalytics();
  
  const handleClick = () => {
    analytics.trackEvent("button_click", {
      button_name: "submit",
      page: "upload"
    });
  };
  
  return <button onClick={handleClick}>Submit</button>;
}
```

### Rastrear Page Views

```typescript
import { usePageTracking } from "@/hooks/use-analytics";

export default function MyPage() {
  usePageTracking("Nome da Página", "/caminho");
  
  return <div>...</div>;
}
```

### Rastrear Uploads

```typescript
const analytics = useAnalytics();

analytics.trackUpload("logmanager", true, file.size);
// ou em caso de erro:
analytics.trackUpload("gestora", false, file.size, error.message);
```

## 📁 Estrutura de Arquivos

```
client/
├── src/
│   ├── lib/
│   │   ├── firebase.ts          # Configuração e inicialização Firebase
│   │   ├── firestore-cache.ts   # Sistema de cache com Firestore
│   │   └── auth.ts               # Autenticação Firebase
│   ├── hooks/
│   │   ├── use-analytics.ts     # Hooks de Analytics
│   │   ├── use-auth.ts          # Hook de autenticação
│   │   └── use-cached-query.ts  # Hook para queries com cache
│   ├── components/
│   │   ├── auth/
│   │   │   └── auth-provider.tsx # Provider de contexto de autenticação
│   │   └── dashboard/
│   │       └── data-table.tsx   # Tabela com tracking integrado
│   ├── pages/
│   │   ├── upload.tsx           # ✅ Analytics integrado
│   │   ├── overview.tsx         # ✅ Analytics integrado
│   │   ├── sla-performance.tsx  # ✅ Analytics integrado
│   │   ├── delays.tsx           # ✅ Analytics integrado
│   │   ├── sellers.tsx         # ✅ Analytics integrado
│   │   ├── zones.tsx           # ✅ Analytics integrado
│   │   ├── rankings.tsx        # ✅ Analytics integrado
│   │   ├── historical.tsx      # ✅ Analytics integrado
│   │   └── consolidated-base.tsx # ✅ Analytics integrado
│   └── main.tsx                 # Inicialização do Firebase

server/
├── app/
│   ├── config/
│   │   └── firebase.py          # Configuração Admin SDK
│   └── repositories/
│       └── firestore.py         # Repositório Firestore
```

## ✅ Páginas Integradas

- ✅ **Upload Page** (`/upload`): Rastreia uploads e processamento
- ✅ **Overview Page** (`/`): Rastreia visualizações
- ✅ **SLA Performance** (`/sla-performance`): Rastreia visualizações e filtros
- ✅ **Delays** (`/atrasos`): Rastreia visualizações
- ✅ **Sellers** (`/vendedores`): Rastreia visualizações
- ✅ **Zones** (`/zonas`): Rastreia visualizações
- ✅ **Rankings** (`/rankings`): Rastreia visualizações
- ✅ **Historical** (`/historico`): Rastreia visualizações e mudanças de modo de comparação
- ✅ **Consolidated Base** (`/base-consolidada`): Rastreia visualizações e exportações

## 🔒 Segurança

- Credenciais do Firebase estão no código (padrão para frontend)
- Backend usa service account key (não commitado no Git)
- Tratamento robusto de erros em todas as operações
- Não quebra a aplicação se Firebase estiver indisponível

## 🎯 Funcionalidades Implementadas

### ✅ Analytics Completo
- ✅ Todas as páginas rastreiam page views automaticamente
- ✅ Eventos de upload e processamento rastreados
- ✅ Interações em tabelas rastreadas (sort, filter, paginate, search)
- ✅ Exportações rastreadas com detalhes completos
- ✅ Filtros e mudanças de modo rastreados

### ✅ Sistema de Cache
- ✅ Cache automático usando Firestore
- ✅ TTL configurável por endpoint
- ✅ Invalidação automática de cache expirado
- ✅ Hook `useCachedQuery` para uso fácil

### ✅ Autenticação
- ✅ Login com email/senha
- ✅ Cadastro de usuários
- ✅ Login com Google
- ✅ Recuperação de senha
- ✅ Hook `useAuth` para gerenciamento de estado
- ✅ Provider de contexto para toda a aplicação

## 📈 Próximos Passos (Opcional)

1. ✅ ~~Integrar Analytics em todas as páginas restantes~~ **CONCLUÍDO**
2. ✅ ~~Adicionar rastreamento de interações no dashboard~~ **CONCLUÍDO**
3. ✅ ~~Implementar autenticação com Firebase Auth~~ **CONCLUÍDO**
4. ✅ ~~Usar Firestore para cache de dados~~ **CONCLUÍDO**
5. Criar componentes de UI para autenticação (login/signup forms)
6. Implementar proteção de rotas baseada em autenticação
7. Usar Firebase Storage para uploads de arquivos grandes (opcional)
8. Adicionar mais eventos customizados conforme necessário

## 🐛 Troubleshooting

### Firebase não inicializa
- Verifique se as credenciais estão corretas em `firebase.ts`
- Verifique o console do navegador para erros

### Analytics não funciona
- Verifique se o Measurement ID está correto
- Verifique se o Analytics está habilitado no Firebase Console
- Verifique o console para warnings

### Erros 500 no backend
- Verifique se `serviceAccountKey.json` existe e é válido
- Verifique se o project_id corresponde ao Firebase Console
- Os erros são tratados graciosamente, mas verifique os logs

## 📚 Documentação Adicional

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Analytics](https://firebase.google.com/docs/analytics)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

---

**Última atualização**: Dezembro 2025
**Versão**: 1.0.0
