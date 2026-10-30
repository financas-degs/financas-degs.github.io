# Minhas Finanças — passo a passo para colocar no ar (do zero)

Tudo gratuito. Leva uns 30–40 minutos. Faça no **computador**.
Você vai precisar de: uma conta Google (Gmail) e da pasta do app (o arquivo `minhas-financas.zip`, descompactado).

> **Regra de ouro:** no Firebase, **nunca** clique em "Fazer upgrade" ou "Blaze". O plano grátis (Spark) é suficiente e não pede cartão.

---

## Parte 1 — Criar o projeto no Firebase (a "nuvem" que guarda os dados)

1. Acesse **https://console.firebase.google.com** e entre com sua conta Google.
2. Clique em **Criar um projeto** (ou "Adicionar projeto").
3. Nome: `minhas-financas` → **Continuar**.
4. Na tela do **Google Analytics**, **desative** a chave → **Criar projeto** → espere → **Continuar**.

## Parte 2 — Ativar o login

1. No menu da esquerda: **Criação** (Build) → **Authentication** → **Vamos começar**.
2. Na aba **Método de login**:
   - Clique em **Google** → ative → escolha seu e-mail em "E-mail de suporte" → **Salvar**.
   - Clique em **Adicionar novo provedor** → **E-mail/senha** → ative só a primeira chave → **Salvar**.

## Parte 3 — Criar o banco de dados

1. Menu da esquerda: **Criação** → **Firestore Database** → **Criar banco de dados**.
2. Local: escolha **southamerica-east1 (São Paulo)** → **Próximo**.
3. Escolha **Iniciar no modo de produção** → **Criar**.
4. Quando abrir, vá na aba **Regras**, apague tudo o que estiver lá e cole exatamente isto:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

5. Clique em **Publicar**. (Essas regras garantem que cada pessoa só vê os próprios dados.)

## Parte 4 — Pegar a "chave" do app

1. Clique na **engrenagem** ⚙️ ao lado de "Visão geral do projeto" → **Configurações do projeto**.
2. Role até **Seus apps** → clique no ícone **`</>`** (Web).
3. Apelido: `financas-web`. **Não** marque "Firebase Hosting". → **Registrar app**.
4. Vai aparecer um código com `const firebaseConfig = { apiKey: ..., authDomain: ..., ... }`.
   **Copie só o bloco entre as chaves `{ ... }` e mande para o Claude** — ele coloca no arquivo `firebase-config.js` para você.
   (Ou faça você: abra `firebase-config.js` no Bloco de Notas e troque `null` por esse bloco.)

> Essa "apiKey" não é uma senha: ela fica visível no site de qualquer app Firebase. Quem protege os dados são as regras da Parte 3.

## Parte 5 — Publicar o site no GitHub Pages (grátis)

1. Crie uma conta em **https://github.com** (botão **Sign up**). Escolha um nome de usuário curto, ex.: `degsmorais`.
2. Já logado, clique no **+** no canto superior direito → **New repository**.
3. Repository name: `financas` → marque **Public** → **Create repository**.
4. Na página que abrir, clique no link **uploading an existing file**.
5. Abra a pasta do app descompactada, selecione **todos os arquivos e a pasta `icons`** e arraste para a página. Espere carregar.
6. Clique em **Commit changes**.
7. Vá em **Settings** (aba do repositório) → no menu esquerdo **Pages**.
8. Em "Branch", escolha **main** e pasta **/ (root)** → **Save**.
9. Espere 1–2 minutos e recarregue: aparece "Your site is live at **https://SEU-USUARIO.github.io/financas/**". Esse é o endereço do seu app!

## Parte 6 — Autorizar o endereço no Firebase

1. Volte ao Firebase → **Authentication** → aba **Configurações** → **Domínios autorizados**.
2. **Adicionar domínio** → digite `SEU-USUARIO.github.io` (sem https e sem /financas) → **Adicionar**.

## Parte 7 — Usar!

1. Abra `https://SEU-USUARIO.github.io/financas/` → **Continuar com Google**.
2. **Trazer os dados da planilha antiga (v14):** abra a planilha antiga → engrenagem → **Exportar** (baixa `financas_backup.json`). No app novo: **Ajustes → Importar backup** → escolha o arquivo.
3. **No celular:** abra o mesmo endereço e entre com a mesma conta.
   - Android (Chrome): menu ⋮ → **Instalar app**.
   - iPhone (Safari): botão Compartilhar → **Adicionar à Tela de Início**.
4. **Amigos:** mande o link. Cada um cria a própria conta e vê só os próprios dados.

---

### Para atualizar o app no futuro
No GitHub, abra o repositório → **Add file → Upload files** → arraste os arquivos novos (substituem os antigos) → **Commit changes**. Em 1–2 minutos todos recebem a versão nova.

### Dúvidas comuns
- **"Este endereço ainda não foi autorizado"** → faltou a Parte 6.
- **"Permissão negada"** → confira as regras da Parte 3 e clique em Publicar.
- **Funciona sem internet?** Sim, depois do primeiro acesso. O que você lançar offline é enviado quando a internet voltar.
- **Backup extra:** em Ajustes → Exportar backup, de vez em quando.
