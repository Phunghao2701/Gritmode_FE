export default function AuthLayout({ children }) {
  return (
    <main className="min-h-dvh w-full bg-neutral-100 px-4 py-8 text-neutral-900 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-md items-center justify-center">
        {children}
      </div>
    </main>
  );
}
