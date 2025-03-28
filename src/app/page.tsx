import { Metadata } from 'next';
import { PasteForm } from '@/components/paste/paste-form';
import { SITE_NAME, SITE_DESCRIPTION } from '@/lib/constants';

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function Home() {
  return (
    <div className="flex h-[calc(100vh-6.5rem)] flex-col">
      <PasteForm />
    </div>
  );
}
