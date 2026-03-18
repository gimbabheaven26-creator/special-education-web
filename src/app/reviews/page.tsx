import { AdminOnly } from '@/components/AdminOnly';
import ReviewsClient from './ReviewsClient';

export default function ReviewsPage() {
  return (
    <AdminOnly>
      <ReviewsClient />
    </AdminOnly>
  );
}
