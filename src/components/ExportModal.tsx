import React, { useState } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  Download, 
  Copy, 
  Check, 
  Send, 
  CheckCircle2 
} from 'lucide-react';
import { LeadTarget } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: LeadTarget[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  leads
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Export as CSV (Google Sheets compatible with integrity & evidence columns)
  const handleDownloadCSV = () => {
    const headers = [
      'ID',
      'Imóvel / Nome',
      'Categoria',
      'Bairro',
      'Endereço',
      'Status de Verificação de Contato',
      'Confiabilidade Factual (%)',
      'Score Adequação LED (0-100)',
      'Origem do Dado',
      'CNPJ',
      'Matrícula RGI',
      'Inscrição Imobiliária',
      'URL Canônica / Anúncio',
      'Fontes e Evidências Documentadas',
      'Quem Decide (Cargo)',
      'Nome do Decisor',
      'Estratégia de Abordagem / Próxima Ação',
      'WhatsApp',
      'Telefone',
      'Instagram',
      'Email',
      'Website',
      'Estimativa Comercial Ticket',
      'Intervenção LED Sugerida',
      'Status no Funil',
      'Data de Captação'
    ];

    const rows = leads.map((l) => {
      const evidenceList = (l.evidenceSources || [])
        .map(e => `[${e.type}] ${e.title}: ${e.url}`)
        .concat((l.groundingSources || []).map(g => `[grounding] ${g.title}: ${g.uri}`))
        .join(' | ');

      const verificationStatusLabel = 
        l.contactVerificationStatus === 'manually_confirmed' ? 'Confirmado Manualmente' :
        l.contactVerificationStatus === 'public_evidence_found' ? 'Evidência Pública Encontrada' :
        'Validação Pendente';

      return [
        `"${l.id}"`,
        `"${l.title.replace(/"/g, '""')}"`,
        `"${l.category}"`,
        `"${l.neighborhood.replace(/"/g, '""')}"`,
        `"${l.address.replace(/"/g, '""')}"`,
        `"${verificationStatusLabel}"`,
        `"${l.dataReliabilityScore ?? 50}%"`,
        `"${l.ledSuitabilityScore ?? 80}"`,
        `"${l.originType || 'manual'}"`,
        `"${l.cnpj || ''}"`,
        `"${l.matricula || ''}"`,
        `"${l.inscricaoImobiliaria || ''}"`,
        `"${l.canonicalUrl || ''}"`,
        `"${evidenceList.replace(/"/g, '""')}"`,
        `"${l.decisionMaker.role.replace(/"/g, '""')}"`,
        `"${(l.decisionMaker.name || '').replace(/"/g, '""')}"`,
        `"${l.decisionMaker.strategy.replace(/"/g, '""')}"`,
        `"${l.contactChannels.whatsapp || ''}"`,
        `"${l.contactChannels.phone || ''}"`,
        `"${l.contactChannels.instagram || ''}"`,
        `"${l.contactChannels.email || ''}"`,
        `"${l.contactChannels.website || ''}"`,
        `"${l.opportunity.estimatedTicket}"`,
        `"${l.opportunity.recommendedType.replace(/"/g, '""')}"`,
        `"${l.status}"`,
        `"${l.createdAt.split('T')[0]}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `lumina_jurere_leads_integridade_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate WhatsApp-friendly summary report for the service provider partner
  const generateWhatsAppReport = () => {
    let text = `⚡ *RELATÓRIO DE OPORTUNIDADES LED - LÚMINA JURERÊ*\n`;
    text += `Total de Alvos Mapeados: ${leads.length}\n`;
    text += `Data: ${new Date().toLocaleDateString('pt-BR')}\n\n`;

    leads.forEach((lead, i) => {
      text += `📍 *${i + 1}. ${lead.title}* (${lead.neighborhood})\n`;
      text += `• *Decisor:* ${lead.decisionMaker.role} ${lead.decisionMaker.name ? `(${lead.decisionMaker.name})` : ''}\n`;
      if (lead.contactChannels.whatsapp) {
        text += `• *WhatsApp:* https://wa.me/${lead.contactChannels.whatsapp}\n`;
      }
      if (lead.contactChannels.phone) {
        text += `• *Telefone:* ${lead.contactChannels.phone}\n`;
      }
      text += `• *Projeto:* ${lead.opportunity.recommendedType}\n`;
      text += `• *Ticket:* ${lead.opportunity.estimatedTicket}\n`;
      text += `• *Status:* ${lead.status.toUpperCase()}\n\n`;
    });

    text += `_Gerado com inteligência de dados Lúmina Jurerê_`;
    return text;
  };

  const handleCopyReport = () => {
    const report = generateWhatsAppReport();
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Exportar Alvos e Relatórios</h2>
            <p className="text-xs text-slate-400">
              Disponibilize os dados para o prestador de serviço ou abra no Google Sheets
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Option 1: CSV for Google Sheets / Excel */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                Planilha CSV (Compatível com Google Sheets / Excel)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Arquivo com colunas completas: nome do imóvel, contato de quem decide, WhatsApp, telefone, ticket e proposta.
              </p>
            </div>
            <button
              onClick={handleDownloadCSV}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar CSV</span>
            </button>
          </div>

          {/* Option 2: WhatsApp Report */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Send className="w-4 h-4 text-emerald-400" />
                Relatório Formatado para WhatsApp
              </h3>
              <button
                onClick={handleCopyReport}
                className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs rounded-lg transition flex items-center gap-1 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copiar Texto</span>
                  </>
                )}
              </button>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {generateWhatsAppReport()}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
