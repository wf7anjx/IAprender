# Guia de Configuração do Firebase para IAPrender Web

Este guia detalha os passos necessários para configurar seu projeto Firebase e integrá-lo à aplicação web IAPrender, garantindo que as funcionalidades de autenticação, salvamento de progresso e chat funcionem corretamente.

## Passo 1: Criar um Projeto Firebase

1.  Acesse o [Firebase Console](https://console.firebase.google.com/).
2.  Faça login com sua conta Google.
3.  Clique em "Adicionar projeto" ou "Criar um projeto" para iniciar um novo projeto.
4.  Siga as instruções na tela para nomear seu projeto (ex: `iaprender-app`) e configurar as opções do Google Analytics (você pode desativar se não for usar).
5.  Clique em "Criar projeto". Aguarde a conclusão do processo.

## Passo 2: Adicionar um Aplicativo Web ao Projeto Firebase

1.  Após a criação do projeto, na tela de visão geral do projeto, clique no ícone `</>` (Web) para adicionar um aplicativo web.
2.  Registre seu aplicativo. Você pode dar um apelido (ex: `IAPrender Web App`).
3.  **Marque a caixa "Configurar o Firebase Hosting para este app" se você planeja usar o Firebase Hosting no futuro.** Por enquanto, não é estritamente necessário para rodar localmente.
4.  Clique em "Registrar app".

## Passo 3: Obter as Credenciais de Configuração do Firebase

Após registrar o aplicativo web, você verá um objeto `firebaseConfig`. **Copie este objeto completo**, pois ele contém as credenciais que você precisará para o seu projeto IAPrender Web.

Exemplo:

```javascript
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_AUTH_DOMAIN",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_STORAGE_BUCKET",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  appId: "SEU_APP_ID"
};
```

## Passo 4: Habilitar o Firebase Authentication (Email/Senha)

1.  No menu lateral esquerdo do Firebase Console, em "Build", clique em `Authentication`.
2.  Clique em "Começar".
3.  Na aba "Método de login", clique em `Email/Senha`.
4.  Ative a opção `Email/Senha` e clique em "Salvar".

## Passo 5: Habilitar o Firestore Database

1.  No menu lateral esquerdo do Firebase Console, em "Build", clique em `Firestore Database`.
2.  Clique em "Criar banco de dados".
3.  Selecione "Iniciar no modo de teste" (para desenvolvimento e testes rápidos) ou "Iniciar no modo de produção" (se já souber como configurar as regras de segurança). Para este projeto, o modo de teste é suficiente inicialmente, mas **lembre-se de que ele não é seguro para produção**.
4.  Escolha a localização do seu Cloud Firestore (região mais próxima de você ou de seus usuários).
5.  Clique em "Ativar".

## Passo 6: Configurar Regras de Segurança do Firestore

Se você iniciou no modo de produção ou se as regras padrão não permitirem a escrita, você precisará ajustá-las. Vá para a aba `Regras` no Firestore Database e adicione regras que permitam a leitura e escrita na coleção `users` (e outras coleções que o app usará, como `chats`, `tasks`, `taskSubmissions`, `userProgress`).

**Exemplo de regras para a coleção `users` (para teste - não recomendado para produção sem mais restrições):**

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
    match /chats/{userId}/{documents=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /tasks/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
    }
    match /taskSubmissions/{document=**} {
      allow read, write: if request.auth != null;
    }
    match /userProgress/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Lembre-se de que as regras acima são permissivas para fins de teste. Para um ambiente de produção, você deve implementar regras de segurança mais robustas.**

## Passo 7: Criar Usuário de Teste (Opcional, mas recomendado)

Para testar a área do professor, você pode criar um usuário de teste e definir seu papel como `teacher`:

1.  No Firebase Console, vá para `Authentication`.
2.  Clique na aba `Usuários`.
3.  Clique em "Adicionar usuário".
4.  Insira o email `professor2@gmail.com` e a senha `123456@` (ou as credenciais que desejar).
5.  Clique em "Adicionar usuário".

Depois de criar o usuário, você precisará ir no Firestore Database, na coleção `users`, encontrar o documento desse usuário (o ID do documento é o UID do usuário) e adicionar um campo `role` com o valor `teacher`.

Com todas essas configurações prontas, você terá seu ambiente Firebase preparado para o projeto IAPrender Web!

