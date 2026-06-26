import api from "./api";

export const getContatos = (empresa_id) => api.get("/contatos?empresa_id=" + empresa_id);
export const criarContato = (dados) => api.post("/contatos", dados);
export const atualizarContato = (id, dados) => api.put("/contatos/" + id, dados);
export const deletarContato = (id) => api.delete("/contatos/" + id);
