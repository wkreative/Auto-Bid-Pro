'use client';

import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useState, useEffect } from 'react';

export default function FavoriteButton({ vehicleId, className = '' }: { vehicleId: string; className?: string }) {
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from('favorites')
      .select('id')
      .eq('vehicle_id', vehicleId)
      .maybeSingle()
      .then(({ data }) => setIsFav(!!data));
  }, [vehicleId]);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);

    if (isFav) {
      await supabase.from('favorites').delete().eq('vehicle_id', vehicleId);
    } else {
      await supabase.from('favorites').insert({ vehicle_id: vehicleId });
    }

    setIsFav(!isFav);
    setLoading(false);
    router.refresh();
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`p-2 rounded-full backdrop-blur-md transition-all hover:scale-110 disabled:opacity-50 ${className}`}
    >
      <Heart className={`h-5 w-5 transition-colors ${isFav ? 'fill-red-500 text-red-500' : 'text-white'}`} />
    </button>
  );
}
