"use client";

export function ConfirmButton({
  action,
  hidden,
  message,
  className,
  children,
}: {
  action: (fd: FormData) => void | Promise<void>;
  hidden: Record<string, string>;
  message: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <form action={action} onSubmit={(e) => !confirm(message) && e.preventDefault()}>
      {Object.entries(hidden).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <button className={className}>{children}</button>
    </form>
  );
}
