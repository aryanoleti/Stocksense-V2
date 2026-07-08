const REVIEWS = [
  {
    quote:
      "I always felt the market was for people who already knew the market. StockSense is the first product that made me feel like a beginner is welcome.",
    name: "Aanya Mehra",
    role: "Software engineer, Bengaluru",
  },
  {
    quote:
      "The AI doesn't tell me what to buy. It helps me understand what I'm looking at — earnings, valuation, risks. That's what I actually needed.",
    name: "Rohan Iyer",
    role: "Architect, Mumbai",
  },
  {
    quote:
      "I ran a virtual portfolio for two months before putting in real money. By then I had stopped chasing tips. Worth every minute.",
    name: "Sneha Kapoor",
    role: "Designer, Delhi",
  },
  {
    quote:
      "Clean, calm, fast. It feels like Apple decided to make a markets app for India. I open it more than my broker.",
    name: "Vivek Rao",
    role: "Founder, Hyderabad",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="mx-auto max-w-7xl px-5 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-[var(--color-brand-700)]">
          Loved by curious investors
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-[42px] sm:leading-[1.08]">
          Built for understanding, not noise.
        </h2>
      </div>
      <ul className="mt-14 grid gap-5 sm:grid-cols-2">
        {REVIEWS.map((r) => (
          <li
            key={r.name}
            className="flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-7 transition-all hover:border-[var(--color-brand-300)] hover:shadow-[0_18px_40px_-22px_rgba(13,31,23,0.14)]"
          >
            <Stars />
            <p className="mt-5 text-pretty text-[16px] leading-relaxed text-[var(--color-fg)]">
              &ldquo;{r.quote}&rdquo;
            </p>
            <div className="mt-6 flex items-center gap-3 border-t border-[var(--color-border)] pt-5">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--color-brand-50)] text-[13px] font-semibold text-[var(--color-brand-700)]">
                {r.name
                  .split(" ")
                  .map((p) => p[0])
                  .join("")}
              </span>
              <div>
                <p className="text-[13.5px] font-semibold tracking-tight text-[var(--color-fg)]">{r.name}</p>
                <p className="text-[12.5px] text-[var(--color-fg-subtle)]">{r.role}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Stars() {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className="h-4 w-4 fill-[var(--color-brand-500)]" viewBox="0 0 24 24">
          <path d="M12 17.3l-6.18 3.7 1.64-7.03L2 9.24l7.19-.61L12 2l2.81 6.63L22 9.24l-5.46 4.73L18.18 21z" />
        </svg>
      ))}
    </div>
  );
}
