import { supabaseServer } from './supabaseServer';

export type ActionMode = 'auto' | 'confirm' | 'deny';

export interface ActionGuardResult {
  mode: ActionMode;
  allowed: boolean;
  pendingActionId?: string;
  reason?: string;
}

/**
 * Checks the permission mode for a specific action and client before execution.
 * Calls RPC action_mode(p_client, p_action) in Supabase.
 */
export async function getActionMode(clientId: string, actionName: string): Promise<ActionMode> {
  const { data, error } = await supabaseServer.rpc('action_mode', {
    p_client: clientId,
    p_action: actionName,
  });

  if (error) {
    console.error(`Error querying action_mode for client ${clientId}, action ${actionName}:`, error);
    return 'deny'; // Fail closed
  }

  return (data as ActionMode) || 'deny';
}

/**
 * Evaluates an action through the action guard wall:
 * - 'auto': Permits execution directly and logs into action_log.
 * - 'confirm': Enqueues into pending_actions for human approval and returns waiting status.
 * - 'deny': Forbids action immediately and logs security denial.
 */
export async function guardAndHandleAction(
  clientId: string,
  actionName: string,
  payload: Record<string, unknown>
): Promise<ActionGuardResult> {
  const mode = await getActionMode(clientId, actionName);

  if (mode === 'deny') {
    await logAction(clientId, actionName, 'deny', payload, 'Blocked: Denied by permissions policy');
    return {
      mode: 'deny',
      allowed: false,
      reason: 'Action denied by permissions policy.',
    };
  }

  if (mode === 'confirm') {
    // Insert into pending_actions queue
    const { data: pendingAction, error: pendingErr } = await supabaseServer
      .from('pending_actions')
      .insert({
        client_id: clientId,
        action: actionName,
        payload,
        status: 'waiting',
      })
      .select('id')
      .single();

    if (pendingErr) {
      console.error('Failed to insert into pending_actions:', pendingErr);
      return {
        mode: 'confirm',
        allowed: false,
        reason: 'Failed to create pending action.',
      };
    }

    await logAction(clientId, actionName, 'confirm', payload, `Queued for client confirmation: ID ${pendingAction.id}`);

    return {
      mode: 'confirm',
      allowed: false,
      pendingActionId: pendingAction.id,
      reason: 'Action requires client confirmation before execution.',
    };
  }

  // mode === 'auto'
  return {
    mode: 'auto',
    allowed: true,
  };
}

/**
 * Records an execution or attempt into public.action_log
 */
export async function logAction(
  clientId: string,
  action: string,
  modeApplied: ActionMode,
  payload: Record<string, unknown>,
  result: string
) {
  try {
    await supabaseServer.from('action_log').insert({
      client_id: clientId,
      action,
      mode_applied: modeApplied,
      payload,
      result,
    });
  } catch (err) {
    console.error('Failed to record action_log:', err);
  }
}
