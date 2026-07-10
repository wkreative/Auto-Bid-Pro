import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!serviceRoleKey || !supabaseUrl) {
    return NextResponse.json(
      { error: 'Falta SUPABASE_SERVICE_ROLE_KEY o NEXT_PUBLIC_SUPABASE_URL en .env.local' },
      { status: 500 }
    )
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const vehicleId = formData.get('vehicleId') as string

    if (!vehicleId) {
      return NextResponse.json({ error: 'vehicleId es requerido' }, { status: 400 })
    }

    if (files.length === 0) {
      return NextResponse.json({ error: 'No se enviaron archivos' }, { status: 400 })
    }

    const uploaded: { file: string; url: string }[] = []
    const errors: { file: string; error: string }[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const bytes = await file.arrayBuffer()
      const buffer = new Uint8Array(bytes)

      const fileExt = file.name.split('.').pop()
      const fileName = `${vehicleId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('vehicle_media')
        .upload(fileName, buffer, {
          contentType: file.type,
        })

      if (uploadError) {
        errors.push({ file: file.name, error: uploadError.message })
        continue
      }

      const { data: publicUrlData } = supabase.storage
        .from('vehicle_media')
        .getPublicUrl(fileName)

      const { error: insertError } = await supabase
        .from('vehicle_images')
        .insert({
          vehicle_id: vehicleId,
          url: publicUrlData.publicUrl,
          is_primary: i === 0,
        })

      if (insertError) {
        errors.push({ file: file.name, error: `Insert en DB falló: ${insertError.message}` })
      } else {
        uploaded.push({ file: file.name, url: publicUrlData.publicUrl })
      }
    }

    return NextResponse.json({
      uploaded,
      errors,
      success: errors.length === 0,
      partial: errors.length > 0 && uploaded.length > 0,
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
