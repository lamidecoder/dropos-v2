// KIRO standalone layout — no dashboard nav, full screen
// The KIRO experience should be immersive, not jammed inside a sidebar-heavy dashboard
export default function KIROLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ height:"100dvh", overflow:"hidden", background:"#07050F" }}>
      {children}
    </div>
  );
}
