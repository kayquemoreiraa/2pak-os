import api from "./api";

export const getTarefas = (empresa_id) => api.get(`/tarefas?empresa_id=${empresa_id}`);
export const getTarefasGeral = () => api.get("/tarefas/geral");
export const criarTarefa = (dados) => api.post("/tarefas", dados);
export const atualizarTarefa = (id, dados) => api.put(`/tarefas/${id}`, dados);
export const deletarTarefa = (id) => api.delete(`/tarefas/${id}`);
