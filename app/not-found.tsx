import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-3xl font-bold mb-4">Página não encontrada</h2>
      <p className="text-gray-500 mb-8">Desculpe, não conseguimos encontrar a página que você está procurando.</p>
      <Link
        href="/"
        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg"
      >
        Voltar para o Início
      </Link>
    </div>
  );
}
