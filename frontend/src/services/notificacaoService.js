import api from "./api";

export const getNotificacoes    = ()    => api.get("/notificacoes");
export const marcarLida         = (id)  => api.patch("/notificacoes/" + id + "/lida");
export const marcarTodasLidas   = ()    => api.patch("/notificacoes/todas/lidas");

