# services/

Pasta destinada à camada de regras de negócio, posicionada entre os controllers e os models.

É aqui que ficam validações mais complexas, orquestração de múltiplas operações (ex: ao mudar o status de uma empresa, também gravar uma linha em `historico_status`) e qualquer lógica que não seja nem "lidar com HTTP" (controller) nem "rodar uma query" (model).

Conteúdo previsto, um arquivo por entidade do `data-model.md`:
- `empresaService.js`
- `contatoService.js`
- `statusProspeccaoService.js`
- `tarefaService.js`
- `observacaoService.js`
- `historicoInteracaoService.js`

Esta pasta ainda está vazia propositalmente — será populada quando construirmos a primeira entidade de ponta a ponta.
