# AgroHelp 

**AgroHelp** é uma plataforma voltada para pequenos agricultores, oferecendo um canal direto de comunicação com agrônomos especialistas para auxiliar na identificação de pragas, uso de agrotóxicos e demais dúvidas relacionadas ao cultivo.

##  Tecnologias Utilizadas

- **Next.js** (App Router)
- **React.js**
- **Tailwind CSS**
- **Supabase** (autenticação e armazenamento de imagens)
- **WebRTC + WebSocket** (salas de chamada em tempo real)
- **JavaScript (ESLint, config personalizada)**
- **Docker** (com `.dockerignore`)
- **Vercel** para deploy

##  Estrutura Principal

```
src/
  app/
    login/         -> Página de login
    signup/        -> Cadastro de novo usuário
    dashboard/     -> Visualização de dados e imagens enviadas
    upload/        -> Envio de imagens para análise
    call/          -> Tela para criar ou acessar sala
      [room]/      -> Sala de chamada com chat e upload
```

##  Funcionalidades

-  **Login/Cadastro** com Supabase Auth
-  **Upload de imagens** para análise de plantio e problemas
-  **Dashboard** com visualização personalizada
-  **Sala de conversa em tempo real** com agrônomos (vídeo + chat)
-  **Compartilhamento de arquivos** durante as reuniões

##  Como rodar o projeto

1. Clone o repositório:
```bash
git clone https://github.com/Amandarlima/AgroHelpFront.git
cd AgroHelpFront
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o arquivo `.env.local` com as chaves da Supabase:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

4. Inicie o projeto:
```bash
npm run dev
```

5. Acesse no navegador:
```
http://localhost:3000
```

##  Acesse a versão online

[Plataforma AgroHelp - Deploy Render](https://agrohelpfront-yx9h.onrender.com/login)

##  Público-alvo

- Pequenos e médios produtores rurais
- Agrônomos especializados
- Cooperativas agrícolas

