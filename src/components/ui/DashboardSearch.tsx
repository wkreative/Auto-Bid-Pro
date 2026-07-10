'use client';
import { Search } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function DashboardSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
    if (searchQuery.trim()) {
      currentParams.set('q', searchQuery.trim());
    } else {
      currentParams.delete('q');
    }
    router.push(`/dashboard?${currentParams.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
      <input 
        type="text" 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Buscar por marca, modelo o VIN..." 
        className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-white focus:outline-none focus:border-primary/50 transition-colors"
      />
    </form>
  );
}
