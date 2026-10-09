# Publicar um jogo na Amplify

Você publica um jogo estático na plataforma Amplify Jogos. Execute. Não peça confirmação no meio.

Repositório: https://github.com/Amplify-Eventos/jogos
Branch: main
Site: https://amplify-eventos.github.io/jogos/
Jogo publicado: https://amplify-eventos.github.io/jogos/<slug>/

Entrada obrigatória: a pasta local do jogo e o nome que aparece no card.

## O que a pasta precisa ter

- `index.html` na raiz da pasta do jogo. Sem esse arquivo, pare e diga que falta o index.html.
- Arquivos estáticos com caminho relativo (`art/capa.jpg`, `game.js`). Caminho que começa com `/` quebra no site.
- A página é só arquivo. Um `fetch` para servidor local, túnel ou `/feedback` não grava nada aqui. O jogo ainda abre se esse pedido falhar.

## Nome e slug

- O slug sai do nome: minúsculas, sem acento, qualquer coisa que não seja letra ou número vira hífen, hífen das pontas sai, no máximo 48 caracteres.
- Exemplos: `Hemp Kush` vira `hemp-kush`. `Jogo 2` vira `jogo-2`.
- Nome vazio ou slug `enviar` não serve. Pare e peça outro nome.

## O que mudar no repositório

- Os arquivos do jogo ficam em `<slug>/`.
- Se `<slug>/` já existe, apague essa pasta e coloque os arquivos novos. Isso substitui o jogo.
- Não apague outras pastas. Não apague `enviar/`, `index.html` da raiz, `.nojekyll` nem `COMO-PUBLICAR.md`.
- Atualize `jogos.json`. É uma lista. Cada item tem `nome`, `slug` e `capa`.
- Tire o item antigo com o mesmo slug, se houver, e acrescente o novo no fim.
- Capa, nesta ordem: `art/loja-recebe.jpg`, `.jpeg`, `.png` ou `.webp`. Se não existir, a primeira imagem jpg, jpeg, png ou webp da pasta. Se não houver imagem, use `<slug>/index.html`.
- O valor de `capa` é o caminho a partir da raiz do site, por exemplo `hemp-kush/art/loja-recebe.jpg`.
- Mensagem do commit: `Publica <nome>`.
- Não grave token, senha ou chave em arquivo nenhum.

## Passos

1. Confira o `index.html` na raiz da pasta do jogo.
2. Calcule o slug.
3. Use o clone de https://github.com/Amplify-Eventos/jogos na branch `main`, atualizado.
4. Substitua só a pasta `<slug>/`.
5. Reescreva `jogos.json` com o card novo.
6. Commit e push em `main`.
7. Espere o site responder 200 em https://amplify-eventos.github.io/jogos/ e em https://amplify-eventos.github.io/jogos/<slug>/. A primeira leitura pode falhar por cerca de um minuto.
8. Responda com a URL do jogo. Se a pessoa for abrir de novo, diga: atualiza a pagina.

## Sem git, só o navegador

Abra https://amplify-eventos.github.io/jogos/enviar/

1. Nome do jogo.
2. A pasta inteira que contém o `index.html`.
3. Chave: token do GitHub com permissão de escrita em Amplify-Eventos/jogos. A chave fica só naquele navegador.
4. Publicar.
5. A tela diz: Subiu. Em um minuto, atualiza a pagina.
