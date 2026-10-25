# Links do Zak

Bio responsiva inspirada em [linksgiobrandi.com.br](https://linksgiobrandi.com.br/), com painel em `/admin`. A configuração inicial reproduz o conteúdo e as imagens da referência; substitua tudo no painel para personalizar sua identidade.

## O que pode ser editado

- Nome, arroba, biografia e selo.
- Avatar, logotipo e capas independentes para computador e celular. Envio de PNG, JPG e WebP com otimização automática, ou endereço HTTPS.
- Recorte visual ao enviar uma imagem ou em “Ajustar enquadramento”: arraste com mouse/toque, ajuste zoom e posição, escolha 1:1, 16:9, 4:5, 9:16 ou a proporção original. A foto de perfil usa 1:1 com guia circular. Aplicar salva uma imagem recortada sem distorção; cancelar mantém a imagem anterior. Para repetir o recorte a partir do arquivo original, envie esse arquivo novamente. URLs externas precisam permitir CORS para recorte; o painel explica quando é necessário enviar o arquivo.
- Links: título, descrição, URL, ícone visual, destaque, atividade, rastreamento, visibilidade e exclusão com confirmação.
- Ordem por arrastar e soltar, com suporte ao teclado e botões para mover.
- Cores do fundo e dos destaques, animações e UTMs.
- Blocos de contexto, seus títulos, textos e ícones; chamada final; botão fixo no celular; direitos autorais e rodapé.
- Prévia em iframe que executa o mesmo componente e CSS do site público, em tamanhos de celular e computador. As alterações aparecem antes do salvamento.

Salvamento automático após 800 ms de pausa, requisições serializadas e controle de versão impedem sobrescrever alterações de outra sessão. Erros são apresentados no painel e permitem baixar um backup das alterações não salvas. O site público acompanha os salvamentos em outras abas e consulta alterações a cada 10 segundos.

## Desenvolvimento

Use Node.js 22 ou 24.

```sh
npm ci
npm run setup
npm run dev
```

O assistente de configuração pede a senha inicial e cria `.env.local`, ignorado pelo Git. Nunca publique esse arquivo. Para o primeiro acesso use o login definido em `ADMIN_LOGIN`. A senha solicitada pelo proprietário foi configurada fora do repositório.

Sem serviço de armazenamento, o desenvolvimento local usa `.data/config.json` com gravação atômica. Em Vercel o aplicativo recusa alterações se não houver armazenamento durável configurado.

## Vercel

Importe este repositório com o preset Next.js e nome de projeto `linksdozak` para obter `linksdozak.vercel.app`, sujeito à disponibilidade.

Crie um **Vercel Blob privado**, conecte ao projeto e habilite o ambiente Production. O código utiliza `BLOB_READ_WRITE_TOKEN`, ou `BLOB_STORE_ID` com OIDC. O arquivo privado `bio/config.json` armazena as configurações e imagens. Leituras sem cache e gravações condicionais por ETag preservam consistência entre instâncias. Tokens e dados privados nunca vão para o cliente. O armazenamento segue os limites e cobrança do plano Vercel.

Defina também os segredos do servidor:

| Variável | Uso |
| --- | --- |
| `ADMIN_LOGIN` | Login inicial, normalmente `admin` |
| `ADMIN_PASSWORD_HASH` | Hash scrypt gerado pelo setup, nunca a senha em texto |
| `SESSION_SECRET` | Segredo aleatório de pelo menos 32 caracteres |
| `BLOB_READ_WRITE_TOKEN` | Acesso ao Blob privado; fornecido ao conectar o armazenamento |

Como alternativa, defina `DATABASE_URL` para PostgreSQL. O esquema é criado automaticamente no primeiro acesso. SSL é obrigatório; `DATABASE_SSL=disable` é exclusivo para banco local de desenvolvimento. Quando Blob está configurado ele tem prioridade sobre PostgreSQL.

Após alterar variáveis de ambiente, faça um novo deploy. Acesse `/admin` e confirme um salvamento antes de divulgar o endereço. Rotacione a senha executando o setup em uma pasta limpa e atualizando o hash na Vercel; isso invalida as sessões anteriores. Os dados existentes permanecem.

## Segurança e testes

Senhas com scrypt e salt, comparação em tempo constante, sessão assinada com validade de 8 horas e cookie HttpOnly/Secure/SameSite Strict em produção, verificação de origem, limites persistentes de tentativas de login, validação de URLs, imagens e tamanho de requisição. As permissões de escrita são verificadas em todos os endpoints de alteração. `/admin` entrega uma interface de login pública, mas somente uma sessão válida pode ler configurações ocultas ou salvar. A prévia não habilita edição pública. Uma sessão copiada permanece válida até expirar ou até rotacionar o segredo/hash; encerrar a sessão remove o cookie do navegador.

```sh
npm test
npm run build
npm audit --omit=dev
```

O teste HTTP também roda quando `TEST_ADMIN_PASSWORD` está definido no ambiente e o site está iniciado. `TEST_BASE_URL` seleciona o destino. O teste modifica configurações temporariamente e restaura a configuração anterior ao terminar. Execute em ambiente de teste sem outros editores conectados.

## Recursos visuais

As imagens, proporções e CSS públicos da referência foram usados para atender à fidelidade solicitada. Use apenas materiais que você esteja autorizado a publicar. Os ícones adicionais usam Lucide (ISC). Os efeitos incluem luzes de fundo, parallax, zoom suave na capa, aro giratório, brilho nos CTAs, entradas em cascata, indicadores de atividade e estados de hover. A preferência do sistema por movimento reduzido é respeitada.

As fotos enviadas ficam incorporadas na configuração com limite total de 4 MB por salvamento. Links externos abrem em nova aba. O site mantém os destinos originais até serem alterados no painel.

A entrada da página combina blur leve e fade por 1,5 segundo. Os cartões sobem suavemente durante cerca de 2,1 segundos ao entrar na tela, com pequenos atrasos em sequência. Esses efeitos acompanham a opção de animações do painel e a preferência do sistema por movimento reduzido.
