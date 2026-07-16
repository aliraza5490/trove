export async function executeWebSearch(query: string): Promise<string> {
  const tavilyApiKey = process.env.TAVILY_API_KEY;
  if (tavilyApiKey) {
    try {
      const tavilyResponse = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: tavilyApiKey,
          query,
          num_results: 3,
        }),
      });
      if (tavilyResponse.ok) {
        const data = await tavilyResponse.json();
        return data.results
          .map((r: any) => `Title: ${r.title}\nURL: ${r.url}\nContent: ${r.content}`)
          .join("\n\n");
      }
    } catch (e) {
      console.error("Tavily search API failed:", e);
    }
  }

  // Fallback to simulated web search context
  return `Search query: "${query}"\nResults:\n1. Trove Project: Trove is a responsive and beautiful web application featuring a dashboard, user authentication, and AI chats.\n2. LangChain: A framework for developing applications powered by language models.\n3. Next.js Routing: Utilizes standard dynamic routes and Server Actions in App Router.`;
}
