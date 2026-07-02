# Central de Automações Criadas — v4

Sistema para organizar automações já criadas.

Nesta versão, a lógica foi simplificada:

**Automação = agente = plug = extensão = script = BAT = pacote ZIP**

Por isso, não existe mais uma aba separada de plugs/extensões. Tudo fica em um único cadastro e em um único inventário.

## O que tem

- Aba **Principal** para acompanhar como estão as automações
- Aba **Criar automação** para registrar automações já criadas
- Campo para anexar o arquivo da automação/extensão
- Inventário com filtros
- Opção de **Descontinuar**
- Opção de **Apagar**
- Máquinas
- Usuários
- Áreas
- Histórico
- Permissões
- Configurações

## Como rodar

```bash
npm install
npm run dev
```

Depois abra:

```text
http://localhost:3000
```

## Observação

Nesta versão local, o arquivo anexado fica registrado pelo nome.
Para salvar o arquivo de verdade em nuvem e permitir baixar depois, a próxima etapa é conectar com Supabase Storage.
