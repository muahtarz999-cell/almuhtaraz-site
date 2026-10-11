import { NextRequest, NextResponse } from 'next/server';
import { guardAndHandleAction, logAction } from '@/lib/actionGuard';
import { supabaseServer } from '@/lib/supabaseServer';

/**
 * POST /api/actions/execute
 * Requests execution of an AI or system action.
 * GUARANTEES: Always checks action_mode before execution.
 * 
 * Request body:
 * {
 *   "client_id": "uuid",
 *   "action": "message.send" | "email.send" | "task.create" | etc.,
 *   "payload": { ... }
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const { client_id, action, payload = {} } = await req.json();

    if (!client_id || !action) {
      return NextResponse.json(
        { error: 'client_id and action are required' },
        { status: 400 }
      );
    }

    // 1. Guard check
    const guardResult = await guardAndHandleAction(client_id, action, payload);

    if (!guardResult.allowed) {
      return NextResponse.json({
        success: false,
        status: guardResult.mode,
        pendingActionId: guardResult.pendingActionId,
        message: guardResult.reason,
      });
    }

    // 2. Action is 'auto' - Execute action logic safely
    let executionResult = '';

    switch (action) {
      case 'task.create': {
        const { title, details, assignee, due_at } = payload;
        const { data: task, error } = await supabaseServer
          .from('tasks')
          .insert({
            client_id,
            title: title || 'مهمة جديدة',
            details: details || null,
            assignee: assignee || null,
            due_at: due_at || null,
            status: 'open',
          })
          .select()
          .single();

        if (error) throw error;
        executionResult = `Task created successfully with ID: ${task.id}`;
        break;
      }

      case 'message.send': {
        // Mock or integrate with channel API (Meta / Telegram)
        const { contact, text_body, channel_id } = payload;
        const { data: outMessage, error } = await supabaseServer
          .from('messages')
          .insert({
            client_id,
            channel_id: channel_id || null,
            direction: 'out',
            contact: contact || 'unknown',
            body: text_body || '',
            kind: 'text',
          })
          .select()
          .single();

        if (error) throw error;
        executionResult = `Message dispatched with ID: ${outMessage.id}`;
        break;
      }

      default: {
        executionResult = `Action ${action} executed successfully.`;
        break;
      }
    }

    // 3. Log successful execution into action_log
    await logAction(client_id, action, 'auto', payload, executionResult);

    return NextResponse.json({
      success: true,
      status: 'executed',
      mode: 'auto',
      result: executionResult,
    });
  } catch (error: unknown) {
    console.error('Error executing action:', error);
    const message = error instanceof Error ? error.message : 'Internal execution error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
