'use client';

import React, { useState } from 'react';

export default function HomePage() {
  const [clientId, setClientId] = useState('');
  const [actionName, setActionName] = useState('message.send');
  const [payloadText, setPayloadText] = useState('{"contact": "+966500000000", "text_body": "مرحبا بك"}');
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  // Quick Action Guard Test
  const handleTestGuard = async () => {
    setLoading(true);
    setResult(null);
    try {
      let parsedPayload = {};
      try {
        parsedPayload = JSON.parse(payloadText);
      } catch {
        alert('يرجى كتابة صيغة JSON صحيحة للـ payload');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/actions/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId.trim(),
          action: actionName,
          payload: parsedPayload,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err: unknown) {
      setResult({ error: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0f1d',
      color: '#f1f5f9',
      padding: '40px 20px',
      boxSizing: 'border-box'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <header style={{
          borderBottom: '1px solid #1e293b',
          paddingBottom: '24px',
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#38bdf8' }}>
              🛡️ خادم مساعد الأعمال — شركة المحترز
            </h1>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '15px' }}>
              محرك الصلاحيات (Action Guard)، تسجيل الدخول، وحفظ الرسائل الواردة
            </p>
          </div>
          <div style={{
            background: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            borderRadius: '8px',
            padding: '6px 14px',
            fontSize: '13px',
            color: '#38bdf8'
          }}>
            Next.js + Supabase Ready
          </div>
        </header>

        {/* System Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
          marginBottom: '36px'
        }}>
          <div style={{
            background: '#131d31',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #1e293b'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#10b981', fontSize: '18px' }}>
              🔑 تسجيل الدخول (Auth)
            </h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8', lineHeight: '1.6' }}>
              مسار <code>/api/auth/login</code> للتحقق من هوية المستخدم وربطه بحساب العميل في جدول <code>clients</code>.
            </p>
          </div>

          <div style={{
            background: '#131d31',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #1e293b'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#38bdf8', fontSize: '18px' }}>
              📥 حفظ الرسائل الواردة
            </h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8', lineHeight: '1.6' }}>
              مسار <code>/api/messages</code> لاستقبال وتخزين رسائل القنوات (واتساب / تلغرام) في جدول <code>messages</code>.
            </p>
          </div>

          <div style={{
            background: '#131d31',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #1e293b'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#f59e0b', fontSize: '18px' }}>
              ⚡ فحص جدار الصلاحيات
            </h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8', lineHeight: '1.6' }}>
              استدعاء دالة <code>action_mode</code> تلقائياً (auto للتنفيذ المباشر، confirm للموافقة، deny للمنع).
            </p>
          </div>
        </div>

        {/* Interactive Testing Panel */}
        <div style={{
          background: '#0f172a',
          borderRadius: '16px',
          border: '1px solid #334155',
          padding: '28px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '20px' }}>
            🧪 اختبار جدار الصلاحيات (Action Guard Tester)
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', color: '#cbd5e1' }}>
                معرف العميل (client_id UUID):
              </label>
              <input
                type="text"
                placeholder="مثال: a1b2c3d4-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  background: '#1e293b',
                  color: '#fff',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', color: '#cbd5e1' }}>
                الفعل المطلوب (Action):
              </label>
              <select
                value={actionName}
                onChange={(e) => setActionName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  background: '#1e293b',
                  color: '#fff',
                  boxSizing: 'border-box'
                }}
              >
                <option value="message.send">message.send (إرسال رسالة - الافتراضي: confirm)</option>
                <option value="message.read">message.read (قراءة الرسائل - الافتراضي: auto)</option>
                <option value="email.send">email.send (إرسال بريد - الافتراضي: confirm)</option>
                <option value="task.create">task.create (إنشاء مهمة - الافتراضي: auto)</option>
                <option value="device.open_app">device.open_app (فتح تطبيق - الافتراضي: confirm)</option>
                <option value="unregistered.action">unregistered.action (غير مسجل - الافتراضي: deny)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', color: '#cbd5e1' }}>
                حمولة البيانات (Payload JSON):
              </label>
              <textarea
                rows={3}
                value={payloadText}
                onChange={(e) => setPayloadText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  background: '#1e293b',
                  color: '#fff',
                  fontFamily: 'monospace',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              onClick={handleTestGuard}
              disabled={loading}
              style={{
                backgroundColor: '#0284c7',
                color: '#fff',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
                marginTop: '8px'
              }}
            >
              {loading ? 'جاري التحقق والتنفيذ...' : '🚀 تنفيذ مع فحص الصلاحية'}
            </button>
          </div>

          {result !== null && (
            <div style={{ marginTop: '24px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#94a3b8' }}>
                نتيجة الفحص والاستجابة:
              </div>
              <pre style={{
                background: '#090d16',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #1e293b',
                color: '#38bdf8',
                overflowX: 'auto',
                fontSize: '13px'
              }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
