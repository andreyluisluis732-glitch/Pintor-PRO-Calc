'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-xl font-bold mb-4">Algo deu errado!</h2>
      <p className="text-sm text-gray-500 mb-6">{error.message}</p>
      <button
        onClick={() => reset()}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold"
      >
        Tentar novamente
      </button>
    </div>
  );
}
