import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SITE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: `Terms of Service for ${SITE_NAME}`,
};

export default function TermsPage() {
  return (
    <div className="container flex h-[calc(100vh-6.5rem)] flex-col overflow-hidden py-8">
      <div className="mx-auto max-w-3xl flex-1 overflow-y-auto">
        <h1 className="mb-6 text-3xl font-bold">Terms of Service</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Introduction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Welcome to {SITE_NAME}. These Terms of Service govern your use of our website and
              services.
            </p>
            <p>
              By accessing or using {SITE_NAME}, you agree to be bound by these Terms. If you
              disagree with any part of the terms, you may not access the service.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Use of Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              {SITE_NAME} provides a platform for sharing code snippets and text. You are
              responsible for the content you post and share through our service.
            </p>
            <p>You agree not to use {SITE_NAME} to:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Post illegal, harmful, threatening, abusive, or otherwise objectionable content
              </li>
              <li>Impersonate any person or entity</li>
              <li>Post content that infringes on intellectual property rights</li>
              <li>Upload malicious code or attempt to compromise the security of the platform</li>
              <li>Collect user information without their consent</li>
              <li>Interfere with or disrupt the service or servers</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Content Ownership</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              You retain all rights to the content you post on {SITE_NAME}. By posting content, you
              grant {SITE_NAME} a worldwide, non-exclusive, royalty-free license to use, reproduce,
              and display your content in connection with the service.
            </p>
            <p>
              We do not claim ownership of your content, but we need these rights to provide the
              service.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Service Modifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              {SITE_NAME} reserves the right to modify or discontinue, temporarily or permanently,
              the service with or without notice.
            </p>
            <p>
              We shall not be liable to you or any third party for any modification, suspension, or
              discontinuance of the service.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              {SITE_NAME} and its affiliates shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages resulting from your use of or inability to
              use the service.
            </p>
            <p>
              We provide the service on an &quot;as is&quot; and &quot;as available&quot; basis,
              without any warranties of any kind.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              If you have any questions about these Terms, please contact us at terms@dustebin.com.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
