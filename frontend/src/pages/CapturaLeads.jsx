import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { buscarLeadsNoMaps, importarLeadsEmMassa } from '../services/scraperService';
import Input from '../components/ui/Input';

export default function CapturaLeads() {
    const [termo, setTermo] = useState('');
    const [limite, setLimite] = useState(5);
    const [resultados, setResultados] = useState([]);
    const [mensagem, setMensagem] = useState('');
    const queryClient = useQueryClient();

    const mutationBuscar = useMutation({
        mutationFn: ({ termo, limite }) => buscarLeadsNoMaps(termo, limite),
        onSuccess: (data) => {
            setResultados(data.empresas);
            setMensagem(`${data.empresas.length} empresas encontradas!`);
        },
        onError: () => setMensagem('Erro ao buscar empresas.')
    });

    const mutationImportar = useMutation({
        mutationFn: (dados) => importarLeadsEmMassa(dados),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['empresas'] });
            setMensagem('Leads importados com sucesso!');
            setResultados([]);
        },
        onError: () => setMensagem('Erro ao importar leads.')
    });

    const handleBuscar = (e) => {
        e.preventDefault();
        if (termo.trim() !== '') {
            setMensagem('Buscando...');
            mutationBuscar.mutate({ termo, limite });
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-cortex-text mb-6">Captura de Leads</h1>
            
            <div className="cortex-card p-6 mb-6">
                <form onSubmit={handleBuscar} className="flex gap-4 items-end">
                    <div className="flex-1">
                        <Input 
                            label="O que deseja buscar?" 
                            value={termo} 
                            onChange={(e) => setTermo(e.target.value)} 
                            placeholder="Ex: Barbearia em Itaborai"
                        />
                    </div>
                    <div className="w-24">
                        <Input 
                            type="number"
                            label="Qtd" 
                            value={limite} min="1" className="bg-cortex-800 text-cortex-light border border-cortex-border rounded-lg px-3 py-2 w-24 focus:outline-none focus:border-cortex-primary transition-colors text-center font-medium" 
                            onChange={(e) => setLimite(Math.max(1, Number(e.target.value)))} 
                        />
                        {limite > 20 && (
                            <p className="text-[10px] text-yellow-600 mt-1 font-semibold">
                                &gt;20 pode demorar
                            </p>
                        )}
                    </div>
                    <button type="submit" disabled={mutationBuscar.isPending} className="cortex-btn-primary h-[42px] px-6">
                        {mutationBuscar.isPending ? '...' : 'Pesquisar'}
                    </button>
                </form>
                {mensagem && <p className="mt-4 text-sm text-cortex-primary font-medium">{mensagem}</p>}
            </div>

            {resultados.length > 0 && (
                <div className="cortex-card p-6 animate-fade-in">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-cortex-text">Resultados ({resultados.length})</h2>
                        <button onClick={() => mutationImportar.mutate(resultados)} className="cortex-btn-primary">
                            Importar Tudo
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {resultados.map((empresa, idx) => (
                            <div key={idx} className="p-4 border border-cortex-border rounded-md hover:border-cortex-primary transition-all">
                                <p className="font-medium text-cortex-text">{empresa.nome_fantasia}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

