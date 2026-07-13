'use client';

import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useState, useEffect } from 'react';

export default function FavoriteButton({ vehicleId, className = '' }: { vehicleId: string; className?: string }) {
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        supabase
          .from('favorites')
          .select('id')
          .eq('user_id', data.user.id)
          .eq('vehicle_id', vehicleId)
          .maybeSingle()
          .then(({ data: fav }) => setIsFav(!!fav));
      }
    });
  }, [vehicleId]);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) return;
    setLoading(true);

    if (isFav) {
      await supabase.from('favorites').delete().eq('user_id', userId).eq('vehicle_id', vehicleId);
    } else {
      await supabase.from('favorites').insert({ user_id: userId, vehicle_id: vehicleId });
    }

    setIsFav(!isFav);
    setLoading(false);
    router.refresh();
  };

  return (
    <button
      onClick={toggle}
      disabled={loading || !userId}
      className={`p-2 rounded-full backdrop-blur-md transition-all hover:scale-110 disabled:opacity-50 ${className}`}
    >
      <Heart className={`h-5 w-5 transition-colors ${isFav ? 'fill-red-500 text-red-500' : 'text-white'}`} />
    </button>
  );
}
