import api from "./api";

export const getFollowup = (dias = 0) => api.get("/followup?dias=" + dias);

