'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Erro Crítico</h2>
          <p className="text-gray-500 mb-8">{error.message}</p>
          <button
            onClick={() => reset()}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg"
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
