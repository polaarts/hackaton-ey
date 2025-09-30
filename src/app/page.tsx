'use client'

import React, { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { useReports } from '@/hooks/useReports'
import type { PointOfInterest, Confidence } from '@/lib/reportConverter'

const cn = (...c: Array<string | false | undefined>) => c.filter(Boolean).join(' ')

function confidenceStyles(conf: Confidence) {
  const base = "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium";
  switch (conf) {
    case "high-confidence":   return `${base} bg-green-50 text-green-800 border-green-200`;
    case "medium-confidence": return `${base} bg-amber-50 text-amber-800 border-amber-200`;
    default:                  return `${base} bg-red-50 text-red-800 border-red-200`;
  }
}
function confidencePillByScore(score: number): Confidence {
  if (score >= 0.85) return "high-confidence";
  if (score >= 0.6)  return "medium-confidence";
  return "low-confidence";
}
function fmtDate(d: string | number | Date) {
  try { return new Date(d).toLocaleString("es-CL", { hour12: false }); } catch { return "—"; }
}
function timeAgo(d: string | number | Date) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.max(1, Math.round(diff / 60000));
  if (m < 60) return `hace ${m} min`;
  const h = Math.round(m / 60);
  return `hace ${h} h`;
}

/** ─────────────────────────────
 *  Mapa (igual)
 *  ───────────────────────────── */
const MapComponent = dynamic(() => import('../components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
      <div className="text-gray-500">Cargando mapa...</div>
    </div>
  )
})

/** ─────────────────────────────
 *  Mapa (carga dinámica)
 *  ───────────────────────────── */
