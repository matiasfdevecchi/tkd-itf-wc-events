'use client';

import { useState, useMemo } from 'react';
import { Event } from '../types';

interface EventTableProps {
  events: Event[];
}

type SortKey = keyof Event;
type SortDirection = 'asc' | 'desc';

export default function EventTable({ events }: EventTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('StartDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [timezone, setTimezone] = useState<string>('America/Argentina/Buenos_Aires');
  const [timeFilter, setTimeFilter] = useState<'all' | 'live' | 'upcoming' | 'past'>('all');
  const [filters, setFilters] = useState({
    type: '',
    date: '',
    category: '',
  });

  // Obtener tipos únicos
  const uniqueTypes = useMemo(() => {
    const types = new Set(events.map(e => e.Type));
    return Array.from(types).sort();
  }, [events]);

  // Timezones
  const timezones = [
    { value: 'America/Argentina/Buenos_Aires', label: 'ARG' },
    { value: 'UTC', label: 'UTC' },
    { value: 'Europe/Zagreb', label: 'Croacia' },
  ];

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedEvents = useMemo(() => {
    const now = new Date();

    const filtered = events.filter((event) => {
      const typeMatch = !filters.type || event.Type === filters.type;
      const categoryMatch = event.CategoryDescription.toLowerCase().includes(filters.category.toLowerCase());

      let dateMatch = true;
      if (filters.date) {
        const eventDate = new Date(event.StartDate);
        const filterDate = new Date(filters.date);
        dateMatch = eventDate.toDateString() === filterDate.toDateString();
      }

      // Filtrar por tiempo según el selector
      let timeMatch = true;
      if (timeFilter !== 'all') {
        const eventStartDate = new Date(event.StartDate);
        const eventEndDate = new Date(event.EndDate);

        if (timeFilter === 'live') {
          // Solo eventos en vivo ahora
          timeMatch = eventStartDate <= now && eventEndDate >= now;
        } else if (timeFilter === 'upcoming') {
          // Eventos próximos (incluye en vivo y futuros)
          timeMatch = eventEndDate >= now;
        } else if (timeFilter === 'past') {
          // Solo eventos pasados
          timeMatch = eventEndDate < now;
        }
      }

      return typeMatch && categoryMatch && dateMatch && timeMatch;
    });

    return filtered.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [events, filters, sortKey, sortDirection, timeFilter]);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: timezone,
      });
    } catch {
      return dateStr;
    }
  };

  const columns: { key: SortKey; label: string; formatter?: (val: string) => string }[] = [
    { key: 'Type', label: 'Tipo' },
    { key: 'CategoryDescription', label: 'Categoría' },
    { key: 'StartDate', label: 'Fecha de Inicio', formatter: formatDate },
    { key: 'EndDate', label: 'Fecha de Fin', formatter: formatDate },
    { key: 'Ring', label: 'Ring' },
    { key: 'Link', label: 'Link' },
  ];

  return (
    <div className="w-full">
      {/* Filtros arriba */}
      <div className="mb-6 bg-neutral-900 p-6 rounded-lg border border-neutral-700 shadow-2xl">
        <h3 className="text-xl font-bold mb-4 text-neutral-200 tracking-wide">FILTROS</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Selector de Tipo */}
          <div>
            <label className="block text-sm font-semibold text-neutral-300 mb-2 uppercase tracking-wider">
              Tipo
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full px-3 py-2 bg-neutral-800 text-white border border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-neutral-500"
            >
              <option value="" className="bg-neutral-900">Todos</option>
              {uniqueTypes.map((type) => (
                <option key={type} value={type} className="bg-neutral-900">
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Fecha */}
          <div>
            <label className="block text-sm font-semibold text-neutral-300 mb-2 uppercase tracking-wider">
              Fecha
            </label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="w-full px-3 py-2 bg-neutral-800 text-white border border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-neutral-500"
            />
          </div>

          {/* Input de Categoría */}
          <div>
            <label className="block text-sm font-semibold text-neutral-300 mb-2 uppercase tracking-wider">
              Categoría
            </label>
            <input
              type="text"
              placeholder="Buscar categoría..."
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-3 py-2 bg-neutral-800 text-white border border-neutral-600 rounded-md placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-neutral-500"
            />
          </div>

          {/* Selector de Timezone */}
          <div>
            <label className="block text-sm font-semibold text-neutral-300 mb-2 uppercase tracking-wider">
              Zona Horaria
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-800 text-white border border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-neutral-500"
            >
              {timezones.map((tz) => (
                <option key={tz.value} value={tz.value} className="bg-neutral-900">
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filtro de tiempo y botón limpiar */}
        <div className="mt-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-4 py-2 font-semibold rounded-md transition-all duration-200 ${
                timeFilter === 'all'
                  ? 'bg-neutral-600 text-white'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setTimeFilter('live')}
              className={`px-4 py-2 font-semibold rounded-md transition-all duration-200 ${
                timeFilter === 'live'
                  ? 'bg-green-700 text-white'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
              }`}
            >
              🔴 En Vivo
            </button>
            <button
              onClick={() => setTimeFilter('upcoming')}
              className={`px-4 py-2 font-semibold rounded-md transition-all duration-200 ${
                timeFilter === 'upcoming'
                  ? 'bg-blue-700 text-white'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
              }`}
            >
              Próximos
            </button>
            <button
              onClick={() => setTimeFilter('past')}
              className={`px-4 py-2 font-semibold rounded-md transition-all duration-200 ${
                timeFilter === 'past'
                  ? 'bg-neutral-600 text-white'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
              }`}
            >
              Pasados
            </button>
          </div>

          {(filters.type || filters.date || filters.category) && (
            <button
              onClick={() => setFilters({ type: '', date: '', category: '' })}
              className="px-5 py-2 bg-neutral-700 text-white font-semibold rounded-md hover:bg-neutral-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-lg shadow-2xl">
        <table className="min-w-full bg-black border border-neutral-800">
          <thead className="bg-neutral-900 text-white border-b-2 border-neutral-700">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-4 text-left">
                  <button
                    onClick={() => handleSort(col.key)}
                    className="flex items-center gap-2 hover:text-neutral-300 font-bold uppercase tracking-wider text-sm transition-colors"
                  >
                    {col.label}
                    {sortKey === col.key && (
                      <span className="text-neutral-400">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
        <tbody>
          {filteredAndSortedEvents.map((event, idx) => (
            <tr
              key={idx}
              className={`${
                idx % 2 === 0 ? 'bg-neutral-950' : 'bg-black'
              } hover:bg-neutral-900 transition-colors border-b border-neutral-800`}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-neutral-200">
                  {col.key === 'Link' && event[col.key] ? (
                    <a
                      href={event[col.key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-neutral-100 hover:text-white font-semibold transition-colors underline decoration-neutral-600 hover:decoration-white"
                    >
                      <span>▶</span> Ver Video
                    </a>
                  ) : col.formatter ? (
                    col.formatter(event[col.key])
                  ) : (
                    event[col.key]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        </table>
        {filteredAndSortedEvents.length === 0 && (
          <div className="text-center py-8 text-neutral-400 bg-black">
            No se encontraron eventos con los filtros aplicados.
          </div>
        )}
        <div className="mt-4 px-2 text-sm text-neutral-400 bg-black pb-4">
          Mostrando <span className="text-neutral-200 font-bold">{filteredAndSortedEvents.length}</span> de <span className="text-neutral-200 font-bold">{events.length}</span> eventos
        </div>
      </div>
    </div>
  );
}
