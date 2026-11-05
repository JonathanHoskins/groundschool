export function Privacy() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 text-sm text-slate-700 dark:text-slate-300">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        Privacy
      </h1>

      <section className="mb-6">
        <h2 className="mb-2 font-semibold text-slate-900 dark:text-slate-100">
          What data we collect
        </h2>
        <p>
          We collect only anonymous aggregate data: page views, lesson starts and completions, and
          where people drop off. No personal data is collected or stored on our servers.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 font-semibold text-slate-900 dark:text-slate-100">Your progress</h2>
        <p>
          Your lesson progress is stored only in your browser&rsquo;s localStorage. It never leaves
          your device. You can export it to a file at any time and import it on another device. You
          can also clear it from your browser settings.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 font-semibold text-slate-900 dark:text-slate-100">
          Cookies and tracking
        </h2>
        <p>
          We use no advertising cookies and no cross-site trackers. Analytics (if enabled) is
          privacy-respecting and cookieless.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 font-semibold text-slate-900 dark:text-slate-100">
          Educational disclaimer
        </h2>
        <p>
          This site is for educational purposes only. It is not an FAA-approved ground school
          course and does not provide the endorsement required to take the FAA Private Pilot
          Airmen Knowledge Test. Always supplement this site with an FAA-approved course and
          instruction from a certificated flight instructor.
        </p>
      </section>
    </div>
  )
}
