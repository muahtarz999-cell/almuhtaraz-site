import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { logAction } from '@/lib/actionGuard';

/**
 * GET /api/pending-actions?client_id=xxx
 * Retrieves pending actions awaiting user confirmation
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('client_id');

    if (!clientId) {
      return NextResponse.json({ error: 'client_id is required' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('pending_actions')
      .select('*')
      .eq('client_id', clientId)
      .eq('status', 'waiting')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, pendingActions: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/pending-actions/decide
 * Approves or rejects a pending action
 * Body: { id: "uuid", client_id: "uuid", decision: "approved" | "rejected" }
 */
export async function POST(req: NextRequest) {
  try {
    const { id, client_id, decision } = await req.json();

    if (!id || !client_id || !['approved', 'rejected'].includes(decision)) {
      return NextResponse.json(
        { error: 'Valid id, client_id, and decision ("approved" | "rejected") are required' },
        { status: 400 }
      );
    }

    // Fetch the action ensuring it belongs to the client and is waiting
    const { data: pending, error: fetchErr } = await supabaseServer
      .from('pending_actions')
      .select('*')
      .eq('id', id)
      .eq('client_id', client_id)
      .eq('status', 'waiting')
      .single();

    if (fetchErr || !pending) {
      return NextResponse.json(
        { error: 'Pending action not found or already decided.' },
        { status: 404 }
      );
    }

    // Update status in pending_actions
    const { error: updateErr } = await supabaseServer
      .from('pending_actions')
      .update({
        status: decision,
        decided_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // If approved, trigger execution
    let executionNote = `Client decision: ${decision}`;
    if (decision === 'approved') {
      executionNote = `Approved by client. Action executed for ${pending.action}.`;
    }

    // Log to action_log
    await logAction(
      client_id,
      pending.action,
      'confirm',
      pending.payload,
      executionNote
    );

    return NextResponse.json({
      success: true,
      decision,
      actionId: id,
      result: executionNote,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
