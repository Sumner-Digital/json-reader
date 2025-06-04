import { NextRequest } from 'next/server';
import { load } from 'cheerio';
// Remove the Element import - it's not needed and causing the error

export const runtime = 'edge';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json; charset=utf-8'
};

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
    const res = await fetch(target, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; StructuredDataChecker/0.1; +https://example.com)'
      }
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch: ${res.status}` }),
        { status: 502, headers: corsHeaders }
      );
    }

    const html = await res.text();
    const $ = load(html);
    const jsonBlocks: string[] = [];

    // Fixed: Use proper callback parameters - index is first, element is second
    // The element parameter is already a DOM element, not a CheerioElement
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
      JSON.stringify({ error: (err as Error).message ?? 'Unknown error' }),
      { status: 500, headers: corsHeaders }
    );
  }
}