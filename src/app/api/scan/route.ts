import { NextRequest } from 'next/server';
import { load } from 'cheerio';

export const runtime = 'edge';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json; charset=utf-8'
};

// Rotate between different legitimate user agents
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15'
];

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders, status: 204 });
}

export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get('url');

  if (!target) {
    return new Response(
      JSON.stringify({ error: 'Missing "url" query parameter' }),
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    // Pick a random user agent
    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    
    // Make the request look as legitimate as possible
    const res = await fetch(target, {
      headers: {
        'User-Agent': randomUserAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        // Some sites check for referer
        'Referer': new URL(target).origin + '/'
      }
    });

    if (!res.ok) {
      // Provide helpful error messages
      let errorMessage = `Failed to fetch: ${res.status}`;
      let suggestion = null;
      
      if (res.status === 403) {
        errorMessage = 'Access forbidden (403). The website is blocking automated requests.';
        suggestion = 'manual_input';
      } else if (res.status === 429) {
        errorMessage = 'Rate limited (429). Too many requests. Please try again in a few minutes.';
        suggestion = 'retry_later';
      } else if (res.status === 401) {
        errorMessage = 'Authentication required (401). This page requires a login.';
        suggestion = 'manual_input';
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          status: res.status,
          suggestion
        }),
        { status: 502, headers: corsHeaders }
      );
    }

    const html = await res.text();
    const $ = load(html);
    const jsonBlocks: string[] = [];

    $('script[type="application/ld+json"]').each((index, element) => {
      const content = $(element).html();
      if (content) jsonBlocks.push(content.trim());
    });

    const result = {
      url: target,
      found: jsonBlocks.length,
      json: jsonBlocks
    };

    return new Response(JSON.stringify(result, null, 2), {
      status: 200,
      headers: corsHeaders
    });
  } catch (err: unknown) {
    return new Response(
      JSON.stringify({ 
        error: (err as Error).message ?? 'Unknown error',
        suggestion: 'manual_input'
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}