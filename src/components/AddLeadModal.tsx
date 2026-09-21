import React, { useState } from 'react';
import { 
  X, 
  PlusCircle, 
  Building2, 
  Home, 
  Hotel, 
  Compass, 
  Users, 
  Briefcase, 
  MapPin, 
  Phone, 
  Send, 
  Instagram, 
  DollarSign,
  Landmark,
  FileText,
  ExternalLink
} from 'lucide-react';
import { LeadTarget, LeadCategory, CadastralDetails } from '../types';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCity: string;
  onAddLead: (lead: LeadTarget) => void;
}

export const AddLeadModal: React.FC<AddLeadModalProps> = ({
  isOpen,
  onClose,
  defaultCity,
  onAddLead
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<LeadCategory>('mansion_rental');
  const [neighborhood, setNeighborhood] = useState('Jurerê Internacional');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [decisionRole, setDecisionRole] = useState('Proprietário / Gestora de Locação');
  const [decisionName, setDecisionName] = useState('');
  const [decisionStrategy, setDecisionStrategy] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [phone, setPhone] = useState('');
  const [instagram, setInstagram] = useState('');
  const [website, setWebsite] = useState('');
  const [estimatedTicket, setEstimatedTicket] = useState('R$ 25.000 - R$ 45.000');
  const [recommendedType, setRecommendedType] = useState('Iluminação Cênica de Fachada LED + Balizadores');

  // Cadastral states
  const [matricula, setMatricula] = useState('');
  const [inscricaoImobiliaria, setInscricaoImobiliaria] = useState('');
  const [quadra, setQuadra] = useState('');
  const [lote, setLote] = useState('');
  const [testadaMetros, setTestadaMetros] = useState('20');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const timestamp = new Date().toISOString();

    const propType = category === 'condo_residential' ? 'apartamento' :
                     category === 'commercial_venue' ? 'comercial' :
                     category === 'boutique_hotel' ? 'pousada_hotel' : 'casa';

    const testadaNum = testadaMetros ? Number(testadaMetros) : 20;

    const cadastralData: CadastralDetails = {
      matricula: matricula.trim() || undefined,
      inscricaoImobiliaria: inscricaoImobiliaria.trim() || undefined,
      cartorio: '2º Ofício de Registro de Imóveis de Florianópolis (Comarca da Capital)',
      loteamento: 'Jurerê Internacional',
      quadra: quadra.trim() || undefined,
      lote: lote.trim() || undefined,
      testadaMetros: testadaNum,
      zoneamento: 'ARP-2.5 (Área Residencial Predominante)',
      geoportalUrl: 'https://geofloripa.pmf.sc.gov.br/',
      statusAverbacao: 'Averbado / Regular'
    };

    const newLead: LeadTarget = {
      id: `manual-lead-${Date.now()}`,
      title: title.trim(),
      category,
      city: defaultCity,
      neighborhood: neighborhood.trim(),
      address: address.trim(),
      description: description.trim() || 'Imóvel cadastrado manualmente pelo captador.',
      matricula: matricula.trim() || undefined,
      inscricaoImobiliaria: inscricaoImobiliaria.trim() || undefined,
      coordinates: {
        lat: -27.4365 + (Math.random() - 0.5) * 0.01,
        lng: -48.5000 + (Math.random() - 0.5) * 0.015
      },
      propertyDetails: {
        propertyType: propType,
        builtAreaM2: 600,
        lotAreaM2: 750,
        yearBuilt: 2021,
        cadastralDetails: cadastralData,
        architecturalDetails: {
          style: 'Contemporâneo de Alto Padrão',
          exteriorMaterials: ['Concreto ripado', 'Pele de vidro', 'Brises de madeira'],
          roofAndEaves: 'Beirais lineares com recuo para iluminação indireta',
          floors: 2,
          facadeWidthMeters: testadaNum
        },
        salesRentalHistory: {
          estimatedMarketValue: 'R$ 15.000.000',
          averageNightlyRate: 'R$ 6.000 / noite',
          rentalPlatform: 'Temporada / Direto',
          listingStatus: 'Temporada Ativa',
          historicalNotes: 'Cadastrado para captação de iluminação LED.'
        },
        lightingPotentialAudit: {
          priorityLevel: 'alta',
          currentLightingState: 'Fachada sem iluminação de destaque ou com lâmpadas convencionais.',
          facadeSuitability: recommendedType,
          patioPoolSuitability: 'Piscina e deck com potencial para fitas LED IP68 e balizadores.',
          gardenLandscapeSuitability: 'Up-lights em coqueiros e palmeiras do paisagismo.',
          recommendedColorTemp: '3000K Branco Quente',
          estimatedFixtureCount: 30,
          technicalFeasibility: 'Imediata (Tubulação aparente/espera existente)'
        }
      },
      decisionMaker: {
        role: decisionRole.trim(),
        name: decisionName.trim() || 'A confirmar',
        decisionPower: 'Direto',
        strategy: decisionStrategy.trim() || 'Apresentar portfólio de fachadas iluminadas.'
      },
      contactChannels: {
        phone: phone.trim(),
        whatsapp: whatsapp.replace(/\D/g, ''),
        instagram: instagram.trim(),
        website: website.trim()
      },
      opportunity: {
        facadePotential: 5,
        patioPoolPotential: 4,
        gardenPotential: 4,
        recommendedType: recommendedType.trim(),
        estimatedTicket: estimatedTicket.trim(),
        keySellingPoint: 'Valorização estética e segurança noturna do patrimônio.'
      },
      status: 'novo',
      history: [
        {
          id: `h-manual-${Date.now()}`,
          date: timestamp.split('T')[0],
          action: 'Cadastro Manual com Dados Cadastrais',
          note: matricula ? `Cadastrado com Matrícula nº ${matricula} (2º RI Florianópolis).` : 'Cadastrado no aplicativo pelo captador.'
        }
      ],
      source: 'Cadastro Manual em Campo',
      createdAt: timestamp,
      updatedAt: timestamp
    };

    onAddLead(newLead);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Adicionar Novo Imóvel / Alvo</h2>
            <p className="text-xs text-slate-400">Cadastre um imóvel observado em campo ou indicação</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Nome ou Identificação do Imóvel / Condomínio:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Mansão Alameda das Algas ou Condomínio Green Village"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Segmento:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as LeadCategory)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="mansion_rental">Mansão de Temporada</option>
                <option value="condo_residential">Condomínio Residencial</option>
                <option value="boutique_hotel">Pousada / Hotel Boutique</option>
                <option value="commercial_venue">Beach Club / Gastronomia</option>
                <option value="architect_partner">Arquiteto Parceiro</option>
                <option value="luxury_broker">Imobiliária de Luxo</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Bairro:</label>
              <input
                type="text"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="Ex: Jurerê Internacional"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Endereço Completo:</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ex: Av. dos Búzios, nº 850"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          {/* Dados Cadastrais & Matrícula (GeoPortal Floripa) */}
          <div className="bg-indigo-950/30 p-3.5 rounded-xl border border-indigo-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Landmark className="w-3.5 h-3.5 text-indigo-400" />
                Dados Cadastrais & Matrícula (GeoPortal Floripa / PMF)
              </span>
              <a
                href="https://geofloripa.pmf.sc.gov.br/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Abrir GeoFloripa
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 mb-1">Matrícula (RGI - 2º Ofício):</label>
                <input
                  type="text"
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  placeholder="Ex: 48.912"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Inscrição Imobiliária (PMF / IPTU):</label>
                <input
                  type="text"
                  value={inscricaoImobiliaria}
                  onChange={(e) => setInscricaoImobiliaria(e.target.value)}
                  placeholder="Ex: 51.84.029.0482.001-234"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-slate-300 mb-1">Quadra:</label>
                <input
                  type="text"
                  value={quadra}
                  onChange={(e) => setQuadra(e.target.value)}
                  placeholder="Ex: 14"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Lote:</label>
                <input
                  type="text"
                  value={lote}
                  onChange={(e) => setLote(e.target.value)}
                  placeholder="Ex: 08"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Testada (metros):</label>
                <input
                  type="number"
                  value={testadaMetros}
                  onChange={(e) => setTestadaMetros(e.target.value)}
                  placeholder="Ex: 22"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-400">
              * Cartório competente para Jurerê: 2º Ofício de Registro de Imóveis da Comarca da Capital.
            </p>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700 space-y-3">
            <span className="font-bold text-amber-400 block uppercase tracking-wider text-[11px]">
              Quem Decide a Instalação?
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 mb-1">Cargo / Papel:</label>
                <input
                  type="text"
                  value={decisionRole}
                  onChange={(e) => setDecisionRole(e.target.value)}
                  placeholder="Ex: Síndico, Proprietário, Gerente"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Nome da Pessoa (se souber):</label>
                <input
                  type="text"
                  value={decisionName}
                  onChange={(e) => setDecisionName(e.target.value)}
                  placeholder="Ex: Carlos Mendes"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Estratégia de Abordagem:</label>
              <input
                type="text"
                value={decisionStrategy}
                onChange={(e) => setDecisionStrategy(e.target.value)}
                placeholder="Ex: Enviar fotos de projetos parecidos de iluminação de fachada feitos na orla"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">WhatsApp de Contato:</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Ex: 48999999999"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Instagram (se houver):</label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="Ex: @mansaojurere"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Ticket Estimado do Projeto:</label>
              <input
                type="text"
                value={estimatedTicket}
                onChange={(e) => setEstimatedTicket(e.target.value)}
                placeholder="Ex: R$ 20.000 - R$ 40.000"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Pacote Sugerido:</label>
              <input
                type="text"
                value={recommendedType}
                onChange={(e) => setRecommendedType(e.target.value)}
                placeholder="Ex: Wall Washers + Beirais"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-bold rounded-xl shadow transition cursor-pointer"
            >
              Salvar Alvo no Radar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
