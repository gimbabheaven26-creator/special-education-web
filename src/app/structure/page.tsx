import StructureClient from './StructureClient';
import { AdminOnly } from '@/components/AdminOnly';

export default async function StructurePage() {
  return (
    <AdminOnly>
      <StructureClient />
    </AdminOnly>
  );
}
