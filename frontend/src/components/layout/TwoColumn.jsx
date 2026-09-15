export function TwoColumn({ rail, children }) {
  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1">{children}</div>
      {rail && (
        <div className="hidden w-[312px] shrink-0 lg:block">
          <div className="sticky top-[4.5rem] flex flex-col gap-4">{rail}</div>
        </div>
      )}
    </div>
  );
}
