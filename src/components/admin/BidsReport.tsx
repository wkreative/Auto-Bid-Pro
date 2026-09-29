'use client';

import { useState } from 'react';
import { FileText, CheckCircle, XCircle, Eye, Printer, Search, Filter } from 'lucide-react';
import Link from 'next/link';

interface Bid {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  profiles?: { first_name?: string; last_name?: string; email?: string } | { first_name?: string; last_name?: string; email?: string }[];
  vehicles?: { id: string; brand: string; model: string; vin: string } | { id: string; brand: string; model: string; vin: string }[];
}

const statusColors: Record<string, string> = {
  submitted: 'bg-blue-500/20 text-blue-400',
  under_review: 'bg-yellow-500/20 text-yellow-400',
  approved: 'bg-green-500/20 text-green-400',
  rejected: 'bg-red-500/20 text-red-400',
  won: 'bg-green-500/20 text-green-400',
  lost: 'bg-red-500/20 text-red-400',
  negotiating: 'bg-purple-500/20 text-purple-400',
};

const statusLabels: Record<string, string> = {
  submitted: 'Enviada',
  under_review: 'En Revisión',
  approved: 'Aprobada',
  rejected: 'Rechazada',
  won: 'Ganada',
  lost: 'Perdida',
  negotiating: 'Negociando',
};

export default function BidsReport({ initialBids, updateBidStatus }: { initialBids: Bid[]; updateBidStatus: (id: string, status: string) => Promise<void> }) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredBids = initialBids.filter((bid) => {
    const vehicle = Array.isArray(bid.vehicles) ? bid.vehicles[0] : bid.vehicles;
    const profile = Array.isArray(bid.profiles) ? bid.profiles[0] : bid.profiles;
    
    // Status filter
    if (statusFilter !== 'all' && bid.status !== statusFilter) {
      return false;
    }

    // Search filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.trim().toLowerCase();
      const userName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.toLowerCase();
      const userEmail = (profile?.email || '').toLowerCase();
      const vehicleInfo = `${vehicle?.brand || ''} ${vehicle?.model || ''} ${vehicle?.vin || ''}`.toLowerCase();
      const amountStr = String(bid.amount || '');

      return userName.includes(term) || userEmail.includes(term) || vehicleInfo.includes(term) || amountStr.includes(term);
    }

    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* Header and Print Control */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 print:hidden">
        <div>
          <h1 className="text-3xl font-bold">Gestión y Reporte de Ofertas</h1>
          <p className="text-gray-400">Revisa, filtra e imprime el reporte de ofertas registradas.</p>
        </div>
        <button
          onClick={handlePrint}
          className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors self-start md:self-auto shadow-lg"
        >
          <Printer className="h-5 w-5" /> Imprimir / PDF
        </button>
      </div>

      {/* Printable Title (visible only during print) */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold text-black">Auto Bid Pro - Reporte de Ofertas</h1>
        <p className="text-sm text-gray-600">Fecha de generación: {new Date().toLocaleDateString('es-PR')} | Total de registros: {filteredBids.length}</p>
      </div>

      {/* Filter Controls (hidden on print) */}
      <div className="glass p-4 rounded-2xl border border-white/5 mb-6 flex flex-col md:flex-row items-center gap-4 print:hidden">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por usuario, correo, vehículo o VIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0a0a0a] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-primary w-full md:w-auto"
          >
            <option value="all">Todos los estados ({initialBids.length})</option>
            <option value="submitted">Enviadas</option>
            <option value="under_review">En Revisión</option>
            <option value="approved">Aprobadas</option>
            <option value="rejected">Rechazadas</option>
            <option value="won">Ganadas</option>
            <option value="lost">Perdidas</option>
            <option value="negotiating">Negociando</option>
          </select>
        </div>
      </div>

      {/* Bids Table */}
      <div className="glass rounded-3xl overflow-hidden border border-white/5 print:border-none print:shadow-none print:glass-none print:bg-white print:text-black">
        <table className="w-full text-left print:text-sm">
          <thead className="bg-white/5 border-b border-white/10 print:bg-gray-100 print:text-black print:border-gray-300">
            <tr>
              <th className="p-4 font-medium text-gray-400 print:text-black">Vehículo</th>
              <th className="p-4 font-medium text-gray-400 print:text-black">Usuario</th>
              <th className="p-4 font-medium text-gray-400 print:text-black">Oferta</th>
              <th className="p-4 font-medium text-gray-400 print:text-black">Estado</th>
              <th className="p-4 font-medium text-gray-400 print:text-black">Fecha</th>
              <th className="p-4 font-medium text-gray-400 print:hidden">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 print:divide-gray-200">
            {filteredBids.map((bid) => {
              const vehicle = Array.isArray(bid.vehicles) ? bid.vehicles[0] : bid.vehicles;
              const profile = Array.isArray(bid.profiles) ? bid.profiles[0] : bid.profiles;
              const isPending = bid.status === 'submitted' || bid.status === 'under_review' || bid.status === 'negotiating';
              return (
                <tr key={bid.id} className="hover:bg-white/[0.02] transition-colors print:hover:bg-transparent">
                  <td className="p-4">
                    <p className="font-bold print:text-black">{vehicle?.brand} {vehicle?.model}</p>
                    <p className="text-xs text-gray-500 print:text-gray-700">{vehicle?.vin}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-bold print:text-black">{profile?.first_name} {profile?.last_name}</p>
                    <p className="text-xs text-gray-500 print:text-gray-700">{profile?.email}</p>
                  </td>
                  <td className="p-4 font-bold text-green-400 print:text-black">
                    ${bid.amount?.toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase print:border print:border-gray-400 print:text-black ${statusColors[bid.status] || 'bg-gray-500/20 text-gray-400'}`}>
                      {statusLabels[bid.status] || bid.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-400 print:text-black">
                    {new Date(bid.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 print:hidden">
                    <div className="flex gap-2">
                      {vehicle?.id && (
                        <Link href={`/dashboard/vehicles/${vehicle.id}`} className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors" title="Ver vehículo">
                          <Eye className="h-5 w-5" />
                        </Link>
                      )}
                      {isPending && (
                        <>
                          <form action={updateBidStatus.bind(null, bid.id, 'under_review')}>
                            <button type="submit" className="p-2 hover:bg-yellow-500/20 text-yellow-400 rounded-lg transition-colors" title="Marcar en revisión">
                              <FileText className="h-5 w-5" />
                            </button>
                          </form>
                          <form action={updateBidStatus.bind(null, bid.id, 'approved')}>
                            <button type="submit" className="p-2 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors" title="Aprobar">
                              <CheckCircle className="h-5 w-5" />
                            </button>
                          </form>
                          <form action={updateBidStatus.bind(null, bid.id, 'rejected')}>
                            <button type="submit" className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors" title="Rechazar">
                              <XCircle className="h-5 w-5" />
                            </button>
                          </form>
                        </>
                      )}
                      {!isPending && (
                        <span className="text-xs text-gray-500 px-2 py-2">Resuelta</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredBids.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  No se encontraron ofertas con los filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
