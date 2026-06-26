import api from "./api";

export const getEmpresas = () => api.get("/empresas");
export const getEmpresa = (id) => api.get(`/empresas/${id}`);
export const criarEmpresa = (dados) => api.post("/empresas", dados);
export const atualizarEmpresa = (id, dados) => api.put(`/empresas/${id}`, dados);
export const deletarEmpresa = (id) => api.delete(`/empresas/${id}`);
