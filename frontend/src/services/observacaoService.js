import api from "./api";

export const getObservacoes = (empresa_id) => api.get("/observacoes?empresa_id=" + empresa_id);
export const criarObservacao = (dados) => api.post("/observacoes", dados);
export const atualizarObservacao = (id, dados) => api.put("/observacoes/" + id, dados);
export const deletarObservacao = (id) => api.delete("/observacoes/" + id);

