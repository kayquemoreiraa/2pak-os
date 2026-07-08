import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const fetchFollowups = async () => {
  const token = localStorage.getItem('2pakos_token');
  const { data } = await axios.get('http://localhost:3000/api/v1/crm/tarefas/geral', {
    headers: { Authorization: \Bearer \\ }
  });
  return data;
};

export default function Followup() {
  const { data: tarefas, isLoading, error } = useQuery({
    queryKey: ['followups'],
    queryFn: fetchFollowups
  });

  if (isLoading) return <div className="cortex-loading">Carregando prioridades...</div>;
  if (error) return <div className="cortex-error">Erro ao carregar follow-ups.</div>;

  return (
    <div className="cortex-container">
      <h2 className="cortex-title">Follow-up Inteligente</h2>
      <div className="cortex-list">
        {tarefas && tarefas.map((t) => (
          <div key={t.id} className={\cortex-card \\}>
            <span className="cortex-empresa">{t.empresa_nome}</span>
            <span className="cortex-score">Score: {t.score}</span>
            <p className="cortex-titulo">{t.titulo}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
