import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description: `Learn more about ${SITE_NAME} - ${SITE_DESCRIPTION}`,
};

export default function AboutPage() {
  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">About {SITE_NAME}</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What is {SITE_NAME}?</CardTitle>
            <CardDescription>{SITE_DESCRIPTION}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              {SITE_NAME} is a modern, secure code sharing platform that allows developers to easily share code snippets with others. 
              Whether you need to share a quick code snippet with a colleague or store code for future reference, {SITE_NAME} makes it simple.
            </p>
            <p>
              Our platform is built with security and performance in mind, using modern technologies to provide a fast and reliable experience.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              <li>Syntax highlighting for various programming languages</li>
              <li>Public and private pastes</li>
              <li>Password protection for sensitive code</li>
              <li>Expiration options for temporary pastes</li>
              <li>Easy sharing with short URLs</li>
              <li>Clean, modern interface</li>
              <li>Fast and responsive design</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Technology Stack</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              <li>Next.js - React framework for server-rendered applications</li>
              <li>TypeScript - Type-safe JavaScript</li>
              <li>Tailwind CSS - Utility-first CSS framework</li>
              <li>Shadcn UI - Accessible UI components</li>
              <li>PostgreSQL - Robust relational database</li>
              <li>Prisma - Type-safe database client</li>
              <li>CodeMirror - Versatile text editor</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Open Source</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              {SITE_NAME} is an open-source project. You can find the source code on GitHub and contribute to its development.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline">
              <Link href="https://github.com/yourusername/dustebin" target="_blank" rel="noopener noreferrer">
                View on GitHub
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
