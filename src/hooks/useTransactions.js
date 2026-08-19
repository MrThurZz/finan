import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { addMonthsISO } from '../lib/format'

export function useTransactions({ limit } = {}) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['transactions', user?.id, limit ?? 'all'],
    enabled: !!user,
    queryFn: async () => {
      let query = supabase
        .from('transactions')
        .select('*, categories(id, nome, cor, tipo)')
        .order('data', { ascending: false })
        .order('created_at', { ascending: false })
      if (limit) query = query.limit(limit)
      const { data, error } = await query
      if (error) throw error
      return data
    },
  })
}

export function useTransactionMutations() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['transactions', user?.id] })

  const create = useMutation({
    mutationFn: async (values) => {
      const { parcelas, ...base } = values

      if (base.forma_pagamento === 'credito' && parcelas && parcelas > 1) {
        const grupoId = crypto.randomUUID()
        const rows = Array.from({ length: parcelas }, (_, i) => ({
          ...base,
          user_id: user.id,
          data: addMonthsISO(base.data, i),
          parcela_atual: i + 1,
          parcela_total: parcelas,
          grupo_parcelamento_id: grupoId,
        }))
        const { error } = await supabase.from('transactions').insert(rows)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('transactions')
          .insert({ ...base, user_id: user.id })
        if (error) throw error
      }
    },
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: async ({ id, ...values }) => {
      const { error } = await supabase.from('transactions').update(values).eq('id', id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('transactions').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  const removeGroup = useMutation({
    mutationFn: async (grupoId) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('grupo_parcelamento_id', grupoId)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  return { create, update, remove, removeGroup }
}
