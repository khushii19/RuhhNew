/** Re-mounts on every navigation, giving each page a short enter animation. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="m-page">{children}</div>;
}
