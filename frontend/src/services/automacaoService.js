import api from "./api";

export const getAutomacoes      = ()          => api.get("/automacoes");
export const getEventos         = ()          => api.get("/automacoes/eventos");
export const getLogs            = ()          => api.get("/automacoes/logs");
export const criarAutomacao     = (dados)     => api.post("/automacoes", dados);
export const atualizarAutomacao = (id, dados) => api.put("/automacoes/" + id, dados);
export const deletarAutomacao   = (id)        => api.delete("/automacoes/" + id);

