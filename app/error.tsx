'use client';

import { useEffect } from 'react';

export default function ErrorScreen({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[ECLIPSE UI ERROR]', error);
  }, [error]);

  return (
    <main className="eclipse-system-screen">
      <section className="eclipse-system-card">
        <div className="eclipse-system-emblem">E</div>
        <span className="eclipse-system-kicker">CLIENT RECOVERY</span>
        <h1>화면을 복구할 수 있습니다.</h1>
        <p>일시적인 표시 오류가 감지되었습니다. 현재 계정과 카드 데이터는 서버에 그대로 유지됩니다.</p>
        <div className="eclipse-system-actions">
          <button type="button" onClick={reset}>화면 다시 불러오기</button>
          <button type="button" className="secondary" onClick={() => window.location.assign('/')}>홈으로 이동</button>
        </div>
        {error.digest && <small>오류 코드 {error.digest}</small>}
      </section>
    </main>
  );
}
