const calcularScore = (ultimaDataConclusao) => {
    if (!ultimaDataConclusao) return 100;
    const diffDays = Math.floor((new Date() - new Date(ultimaDataConclusao)) / (1000 * 60 * 60 * 24));
    if (diffDays <= 3) return 20;
    if (diffDays <= 10) return 80;
    return Math.min(95 + (diffDays - 10), 100);
};

module.exports = { calcularScore };
