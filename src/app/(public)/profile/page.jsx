'use client';
import ProtectedRoute from '@/shared/routes/ProtectedRoute';
import ProfilePage from '@/features/profile/pages/ProfilePage';

export default function Page() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  );
}
