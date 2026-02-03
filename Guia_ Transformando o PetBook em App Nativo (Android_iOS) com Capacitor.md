# Guia: Transformando o PetBook em App Nativo (Android/iOS) com Capacitor

Para transformar sua aplicação React em um aplicativo nativo, o **Capacitor** é a melhor escolha. Abaixo, comparo as duas formas de fazer isso e forneço o passo a passo.

---

## 1. Qual abordagem escolher?

Existem dois caminhos principais para usar o Capacitor com uma aplicação que já está na Vercel:

### Opção A: Local Build (Recomendada para Performance)
Nesta opção, você gera os arquivos estáticos do seu projeto (`npm run build`) e o Capacitor os empacota dentro do aplicativo.
*   **Vantagens**: Cache local real, o app abre instantaneamente, funciona offline (se configurado), navegação muito mais rápida e aceitação garantida nas lojas (Apple/Google).
*   **Desvantagens**: Para atualizar o app, você precisa gerar uma nova versão e enviar para a loja (ou usar ferramentas como Live Updates).

### Opção B: Web View Direta (URL da Vercel)
Nesta opção, o aplicativo nativo funciona como um "navegador dedicado" que abre `https://www.petbook.fun`.
*   **Vantagens**: Qualquer mudança que você fizer no código e subir para a Vercel reflete instantaneamente no aplicativo sem precisar de atualização na loja.
*   **Desvantagens**: Depende 100% de internet, performance levemente inferior ao carregamento local e **risco de rejeição na Apple App Store** (eles podem alegar que o app é apenas um "site em um container").

> **Minha recomendação**: Use a **Opção A (Local Build)** para a versão final de produção para garantir a melhor experiência e aceitação nas lojas. Use a **Opção B** apenas para testes rápidos.

---

## 2. Passo a Passo da Implementação (Opção A)

### Passo 1: Instalar o Capacitor
Na raiz do seu projeto, execute:
```bash
npm install @capacitor/core @capacitor/cli
```

### Passo 2: Inicializar o Capacitor
```bash
npx cap init PetBook com.petbook.fun --web-dir dist
```
*Nota: Use `dist` porque é a pasta padrão de build do Vite.*

### Passo 3: Adicionar as Plataformas
```bash
npm install @capacitor/android @capacitor/ios
npx cap add android
npx cap add ios
```

### Passo 4: Fluxo de Desenvolvimento
Toda vez que você fizer uma alteração no código e quiser ver no App:
1. Gere o build do React: `npm run build`
2. Sincronize com o Capacitor: `npx cap copy`
3. Abra o projeto nativo: `npx cap open android` ou `npx cap open ios`

---

## 3. Dicas de Ouro para o PetBook Mobile

### Splash Screen e Ícones
Para que o app pareça profissional, você precisará de ícones e telas de abertura. Use o recurso `cordova-res` ou o `@capacitor/assets` para gerar todos os tamanhos automaticamente a partir de uma única imagem.

### Ajuste de SafeArea (iOS)
Como seu app tem um rodapé (Bottom Nav), em iPhones novos ele pode ficar "atrás" da barra de navegação do sistema. Adicione isso ao seu `index.css`:
```css
body {
  padding-bottom: env(safe-area-inset-bottom);
  padding-top: env(safe-area-inset-top);
}
```

### Push Notifications
Para notificações nativas (como quando um pet recebe um abraço), você precisará configurar o Firebase (Android) e APNs (iOS) usando o plugin `@capacitor/push-notifications`.

### Cache de Imagens
Como o PetBook tem muitas fotos de pets, a navegação ficará muito mais fluida se você usar um sistema de cache. O Capacitor já lida bem com o cache padrão do navegador, mas para algo mais robusto, você pode considerar transformar o app em um **PWA** antes de empacotar com Capacitor.

---

## 4. Como configurar a Opção B (URL Direta)
Se você realmente quiser que o app apenas abra o link da Vercel, altere o arquivo `capacitor.config.json` (ou `.ts`) que será criado na raiz:

```json
{
  "appId": "com.petbook.fun",
  "appName": "PetBook",
  "webDir": "dist",
  "server": {
    "url": "https://www.petbook.fun",
    "cleartext": true
  }
}
```
*Atenção: Ao usar `server.url`, o Capacitor ignora os arquivos locais e carrega o site diretamente.*