export default function Home() {
  // Hook para obtener datos de la API
  const { allReports, groupedReports, loading, error, usingMockData, refreshReports } = useReports();
  
  const [selectedConfidence, setSelectedConfidence] = useState<Confidence[]>(['high-confidence', 'medium-confidence', 'low-confidence'])
  const [selectedReport, setSelectedReport] = useState<PointOfInterest | null>(null)

  // Búsqueda y orden
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'confidence' | 'time'>('confidence')

  // Conteos por confianza
  const counts = useMemo(() => ({
    high: groupedReports['high-confidence'].length,
    medium: groupedReports['medium-confidence'].length,
    low: groupedReports['low-confidence'].length,
  }), [groupedReports])

  // Filtrado por confianza + búsqueda + orden
  const filteredData = useMemo(() => {
    const confidenceFiltered = allReports.filter(d => selectedConfidence.includes(d.type))
    const searched = confidenceFiltered.filter(d => {
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return d.name.toLowerCase().includes(q)
        || d.description.toLowerCase().includes(q)
        || d.report.licensePlate.toLowerCase().includes(q)
        || d.report.location.address.toLowerCase().includes(q)
    })
    const sorted = [...searched].sort((a,b) => {
      if (sortBy === 'confidence') return (b.report.confidence ?? 0) - (a.report.confidence ?? 0)
      // time
      return new Date(b.report.incidentDatetime).getTime() - new Date(a.report.incidentDatetime).getTime()
    })
    return sorted
  }, [allReports, selectedConfidence, searchQuery, sortBy])

  const handleMarkerClick = (report: PointOfInterest) => setSelectedReport(report)
  const handleMapClick = () => setSelectedReport(null)

  const toggleConfidence = (c: Confidence) => {
    setSelectedConfidence(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
  }

  const copy = async (t: string) => {
    try { await navigator.clipboard.writeText(t) } catch { /* ignore */ }
  }

  return (
    <div className="h-screen flex">
      {/* Mapa */}
      <div className="flex-1 relative">
        <MapComponent
          data={filteredData}
          onMarkerClick={handleMarkerClick}
          onMapClick={handleMapClick}
          selectedReport={selectedReport}
        />
      </div>

      {/* Sidebar mejorado */}
      <aside className="w-[26rem] bg-white border-l border-gray-200 flex flex-col" role="complementary" aria-label="Panel lateral de reportes">
        {/* Header + search/sort */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Monitor de Seguridad</h1>
              {loading && <p className="text-xs text-blue-600 mt-1">Cargando reportes...</p>}
              {error && !usingMockData && <p className="text-xs text-red-600 mt-1">Error: {error}</p>}
              {usingMockData && <p className="text-xs text-orange-600 mt-1">⚠️ Usando datos de demostración</p>}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={refreshReports}
                disabled={loading}
                className="text-xs text-gray-500 hover:text-gray-700 p-1 rounded disabled:opacity-50"
                aria-label="Actualizar reportes"
              >
                🔄
              </button>
              <span className="text-[10px] text-gray-500 mt-1">Actualizado {timeAgo(Date.now())}</span>
            </div>
          </div>

          {/* Búsqueda y orden */}
          <div className="mt-3 flex items-center gap-2">
            <label className="relative flex-1">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden>🔎</span>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-7 pr-3 py-2 text-sm border text-gray-300 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Buscar por patente o calle…"
                aria-label="Buscar reportes"
              />
            </label>
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as 'confidence' | 'time')}
                className="text-sm border border-gray-300 text-gray-300 rounded-md py-2 pl-2 pr-7 bg-white"
                aria-label="Ordenar por"
              >
                <option value="confidence">Ordenar: Confianza</option>
                <option value="time">Ordenar: Hora</option>
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">▾</span>
            </div>
          </div>
        </div>

        {/* Filtros por confianza */}
        <div className="p-3 border-b">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-800">Filtros por confianza</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {([
              ['high-confidence', `Alta (${counts.high})`],
              ['medium-confidence', `Media (${counts.medium})`],
              ['low-confidence', `Baja (${counts.low})`],
            ] as Array<[Confidence, string]>).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => toggleConfidence(key)}
                className={cn(
                  confidenceStyles(key),
                  "select-none",
                  selectedConfidence.includes(key) ? "ring-1 ring-offset-1" : "opacity-70"
                )}
                aria-pressed={selectedConfidence.includes(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de reportes */}
        <div className="flex-1 overflow-y-auto" role="list" aria-label="Lista de reportes">
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-800">Reportes activos</h3>
              <span className="text-xs text-gray-500">{filteredData.length}</span>
            </div>

            {filteredData.length === 0 ? (
              <div className="mt-6 rounded-lg border border-dashed p-6 text-center">
                <p className="text-sm text-gray-700 font-medium">No hay resultados</p>
                <p className="text-xs text-gray-500 mt-1">Ajusta los filtros o la búsqueda.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {filteredData.map((item) => {
                  const confPct = Math.round((item.report?.confidence ?? 0) * 100);
                  const confKey = confidencePillByScore(item.report?.confidence ?? 0);
                  const active = selectedReport?.id === item.id;

                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => handleMarkerClick(item)}
                        className={cn(
                          "w-full text-left rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500",
                          "p-3 bg-white hover:bg-gray-50",
                          active ? "border-blue-300 ring-1 ring-blue-200" : "border-gray-200"
                        )}
                        role="listitem"
                        aria-selected={active}
                      >
                        <div className="flex">
                          <div className={cn("w-1 rounded-l-md mr-3", active ? "bg-blue-500" : "bg-transparent")} aria-hidden />
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-medium text-gray-900 text-sm line-clamp-1">{item.name}</h4>
                              <span className={confidenceStyles(confKey)}>{confPct}%</span>
                            </div>
                            <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">{item.description}</p>
                            <div className="mt-1 flex items-center gap-3 text-[11px] text-gray-500">
                              <span className="font-mono bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5">Pat. {item.report.licensePlate}</span>
                              <span>{fmtDate(item.report.incidentDatetime)}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Detalle del reporte seleccionado */}
        {selectedReport && (
          <div className="border-t bg-gray-50">
            <div className="p-4 max-h-96 overflow-y-auto">
              <h3 className="font-semibold text-gray-800 mb-2">Detalles del reporte</h3>

              {/* Resumen */}
              <section className="space-y-1 text-sm text-gray-900">
                <div><span className="font-medium">Título:</span> {selectedReport.report.title}</div>
                <div><span className="font-medium">Resumen:</span> {selectedReport.report.summary}</div>
                <div className="flex items-start gap-1.5">
                  <span className="mt-0.5" aria-hidden>📍</span>
                  <span><span className="font-medium">Ubicación:</span> {selectedReport.report.location.address}</span>
                </div>
                <div><span className="font-medium">Vehículo:</span> {selectedReport.report.vehicleDescription || '—'}</div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">Patente:</span>
                  <span className="font-mono font-semibold">{selectedReport.report.licensePlate}</span>
                  <button
                    className="ml-1 inline-flex items-center gap-1 text-[11px] text-blue-700 hover:underline"
                    onClick={() => copy(selectedReport.report.licensePlate)}
                    aria-label="Copiar patente"
                  >
                    📋 copiar
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Confianza:</span>
                  <span className={confidenceStyles(confidencePillByScore(selectedReport.report.confidence))}>
                    {Math.round(selectedReport.report.confidence * 100)}%
                  </span>
                </div>
                {selectedReport.report.notes && (
                  <div className="text-[13px] text-gray-700">
                    <span className="font-medium">Notas:</span> {selectedReport.report.notes}
                  </div>
                )}
              </section>

              {/* Acciones rápidas municipales */}
              {/* <div className="mt-3 flex flex-wrap gap-2">
                <button
                  className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 text-white text-sm px-3 py-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => alert('Iniciar oficio: se registrará en el sistema municipal.')}
                >
                  📄 Iniciar oficio
                </button>
                <button
                  className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 text-white text-sm px-3 py-2 hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500"
                  onClick={() => alert('Notificar a Seguridad Municipal.')}
                >
                  🛎️ Notificar Seguridad
                </button>
                <button
                  className="inline-flex items-center gap-1.5 rounded-md bg-gray-800 text-white text-sm px-3 py-2 hover:bg-black focus:ring-2 focus:ring-gray-700"
                  onClick={() => alert('Despachar patrulla a ubicación seleccionada.')}
                >
                  🚓 Enviar patrulla
                </button>
                <button
                  className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 text-gray-800 text-sm px-3 py-2 hover:bg-white focus:ring-2 focus:ring-gray-400"
                  onClick={() => window.dispatchEvent(new CustomEvent("center-map-to", { detail: selectedReport } as any))}
                >
                  🗺️ Centrar en mapa
                </button>
              </div> */}

              {/* Evidencia (limitada) */}
              {selectedReport.report.evidence?.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-1">🖼️ Evidencia ({selectedReport.report.evidence.length})</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedReport.report.evidence.slice(0, 4).map((evidenceUrl, index) => (
                      <button
                        key={index}
                        className="relative group rounded overflow-hidden border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={() => window.open(evidenceUrl, '_blank')}
                        aria-label={`Abrir evidencia ${index + 1}`}
                      >
                        <img
                          src={evidenceUrl}
                          alt={`Evidencia ${index + 1}`}
                          className="w-full h-24 object-cover group-hover:opacity-90"
                          onError={(e: any) => {
                            e.currentTarget.src = `data:image/svg+xml;base64,${btoa(
                              `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='96'><rect width='100%' height='100%' fill='#f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='12' fill='#9ca3af'>Imagen no disponible</text></svg>`
                            )}`
                          }}
                        />
                        <span className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[11px] px-1 py-0.5">
                          Evidencia {index + 1}
                        </span>
                      </button>
                    ))}
                  </div>
                  {selectedReport.report.evidence.length > 4 && (
                    <button className="mt-2 text-sm text-blue-700 hover:underline" onClick={() => alert('Mostrar galería completa')}>Ver todas</button>
                  )}
                  {selectedReport.report.imageDescriptionRaw && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900">
                      <span className="font-medium">Descripción IA:</span> {selectedReport.report.imageDescriptionRaw}
                    </div>
                  )}
                </div>
              )}

              {/* Secuencia / historial */}
              {selectedReport.report.timelineDeVistas?.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-semibold text-gray-800 mb-2">Secuencia</h4>
                  <ol className="space-y-1 text-sm">
                    {selectedReport.report.timelineDeVistas.map((t) => (
                      <li key={t.index} className="flex items-start gap-2">
                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-gray-400" aria-hidden />
                        <div className="flex-1">
                          <div className="text-gray-900">{t.address}</div>
                          <div className="text-[11px] text-gray-500">{fmtDate(t.datetime)} {t.source ? `• Fuente: ${t.source}` : ''}</div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}
