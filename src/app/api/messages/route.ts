import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

/**
 * GET /api/messages?client_id=xxx
 * Retrieves messages for a specific client (Server-side validation)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('client_id');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    if (!clientId) {
      return NextResponse.json({ error: 'client_id parameter is required' }, { status: 400 });
    }

    const { data: messages, error } = await supabaseServer
      .from('messages')
      .select('*')
      .eq('client_id', clientId)
      .order('sent_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: messages?.length || 0, messages });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/messages
 * Ingests incoming messages from channels (WhatsApp, Telegram, etc.)
 * Saves directly into public.messages table with deduplication and client isolation.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      client_id,
      channel_id,
      direction = 'in',
      external_id,
      contact,
      contact_name,
      kind = 'text',
      text_body,
      media_path,
      summary,
      importance,
      sent_at,
    } = body;

    if (!client_id) {
      return NextResponse.json({ error: 'client_id is required' }, { status: 400 });
    }

    if (!contact && !text_body) {
      return NextResponse.json(
        { error: 'At least contact or text_body must be provided' },
        { status: 400 }
      );
    }

    // Insert message into public.messages
    const { data: message, error } = await supabaseServer
      .from('messages')
      .insert({
        client_id,
        channel_id: channel_id || null,
        direction,
        external_id: external_id || null,
        contact: contact || 'unknown',
        contact_name: contact_name || null,
        kind,
        body: text_body || '',
        media_path: media_path || null,
        summary: summary || null,
        importance: importance || 3,
        sent_at: sent_at ? new Date(sent_at).toISOString() : new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) {
      // Check for unique constraint violation (duplicate message in external_id)
      if (error.code === '23505') {
        return NextResponse.json(
          { success: true, message: 'Duplicate message ignored', isDuplicate: true },
          { status: 200 }
        );
      }

      console.error('Failed to store incoming message:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error: unknown) {
    console.error('Error ingesting message:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
