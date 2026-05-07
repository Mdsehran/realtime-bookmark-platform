import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')

  if (!url) {
    return NextResponse.json({ title: '', error: 'No URL provided' }, { status: 400 })
  }

  try {
    new URL(url) // Validate URL format
  } catch {
    return NextResponse.json({ title: '', error: 'Invalid URL' }, { status: 400 })
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FolioBot/1.0; +https://folio.app)',
        'Accept': 'text/html',
      },
      signal: AbortSignal.timeout(5000),
    })

    const html = await response.text()

    // Try og:title first, then <title>
    const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)?.[1]
      ?? html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i)?.[1]

    const titleTag = html.match(/<title[^>]*>([^<]{1,200})<\/title>/i)?.[1]

    const title = (ogTitle ?? titleTag ?? '').trim().replace(/\s+/g, ' ')

    return NextResponse.json({ title })
  } catch {
    return NextResponse.json({ title: '' })
  }
}
