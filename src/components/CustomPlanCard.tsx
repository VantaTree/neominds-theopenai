import { Plan } from "@/data/plans";

type Props = {
  plan: Plan;
  buttonRef: React.RefObject<HTMLAnchorElement | null>;
  buttonCanvasRef: React.RefObject<HTMLCanvasElement | null>;
}

const CustomPlanCard = ({ plan, buttonRef, buttonCanvasRef }: Props) => {
  return (
    <div className="p-6 sm:p-7 flex flex-col flex-1 relative z-10">
        <p
          className="mb-1 text-xs font-bold uppercase tracking-widest"
          style={{
            color: plan.highlight ? "rgba(255,255,255,0.7)" : "#748297",
          }}
        >
          {plan.name}
        </p>
        <div className="mb-6 flex items-end gap-1">
          <span
            style={{
              fontFamily: "'Louize', Georgia, serif",
              fontSize: "clamp(2rem, 5vw, 2.8rem)",
              fontWeight: 400,
              letterSpacing: "-0.04em",
              color: plan.highlight ? "#fff" : "#111418",
            }}
          >
            {plan.price}
          </span>
          {plan.period && (
            <span
              className="mb-1 text-sm"
              style={{
                color: plan.highlight ? "rgba(255,255,255,0.7)" : "#748297",
              }}
            >
              {plan.period}
            </span>
          )}
        </div>
        <ul className="flex flex-col gap-2.5 mb-8 flex-1">
          {plan.features.map((f) => (
            <li
              key={f}
              className="flex items-center gap-2 text-sm"
              style={{
                color: plan.highlight ? "rgba(255,255,255,0.9)" : "#748297",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <span
                style={{
                  color: plan.highlight ? "#fff" : "#FF5924",
                  fontWeight: 700,
                }}
              >
                ✓
              </span>
              {f}
            </li>
          ))}
        </ul>
        <a
          ref={buttonRef}
          href="#"
          className="flex items-center justify-center rounded-full py-3 text-xs font-bold uppercase tracking-widest transition-all duration-200 hover:opacity-90 relative overflow-hidden"
          style={{
            background: plan.highlight ? "#fff" : "#FF5924",
            color: plan.highlight ? "#FF5924" : "#fff",
            minHeight: 44,
          }}
        >
          {/* Internal canvas for dynamic, local ripple overlays */}
          <canvas
            ref={buttonCanvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none rounded-[inherit]"
          />
          <span className="relative z-10">{plan.action}</span>
        </a>
      </div>
  )
}

export default CustomPlanCard