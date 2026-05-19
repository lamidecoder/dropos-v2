// Standalone layout for KIRO — completely isolated from dashboard nav
// Auth check happens inside the KIRO page itself
export default function KIROAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ height:"100dvh", overflow:"hidden" }}>
      {children}
    </div>
  );
}
