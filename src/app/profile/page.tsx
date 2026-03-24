import type { Metadata } from 'next';

import ProfilePage from '@/components/profile-page';

export const metadata: Metadata = {
  title: 'Hồ sơ người dùng | PregTap',
  description: 'Xem và cập nhật hồ sơ người dùng trên PregTap.',
};

export default function ProfileRoute() {
  return <ProfilePage />;
}