import Link from 'next/link';
import { Button } from '@/components/ui/button';
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
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Bot aria-hidden className="size-6 text-primary" />
            <span className="font-semibold">Trove</span>
          </Link>
          <nav
            aria-label="Primary"
            className="flex flex-wrap items-center gap-2 sm:gap-3"
          >
            <Link
              href="#features"
              className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground"
            >
              How it works
            </Link>
            <Link href="/login" className="hidden sm:inline-flex">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button size="lg">
                Get started
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden" aria-label="Hero">
        {/* Stable, low-risk gradient background */}
        <div className="absolute inset-x-0 top-0 -z-10 h-[32rem] bg-gradient-to-b from-primary/20 via-fuchsia-500/10 to-transparent blur-2xl" />
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground bg-secondary/50">
            <Sparkles className="size-3.5 text-primary" />
            RAG-powered answers from your own docs
          </div>
          <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
            Your personal
            <span className="bg-gradient-to-r from-primary via-fuchsia-600 to-indigo-600 bg-clip-text text-transparent">
              {' '}
              knowledge‑base chatbot
            </span>
          </h1>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Upload PDFs, notes, and articles, then chat with an AI that cites
            the most relevant passages using vector search.
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

          {/* Inline SVG preview to avoid images */}
          <div className="mt-12 relative mx-auto max-w-5xl rounded-xl border bg-card/60 p-4 backdrop-blur">
            <svg
              role="img"
              aria-label="Product preview"
              viewBox="0 0 800 460"
              className="w-full h-auto rounded-lg shadow-3xl"
            >
              <rect
                x="4"
                y="4"
                width="792"
                height="452"
                rx="14"
                fill="currentColor"
                className="text-secondary/40"
              />
              <rect
                x="40"
                y="40"
                width="720"
                height="380"
                rx="28"
                fill="currentColor"
                className="text-secondary/70"
              />
              <circle
                cx="120"
                cy="110"
                r="14"
                fill="currentColor"
                className="text-primary"
              />
              <circle
                cx="170"
                cy="110"
                r="14"
                fill="currentColor"
                className="text-primary"
              />
              <circle
                cx="220"
                cy="110"
                r="14"
                fill="currentColor"
                className="text-primary"
              />
              <rect
                x="80"
                y="180"
                width="640"
                height="22"
                rx="6"
                fill="currentColor"
                className="text-foreground/70"
              />
              <rect
                x="80"
                y="220"
                width="560"
                height="14"
                rx="5"
                fill="currentColor"
                className="text-muted-foreground/60"
              />
              <rect
                x="80"
                y="244"
                width="600"
                height="14"
                rx="5"
                fill="currentColor"
                className="text-muted-foreground/50"
              />
              <rect
                x="80"
                y="268"
                width="520"
                height="14"
                rx="5"
                fill="currentColor"
                className="text-muted-foreground/40"
              />
            </svg>
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
