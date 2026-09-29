import { connection } from 'next/server';
import ImportVehicles from '@/components/admin/ImportVehicles';
import { createBatchId } from '@/lib/import-batches';

export default async function ImportPage() {
  await connection();
  return <ImportVehicles initialBatchId={createBatchId()} />;
}
