const tarefaModel = require('../models/tarefaModel');

async function findAll(req, res) {
    try {
        // Usamos findAllGeral para não precisar de empresa_id
        const tarefas = await tarefaModel.findAllGeral();
        res.status(200).json(tarefas || []);
    } catch (e) { 
        res.status(500).json({ error: e.message }); 
    }
}

async function create(req, res) {
    try { 
        const t = await tarefaModel.create(req.body); 
        res.status(201).json(t); 
    } catch (e) { 
        res.status(500).json({erro: e.message}); 
    }
}

async function atualizar(req, res) {
    try {
        const t = await tarefaModel.update(req.params.id, req.body);
        res.status(200).json(t);
    } catch (e) { res.status(500).json({erro: e.message}); }
}

async function remove(req, res) {
    try {
        await tarefaModel.remove(req.params.id);
        res.status(200).json({ success: true });
    } catch (e) { res.status(500).json({erro: e.message}); }
}

module.exports = { findAll, create, atualizar, remove };
