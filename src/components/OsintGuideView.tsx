import React, { useState } from 'react';
import { 
  BookOpen, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles, 
  Search, 
  ShieldAlert, 
  Lightbulb, 
  Globe, 
  MapPin, 
  KeyRound,
  FileText
} from 'lucide-react';
import { OSINT_GUIDE_STEPS } from '../data/initialData';

export const OsintGuideView: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [customDorkQuery, setCustomDorkQuery] = useState('');

  const googleDorks = [
    {
      label: 'Mansões de Temporada em Jurerê com WhatsApp de Contato',
      query: 'site:airbnb.com.br "Jurerê Internacional" ("mansão" OR "casa de luxo") ("whatsapp" OR "contato")'
    },
    {
      label: 'CNPJ de Condomínios Edilícios em Jurerê Internacional',
      query: 'intitle:"CONDOMINIO" "Jurerê Internacional" "CNPJ" "Florianópolis"'
    },
    {
      label: 'Pousadas e Hotéis Boutique em Jurerê com Telefone Direto',
      query: 'site:booking.com "Jurerê" "pousada" "telefone"'
    },
    {
      label: 'Escritórios de Arquitetura que Projetam em Jurerê',
      query: '"arquitetura residencial" "Jurerê Internacional" ("projetos" OR "mansão") "@gmail.com" OR "whatsapp"'
    }
  ];

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              Guia Prático de Inteligência & OSINT Gratuito em Jurerê
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold uppercase">
                100% Legal & Gratuito
              </span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              No Brasil e em Jurerê, os dados pessoais privados (CPF/telefone pessoal de donos de mansões) são resguardados pela LGPD. No entanto, <strong>a inteligência comercial pública permite conectar diretamente com quem decide</strong> (Superhosts de aluguel de temporada, Síndicos profissionais, Administradoras de condomínio, Beach Clubs e Arquitetos de luxo) sem custos ou intermediários pagos.
            </p>
          </div>
        </div>
      </div>

      {/* Google Dorks / Consultas Rápidas */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-amber-400" />
          Comandos de Busca Avançada (Google Dorks) para Jurerê
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Copie estes operadores e cole na barra de busca do Google para filtrar apenas páginas com contatos reais de decisão:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {googleDorks.map((dork, idx) => (
            <div
              key={idx}
              className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-semibold text-amber-300 block mb-1">
                  {dork.label}
                </span>
                <code className="text-[11px] font-mono text-slate-300 bg-slate-950 p-2 rounded block break-all leading-tight">
                  {dork.query}
                </code>
              </div>
              <div className="mt-2.5 flex items-center justify-between">
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(dork.query)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                >
                  Abrir no Google <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  onClick={() => handleCopy(dork.query, idx)}
                  className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs rounded transition flex items-center gap-1 cursor-pointer"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5 Proven Steps */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          Passo a Passo Estratégico: Como Chegar ao Tomador de Decisão
        </h3>

        {OSINT_GUIDE_STEPS.map((step, index) => (
          <div
            key={index}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                <span>{step.title}</span>
              </h4>
              {step.url && (
                <a
                  href={step.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 font-semibold underline"
                >
                  Acessar {step.portal} <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              {step.explanation}
            </p>

            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80 text-xs space-y-2">
              <div>
                <strong className="text-slate-200">Como executar na prática: </strong>
                <span className="text-slate-400">{step.howToUse}</span>
              </div>
              <div className="text-amber-300/90 pt-1 border-t border-slate-800 flex items-start gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>{step.proTip}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
