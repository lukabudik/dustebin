import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SITE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `Privacy Policy for ${SITE_NAME}`,
};

export default function PrivacyPage() {
  return (
    <div className="container mb-16 min-h-[calc(100vh-6.5rem)] py-8">
      <div className="mx-auto max-w-3xl pb-16">
        <h1 className="mb-6 text-3xl font-bold">Privacy Policy</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Introduction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              This Privacy Policy outlines how {SITE_NAME} collects, uses, and protects your
              information when you use our service.
            </p>
            <p>
              We respect your privacy and are committed to protecting your personal data. This
              policy will inform you about how we look after your personal data and tell you about
              your privacy rights.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>We collect minimal information to provide and improve our service:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Content of pastes you create</li>
              <li>IP addresses (for rate limiting and abuse prevention)</li>
              <li>Browser information (for analytics and improving user experience)</li>
              <li>Optional account information if you choose to register</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-2 pl-5">
              <li>To provide and maintain our service</li>
              <li>To notify you about changes to our service</li>
              <li>To allow you to participate in interactive features of our service</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information so that we can improve our service</li>
              <li>To monitor the usage of our service</li>
              <li>To detect, prevent and address technical issues</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Data Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We implement appropriate security measures to protect your personal data against
              unauthorized access, alteration, disclosure, or destruction.
            </p>
            <p>
              However, no method of transmission over the Internet or method of electronic storage
              is 100% secure. While we strive to use commercially acceptable means to protect your
              personal data, we cannot guarantee its absolute security.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              If you have any questions about this Privacy Policy, please contact us at
              privacy@dustebin.com.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
