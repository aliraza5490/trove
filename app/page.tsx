import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { BackgroundRippleEffect } from '@/components/ui/background-ripple-effect';
import { LandingHeader } from '@/components/landing-header';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  ArrowRight,
  LogIn,
  Rocket,
  Search,
  Shield,
  Sparkles,
  Upload,
  MessageSquare,
  Layers,
  Database,
  Bot,
} from 'lucide-react';

export default async function Home() {
  return (
    <main className="min-h-[100dvh] flex flex-col overflow-x-hidden">
      {/* Fixed Landing Navigation at root of main */}
      <LandingHeader />

      {/* Hero Section with Background Ripple Effect behind header */}
      <section className="relative w-full overflow-hidden pt-20 sm:pt-24 md:pt-28 pb-16 sm:pb-24" aria-label="Hero">
        {/* Background Ripple Effect covering entire hero area including navigation bar */}
        <BackgroundRippleEffect rows={14} cols={35} />
        {/* Gradient glow overlay */}
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[38rem] bg-gradient-to-b from-primary/10 via-fuchsia-500/5 to-transparent blur-2xl" />

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
          <div className="max-w-3xl mx-auto flex flex-col items-center">
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground bg-secondary/50 backdrop-blur">
              <Sparkles className="size-3.5 text-primary" />
              Meet your personal AI assistant
            </div>
            <h1 className="relative z-10 mx-auto mt-6 max-w-4xl text-center text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Your personal <br />
              <span className="bg-gradient-to-r from-primary via-fuchsia-600 to-indigo-600 bg-clip-text text-transparent">
                AI assistant
              </span>
            </h1>
            <p className="relative z-10 mx-auto mt-4 max-w-xl text-center text-muted-foreground text-base sm:text-lg">
              Upload PDFs, notes, and articles. Ask questions and get instant, accurate answers with direct source citations from your personal knowledge base.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/signup">
                <Button size="lg" className="shadow-3xl">
                  Start for free
                  <Rocket className="size-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Sign in
                  <LogIn className="size-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Product preview image */}
          <div className="mt-12 relative mx-auto max-w-5xl rounded-xl border bg-card/60 p-4 backdrop-blur transition-all duration-300 hover:shadow-primary/5 hover:scale-[1.01]">
            <Image
              src="/chat.png"
              alt="Product preview showing the Trove workspace with Postgres + pgvector, Embeddings, and LLM answers"
              width={1918}
              height={944}
              priority
              className="w-full h-auto rounded-lg shadow-2xl border"
            />
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full border px-2.5 py-1">
              Postgres + pgvector
            </span>
            <span className="rounded-full border px-2.5 py-1">Embeddings</span>
            <span className="rounded-full border px-2.5 py-1">LLM answers</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        aria-labelledby="features-heading"
        className="relative mx-auto max-w-7xl px-6 py-20 scroll-mt-24"
      >
        <div className="text-center mb-10">
          <h2
            id="features-heading"
            className="text-2xl sm:text-3xl font-semibold"
          >
            Features
          </h2>
          <p className="text-muted-foreground mt-2">
            Everything you need to chat with your knowledge
          </p>
        </div>

        <div className="flex w-full gap-6 flex-wrap justify-center">
          <Card className="w-full md:w-56 flex flex-col">
            <CardHeader className="space-y-2">
              <div className="inline-flex size-10 items-center justify-center rounded-full bg-primary/10">
                <Upload className="size-5 text-primary" />
              </div>
              <CardTitle>Upload anything</CardTitle>
              <CardDescription>
                PDFs, notes, and web articles are supported.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="w-full md:w-56 flex flex-col">
            <CardHeader className="space-y-2">
              <div className="inline-flex size-10 items-center justify-center rounded-full bg-primary/10">
                <MessageSquare className="size-5 text-primary" />
              </div>
              <CardTitle>Chat with your docs</CardTitle>
              <CardDescription>
                Ask questions and get concise, cited answers.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="w-full md:w-56 flex flex-col">
            <CardHeader className="space-y-2">
              <div className="inline-flex size-10 items-center justify-center rounded-full bg-primary/10">
                <Search className="size-5 text-primary" />
              </div>
              <CardTitle>Semantic search</CardTitle>
              <CardDescription>
                Vector similarity finds the most relevant chunks.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="w-full md:w-56 flex flex-col">
            <CardHeader className="space-y-2">
              <div className="inline-flex size-10 items-center justify-center rounded-full bg-primary/10">
                <Shield className="size-5 text-primary" />
              </div>
              <CardTitle>Private by default</CardTitle>
              <CardDescription>
                Your data stays in your workspace with access controls.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="mx-auto max-w-7xl px-6 pb-20 scroll-mt-24"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-semibold">How it works</h2>
          <p className="text-muted-foreground mt-2">
            Retrieval-Augmented Generation in four steps
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border p-6 bg-card/60">
            <div className="flex items-center gap-2 font-medium">
              <Upload className="text-primary" /> Upload
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Add your PDFs, notes, and articles.
            </p>
          </div>
          <div className="rounded-xl border p-6 bg-card/60">
            <div className="flex items-center gap-2 font-medium">
              <Layers className="text-primary" /> Chunk & embed
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              We split docs and create vector embeddings.
            </p>
          </div>
          <div className="rounded-xl border p-6 bg-card/60">
            <div className="flex items-center gap-2 font-medium">
              <Database className="text-primary" /> Store & retrieve
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Indexed in Postgres with pgvector for fast similarity search.
            </p>
          </div>
          <div className="rounded-xl border p-6 bg-card/60">
            <div className="flex items-center gap-2 font-medium">
              <Bot className="text-primary" /> Answer
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Relevant context is fed to the LLM to craft a concise answer.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-primary/10 via-accent/20 to-transparent p-8 sm:p-10">
          <div className="relative z-10">
            <h3 className="text-xl sm:text-2xl font-semibold">
              Build your second brain with Trove
            </h3>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Organize your knowledge and get instant answers backed by your own
              sources.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/signup">
                <Button size="lg">Create your account</Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Sign in
                </Button>
              </Link>
            </div>
          </div>
          <div className="pointer-events-none absolute -right-16 -bottom-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t">
        <div className="mx-auto max-w-7xl px-6 py-10 text-sm text-muted-foreground flex flex-col sm:flex-row gap-4 sm:gap-0 items-center justify-between">
          <span>© {new Date().getFullYear()} Trove</span>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-foreground">
              Sign in
            </Link>
            <Link href="/signup" className="hover:text-foreground">
              Get started
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
