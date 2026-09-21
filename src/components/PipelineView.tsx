import React from 'react';
import { LeadTarget, LeadStatus } from '../types';
import { 
  Building2, 
  Home, 
  Hotel, 
  MessageSquare, 
  DollarSign, 
  Send, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface PipelineViewProps {
  leads: LeadTarget[];
  onStatusChange: (leadId: string, newStatus: LeadStatus) => void;
  onGeneratePitch: (lead: LeadTarget) => void;
  onInvestigate: (lead: LeadTarget) => void;
}

export const PipelineView: React.FC<PipelineViewProps> = ({
  leads,
  onStatusChange,
  onGeneratePitch,
  onInvestigate
}) => {
  const columns: { id: LeadStatus; label: string; color: string }[] = [
    { id: 'novo', label: '1. Novos Alvos', color: 'border-blue-500/50 bg-blue-500/5 text-blue-300' },
    { id: 'contatado', label: '2. Contatados', color: 'border-amber-500/50 bg-amber-500/5 text-amber-300' },
    { id: 'visita_agendada', label: '3. Visita Noturna Agendada', color: 'border-purple-500/50 bg-purple-500/5 text-purple-300' },
    { id: 'proposta_enviada', label: '4. Proposta Apresentada', color: 'border-cyan-500/50 bg-cyan-500/5 text-cyan-300' },
    { id: 'fechado', label: '5. Fechado / Contrato', color: 'border-emerald-500/50 bg-emerald-500/5 text-emerald-300' }
  ];

  return (
    <div className="overflow-x-auto pb-6">
      <div className="flex gap-4 min-w-[1100px]">
        {columns.map((col) => {
          const colLeads = leads.filter((l) => l.status === col.id);
          return (
            <div
              key={col.id}
              className="flex-1 min-w-[240px] bg-slate-900/60 border border-slate-800 rounded-2xl p-3 flex flex-col"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-800">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${col.color}`}>
                  {col.label}
                </span>
                <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                  {colLeads.length}
                </span>
              </div>

              {/* Lead Cards List */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
                {colLeads.length === 0 ? (
                  <div className="text-center py-8 text-slate-600 text-xs italic">
                    Nenhum imóvel nesta etapa
                  </div>
                ) : (
                  colLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/30 rounded-xl p-3 shadow transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span className="truncate max-w-[140px] text-slate-300 font-medium">
                            {lead.neighborhood}
                          </span>
                          <span className="text-amber-300 font-semibold text-[10px]">
                            ★ {lead.opportunity.facadePotential}/5 Fachada
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-white mb-1.5 leading-snug">
                          {lead.title}
                        </h4>

                        {/* Decision Maker Tag */}
                        <div className="bg-slate-900/70 p-2 rounded-lg text-[11px] border border-slate-800 mb-2">
                          <div className="text-amber-400 font-semibold text-[10px] uppercase">
                            Quem decide:
                          </div>
                          <div className="text-slate-200 truncate">{lead.decisionMaker.role}</div>
                        </div>

                        {/* Estimated Project Value */}
                        <div className="flex items-center justify-between text-[11px] text-slate-300 mb-2">
                          <span className="text-slate-400">Projeto:</span>
                          <strong className="text-emerald-400 font-mono">
                            {lead.opportunity.estimatedTicket}
                          </strong>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onGeneratePitch(lead)}
                            className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-md transition cursor-pointer"
                            title="Gerar Pitch"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                          {lead.contactChannels.whatsapp && (
                            <a
                              href={`https://wa.me/${lead.contactChannels.whatsapp}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-md transition"
                              title="Chamar no WhatsApp"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>

                        {/* Move status select */}
                        <select
                          value={lead.status}
                          onChange={(e) => onStatusChange(lead.id, e.target.value as LeadStatus)}
                          className="bg-slate-900 text-slate-300 text-[10px] px-1.5 py-1 rounded border border-slate-700 focus:outline-none cursor-pointer max-w-[100px]"
                        >
                          <option value="novo">Novo</option>
                          <option value="contatado">Contatado</option>
                          <option value="visita_agendada">Visita</option>
                          <option value="proposta_enviada">Proposta</option>
                          <option value="fechado">Fechado</option>
                          <option value="descartado">Descartar</option>
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
