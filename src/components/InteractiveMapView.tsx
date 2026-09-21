import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  LeadTarget, 
  PropertyType, 
  AdvancedSearchFilters 
} from '../types';
import { 
  MapPin, 
  Layers, 
  Eye, 
  Sparkles, 
  Home, 
  Building2, 
  Hotel, 
  Compass, 
  Maximize2, 
  Calendar, 
  Filter, 
  Search, 
  Zap, 
  Copy, 
  CheckCircle2, 
  ChevronRight, 
  Sun, 
  Moon, 
  Satellite 
} from 'lucide-react';

interface InteractiveMapViewProps {
  leads: LeadTarget[];
  onSelectLead: (lead: LeadTarget) => void;
  selectedLeadId?: string | null;
  filters: AdvancedSearchFilters;
  onFilterChange: (filters: AdvancedSearchFilters) => void;
}

type MapLayerType = 'dark' | 'satellite' | 'streets';

export const InteractiveMapView: React.FC<InteractiveMapViewProps> = ({
  leads,
  onSelectLead,
  selectedLeadId,
  filters,
  onFilterChange
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [activeLayer, setActiveLayer] = useState<MapLayerType>('dark');
  const [activeSidebarTab, setActiveSidebarTab] = useState<'list' | 'filters'>('list');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copiedLeadId, setCopiedLeadId] = useState<string | null>(null);

  // Filter leads with valid coordinates
  const geolocatedLeads = leads.filter(
    (l) => l.coordinates && typeof l.coordinates.lat === 'number' && typeof l.coordinates.lng === 'number'
  );

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Default center: Jurerê Internacional, Florianópolis
    const defaultCenter: [number, number] = [-27.4365, -48.5000];
    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 15,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let url = '';
    let attribution = '';

    if (activeLayer === 'dark') {
      // CartoDB Dark Matter (Great for glowing LED contrast)
      url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      attribution = '&copy; <a href="https://carto.com/">CARTO</a>';
    } else if (activeLayer === 'satellite') {
      // Esri World Imagery (High-res satellite)
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = '&copy; Esri & USGS';
    } else {
      // OpenStreetMap Streets
      url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenStreetMap contributors';
    }

    const newLayer = L.tileLayer(url, {
      attribution,
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    tileLayerRef.current = newLayer;
  }, [activeLayer]);

  // Update Markers when leads or filter change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    Object.values(markersRef.current).forEach((marker: L.Marker) => marker.remove());
    markersRef.current = {};

    if (geolocatedLeads.length === 0) return;

    const bounds = L.latLngBounds([]);

    geolocatedLeads.forEach((lead) => {
      if (!lead.coordinates) return;

      const { lat, lng } = lead.coordinates;
      bounds.extend([lat, lng]);

      // Determine marker color and icon based on category/type
      let markerColor = '#f59e0b'; // Amber default
      let iconSymbol = '🏠';

      if (lead.propertyDetails?.propertyType === 'apartamento' || lead.category === 'condo_residential') {
        markerColor = '#3b82f6'; // Blue
        iconSymbol = '🏢';
      } else if (lead.propertyDetails?.propertyType === 'comercial' || lead.category === 'commercial_venue') {
        markerColor = '#10b981'; // Emerald
        iconSymbol = '🍸';
      } else if (lead.propertyDetails?.propertyType === 'pousada_hotel' || lead.category === 'boutique_hotel') {
        markerColor = '#a855f7'; // Purple
        iconSymbol = '🏨';
      } else if (lead.category === 'architect_partner') {
        markerColor = '#06b6d4'; // Cyan
        iconSymbol = '📐';
      }

      const isHighPriority = lead.propertyDetails?.lightingPotentialAudit?.priorityLevel === 'alta';

      // Custom HTML DivIcon
      const customIcon = L.divIcon({
        className: 'custom-property-marker',
        html: `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 38px;
            height: 38px;
            background: #0f172a;
            border: 2px solid ${markerColor};
            border-radius: 50%;
            box-shadow: 0 0 ${isHighPriority ? '14px' : '6px'} ${markerColor}99, 0 4px 6px rgba(0,0,0,0.5);
            cursor: pointer;
            transform: translate(-50%, -50%);
            transition: all 0.2s ease;
          ">
            <span style="font-size: 17px;">${iconSymbol}</span>
            ${isHighPriority ? `
              <span style="
                position: absolute;
                top: -3px;
                right: -3px;
                width: 10px;
                height: 10px;
                background: #eab308;
                border: 2px solid #0f172a;
                border-radius: 50%;
              "></span>
            ` : ''}
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19]
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

      // Popup content
      const popupHtml = document.createElement('div');
      popupHtml.className = 'property-popup-content';
      popupHtml.style.minWidth = '240px';
      popupHtml.style.maxWidth = '280px';
      popupHtml.style.padding = '4px';
      popupHtml.style.fontFamily = 'Plus Jakarta Sans, sans-serif';

      popupHtml.innerHTML = `
        <div style="font-size: 11px; font-weight: 700; color: ${markerColor}; text-transform: uppercase; margin-bottom: 2px;">
          ${lead.neighborhood} • ${lead.propertyDetails?.propertyType ? lead.propertyDetails.propertyType.toUpperCase() : 'IMÓVEL'}
        </div>
        <div style="font-size: 14px; font-weight: 800; color: #ffffff; line-height: 1.25; margin-bottom: 6px;">
          ${lead.title}
        </div>
        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 8px;">
          📍 ${lead.address}
        </div>
        ${lead.propertyDetails?.builtAreaM2 ? `
          <div style="display: flex; gap: 8px; font-size: 11px; margin-bottom: 8px; background: rgba(30,41,59,0.8); padding: 4px 8px; border-radius: 6px;">
            <span>📐 <strong>${lead.propertyDetails.builtAreaM2} m²</strong></span>
            ${lead.propertyDetails.yearBuilt ? `<span>📅 <strong>Ano ${lead.propertyDetails.yearBuilt}</strong></span>` : ''}
          </div>
        ` : ''}
        <div style="background: rgba(234, 179, 8, 0.12); border: 1px solid rgba(234, 179, 8, 0.3); border-radius: 6px; padding: 6px; font-size: 11px; color: #fde047; margin-bottom: 10px;">
          💡 <strong>Potencial LED:</strong> ${lead.opportunity.recommendedType.substring(0, 75)}...
        </div>
        <div style="display: flex; gap: 6px;">
          <button id="btn-view-profile-${lead.id}" style="
            flex: 1;
            padding: 6px 10px;
            background: #f59e0b;
            color: #020617;
            font-size: 11px;
            font-weight: 700;
            border-radius: 6px;
            border: none;
            cursor: pointer;
          ">
            Ver Perfil Detalhado
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: 'dark-property-popup',
        closeButton: true
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-view-profile-${lead.id}`);
        if (btn) {
          btn.onclick = () => onSelectLead(lead);
        }
      });

      markersRef.current[lead.id] = marker;
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }
  }, [geolocatedLeads, onSelectLead]);

  // Handle focusing a specific lead on the map
  const focusLeadOnMap = (lead: LeadTarget) => {
    const map = mapInstanceRef.current;
    if (!map || !lead.coordinates) return;

    map.flyTo([lead.coordinates.lat, lead.coordinates.lng], 16, {
      duration: 1.2
    });

    const marker = markersRef.current[lead.id];
    if (marker) {
      setTimeout(() => marker.openPopup(), 600);
    }
  };

  const copyLeadDossier = (lead: LeadTarget, e: React.MouseEvent) => {
    e.stopPropagation();
    const p = lead.propertyDetails;
    const text = `*IMÓVEL LEVANTADO EM JURERÊ - LED:*
📍 ${lead.title}
Endereço: ${lead.address}, ${lead.neighborhood}
Tipo: ${p?.propertyType || lead.category} | ${p?.builtAreaM2 ? `${p.builtAreaM2} m²` : ''} ${p?.yearBuilt ? `(Ano ${p.yearBuilt})` : ''}
Tomador: ${lead.decisionMaker.name || 'Proprietário'} (${lead.decisionMaker.role})
Contato: ${lead.contactChannels.whatsapp ? `+${lead.contactChannels.whatsapp}` : lead.contactChannels.phone || 'Ver no app'}
Potencial LED: ${lead.opportunity.recommendedType} (Ticket: ${lead.opportunity.estimatedTicket})`;

    navigator.clipboard.writeText(text);
    setCopiedLeadId(lead.id);
    setTimeout(() => setCopiedLeadId(null), 2500);
  };

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[550px] bg-slate-950 flex overflow-hidden border-t border-slate-800">
      
      {/* Map Container */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full z-0" 
        id="interactive-leaflet-map"
      />

      {/* Layer Switcher Controls (Top Right Overlay) */}
      <div className="absolute top-4 right-4 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-1.5 shadow-xl flex items-center gap-1 text-xs">
        <button
          onClick={() => setActiveLayer('dark')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
            activeLayer === 'dark'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Modo Noturno - ideal para simular contraste da iluminação LED"
        >
          <Moon className="w-3.5 h-3.5" />
          <span>Noturno LED</span>
        </button>

        <button
          onClick={() => setActiveLayer('satellite')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
            activeLayer === 'satellite'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Satélite - inspecione piscina, fachada, telhado e recuos"
        >
          <Satellite className="w-3.5 h-3.5" />
          <span>Satélite</span>
        </button>

        <button
          onClick={() => setActiveLayer('streets')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
            activeLayer === 'streets'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Ruas e Acessos à Praia"
        >
          <Sun className="w-3.5 h-3.5" />
          <span>Ruas</span>
        </button>
      </div>

      {/* Floating Property Directory Sidebar */}
      <div className={`absolute top-4 left-4 z-10 transition-all duration-300 ${
        sidebarOpen ? 'w-80 sm:w-96' : 'w-12'
      } max-h-[calc(100%-32px)] flex flex-col`}>
        
        {sidebarOpen ? (
          <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[calc(100vh-172px)]">
            
            {/* Sidebar Header */}
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-850/60">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Radar Geográfico Jurerê
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {geolocatedLeads.length} imóveis mapeados
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-xs"
                  title="Recolher painel"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Quick Type Filter Chips */}
            <div className="p-2 border-b border-slate-800 bg-slate-900 flex items-center gap-1 overflow-x-auto text-[11px]">
              <button
                onClick={() => onFilterChange({ ...filters, propertyType: 'all' })}
                className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition cursor-pointer ${
                  filters.propertyType === 'all'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Todos ({leads.length})
              </button>
              <button
                onClick={() => onFilterChange({ ...filters, propertyType: 'casa' })}
                className={`px-2 py-1 rounded-md font-medium whitespace-nowrap transition cursor-pointer ${
                  filters.propertyType === 'casa'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Mansões
              </button>
              <button
                onClick={() => onFilterChange({ ...filters, propertyType: 'apartamento' })}
                className={`px-2 py-1 rounded-md font-medium whitespace-nowrap transition cursor-pointer ${
                  filters.propertyType === 'apartamento'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Condomínios
              </button>
              <button
                onClick={() => onFilterChange({ ...filters, propertyType: 'comercial' })}
                className={`px-2 py-1 rounded-md font-medium whitespace-nowrap transition cursor-pointer ${
                  filters.propertyType === 'comercial'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Comercial
              </button>
              <button
                onClick={() => onFilterChange({ ...filters, propertyType: 'pousada_hotel' })}
                className={`px-2 py-1 rounded-md font-medium whitespace-nowrap transition cursor-pointer ${
                  filters.propertyType === 'pousada_hotel'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Pousadas
              </button>
            </div>

            {/* Quick Search inside Map */}
            <div className="p-2.5 border-b border-slate-800 bg-slate-900/50">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar por rua ou nome..."
                  value={filters.searchTerm}
                  onChange={(e) => onFilterChange({ ...filters, searchTerm: e.target.value })}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-800 text-xs text-white placeholder-slate-400 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* List of Properties in the Map */}
            <div className="overflow-y-auto flex-1 p-2 space-y-2 divide-y divide-slate-800/40">
              {geolocatedLeads.map((lead) => {
                const isSelected = selectedLeadId === lead.id;
                const p = lead.propertyDetails;

                return (
                  <div
                    key={lead.id}
                    onClick={() => focusLeadOnMap(lead)}
                    className={`p-2.5 rounded-xl transition cursor-pointer flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-amber-500/15 border border-amber-500/40'
                        : 'bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-white leading-snug line-clamp-1">
                        {lead.title}
                      </h4>
                      {p?.lightingPotentialAudit?.priorityLevel === 'alta' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                          Alta Prioridade
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      📍 {lead.address}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1">
                      <div className="flex items-center gap-2">
                        {p?.builtAreaM2 && (
                          <span className="text-amber-300 font-semibold">
                            {p.builtAreaM2} m²
                          </span>
                        )}
                        {p?.yearBuilt && (
                          <span className="text-slate-400">
                            Ano {p.yearBuilt}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => copyLeadDossier(lead, e)}
                          className="p-1 text-slate-400 hover:text-amber-300 hover:bg-slate-700 rounded transition"
                          title="Copiar Ficha Rápida"
                        >
                          {copiedLeadId === lead.id ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectLead(lead);
                          }}
                          className="px-2 py-0.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[10px] font-bold transition"
                        >
                          Abrir Perfil
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {geolocatedLeads.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-400">
                  Nenhum imóvel corresponde aos filtros selecionados.
                </div>
              )}
            </div>

            {/* Footer Tip */}
            <div className="p-2.5 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Clique no pin para inspecionar</span>
              <span className="text-amber-400 font-semibold">Jurerê / SC</span>
            </div>

          </div>
        ) : (
          /* Collapsed Button */
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-3 bg-slate-900/95 border border-slate-700 text-amber-400 rounded-xl shadow-xl hover:bg-slate-800 transition cursor-pointer flex flex-col items-center gap-1"
            title="Abrir lista de imóveis"
          >
            <MapPin className="w-5 h-5" />
            <span className="text-[10px] font-bold writing-mode-vertical">Alvos</span>
          </button>
        )}
      </div>

    </div>
  );
};
