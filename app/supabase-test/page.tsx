import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Note: This assumes a 'todos' table exists. 
  // If it doesn't, this will just return an empty array or error.
  const { data: todos, error } = await supabase.from('todos').select()

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Erro ao carregar dados</h1>
        <p className="text-gray-600">{error.message}</p>
        <p className="mt-4 text-sm text-gray-400">Certifique-se de que a tabela &apos;todos&apos; existe no seu Supabase.</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Teste Supabase SSR</h1>
      <ul className="space-y-2">
        {todos?.length === 0 && <p className="text-gray-500">Nenhum item encontrado na tabela &apos;todos&apos;.</p>}
        {todos?.map((todo: any) => (
          <li key={todo.id} className="p-3 bg-white rounded shadow-sm border border-gray-100">
            {todo.name}
          </li>
        ))}
      </ul>
    </div>
  )
}
