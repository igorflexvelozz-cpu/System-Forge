# System-Forge

Sistema de análise de SLA para dados logísticos.

## Funcionalidades

- Upload de planilhas Excel (Logmanager e Gestora)
- Processamento automático de dados
- Dashboard com métricas de SLA
- Rankings de vendedores, zonas e CEPs
- Relatórios consolidados
- Histórico de performance

## Tecnologias

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Radix UI
- **Backend**: Python + FastAPI + Firebase Firestore
- **Análise**: Pandas + OpenPyXL

## Instalação e Execução

### Pré-requisitos

- Python 3.8+
- Node.js 18+
- Firebase project com Firestore habilitado

### Configuração

1. Clone o repositório:
   ```bash
   git clone https://github.com/igorflexvelozz-cpu/System-Forge.git
   cd System-Forge
   ```

2. Configure o backend:
   ```bash
   cd server
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   pip install -r requirements.txt
   # Coloque o serviceAccountKey.json do Firebase na pasta server/
   ```

3. Configure o frontend:
   ```bash
   cd ..
   npm install
   ```

### Execução em Desenvolvimento

```bash
npm run dev-full
```

Isso inicia o frontend (porta 5173) e backend (porta 8001) simultaneamente.

### Execução em Produção

1. Build o frontend:
   ```bash
   npm run build
   ```

2. Execute em produção:
   ```bash
   npm run prod
   ```

Isso inicia o frontend build (porta 4173) e backend (porta 8001) simultaneamente.

## Estrutura do Projeto

- `client/`: Código fonte do frontend
- `server/`: Código fonte do backend
- `shared/`: Schemas compartilhados
- `script/`: Scripts auxiliares

## API Endpoints

### Upload
- `POST /api/upload` - Upload de arquivos
- `GET /api/upload/status` - Status dos uploads

### Processamento
- `POST /api/process/start` - Iniciar processamento
- `GET /api/process/status/{job_id}` - Status do processamento

### Dashboard
- `GET /api/dashboard/overview` - Visão geral
- `GET /api/dashboard/sla/*` - Métricas de SLA
- `GET /api/dashboard/delays/*` - Métricas de atrasos

### Rankings
- `GET /api/rankings` - Rankings gerais

### Consolidado
- `GET /api/consolidated` - Dados consolidados

### Histórico
- `GET /api/history/*` - Dados históricos

## Configuração Firebase

1. Crie um projeto no Firebase Console
2. Habilite Firestore
3. Gere uma chave de serviço (serviceAccountKey.json)
4. Coloque o arquivo na pasta `server/`

## Limites

- Tamanho máximo de arquivo: 100MB
- Formatos aceitos: .xlsx, .xls

## Desenvolvimento

- `npm run check` - Verificar TypeScript
- `python -m py_compile server/app/main.py` - Verificar Python

Inicie o backend antes de rodar o Vite dev para evitar erros de proxy (ECONNREFUSED). Exemplos:

- Rodar apenas o frontend:

  ``npm run dev``

- Rodar apenas o backend (na pasta raiz do projeto):

  ``cd server && python run.py``

  By default the server listens on port **8000**. You can override the port used by `server/run.py` with the `BACKEND_PORT` environment variable (eg. `BACKEND_PORT=8001 python run.py`).

- Rodar ambos em paralelo (Windows/Unix):

  ``npm run dev-full``

Defina `VITE_BACKEND_URL` para apontar o proxy para outro endereço (ex: `VITE_BACKEND_URL=http://localhost:8000 npm run dev`). You can also create a `.env.development` file and set `VITE_BACKEND_URL=http://localhost:8000` to avoid the dev warning.

## Produção

O sistema está configurado para produção com:
- Backend FastAPI com múltiplos workers
- Frontend build otimizado
- Proxy configurado para API
- CORS habilitado

Para deploy em produção, considere usar Docker ou serviços como Vercel + Railway.