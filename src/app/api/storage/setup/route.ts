import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!serviceRoleKey || !supabaseUrl) {
    return NextResponse.json(
      { error: 'Falta SUPABASE_SERVICE_ROLE_KEY o NEXT_PUBLIC_SUPABASE_URL en .env.local' },
      { status: 500 }
    )
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const results: { action: string; status: string; error?: string }[] = []

  // 1. Create or update bucket
  const { data: bucket, error: bucketError } = await supabase.storage.createBucket('vehicle_media', {
    public: true,
  })

  if (bucketError && !bucketError.message.includes('already exists')) {
    results.push({ action: 'Crear bucket', status: 'error', error: bucketError.message })
  } else {
    results.push({ action: 'Crear/actualizar bucket', status: 'ok' })
  }

  // 2. Ensure bucket is public
  const { error: updateError } = await supabase.storage.updateBucket('vehicle_media', {
    public: true,
  })

  if (updateError && !updateError.message.includes('does not exist')) {
    results.push({ action: 'Hacer bucket público', status: 'error', error: updateError.message })
  } else {
    results.push({ action: 'Bucket configurado como público', status: 'ok' })
  }

  // 3. Create storage policies via SQL (bypasses RLS with service_role key)
  const sqlPolicies = `
    DROP POLICY IF EXISTS "Anyone can view files in vehicle_media" ON storage.objects;
    CREATE POLICY "Anyone can view files in vehicle_media"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'vehicle_media');

    DROP POLICY IF EXISTS "Admins can upload files to vehicle_media" ON storage.objects;
    CREATE POLICY "Admins can upload files to vehicle_media"
      ON storage.objects FOR INSERT
      WITH CHECK (
        bucket_id = 'vehicle_media' AND
        (SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid())
      );

    DROP POLICY IF EXISTS "Admins can update files in vehicle_media" ON storage.objects;
    CREATE POLICY "Admins can update files in vehicle_media"
      ON storage.objects FOR UPDATE
      USING (bucket_id = 'vehicle_media')
      WITH CHECK (
        bucket_id = 'vehicle_media' AND
        (SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid())
      );

    DROP POLICY IF EXISTS "Admins can delete files from vehicle_media" ON storage.objects;
    CREATE POLICY "Admins can delete files from vehicle_media"
      ON storage.objects FOR DELETE
      USING (
        bucket_id = 'vehicle_media' AND
        (SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid())
      );
  `

  const { error: sqlError } = await supabase.rpc('exec_sql', { sql: sqlPolicies })

  if (sqlError) {
    results.push({ action: 'Crear políticas SQL via RPC', status: 'error', error: sqlError.message })

    // Fallback: try raw query
    const { error: queryError } = await supabase
      .from('_sql_queries')
      .insert({ query: sqlPolicies })
      .single()

    if (queryError) {
      results.push({
        action: 'Fallback SQL',
        status: 'error',
        error: 'No se pudieron crear las políticas automáticamente. Debes crearlas manualmente desde la UI de Supabase Storage.',
      })
    }
  } else {
    results.push({ action: 'Políticas de Storage creadas', status: 'ok' })
  }

  return NextResponse.json({
    message: 'Resultado de la configuración de storage',
    results,
    note: 'Si las políticas no se crearon automáticamente, créalas manualmente desde la UI de Supabase Storage.',
  })
}
