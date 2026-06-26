import api from "./api";

export const getPipeline = () => api.get("/pipeline");
export const moverEmpresa = (empresa_id, status_id) =>
  api.patch("/pipeline/mover", { empresa_id, status_id });
