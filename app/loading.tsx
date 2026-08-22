export default function Loading() {
  return (
    <main className="eclipse-system-screen eclipse-route-loading" aria-live="polite">
      <section className="eclipse-system-card">
        <div className="eclipse-system-emblem is-loading">E</div>
        <span className="eclipse-system-kicker">ECLIPSE NETWORK</span>
        <h1>결투장을 준비하고 있습니다.</h1>
        <p>카드 데이터와 플레이어 상태를 동기화하는 중입니다.</p>
        <div className="eclipse-system-progress"><i /></div>
      </section>
    </main>
  );
}
