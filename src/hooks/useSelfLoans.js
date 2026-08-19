import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { todayISO } from '../lib/format'

export function useSelfLoans() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['self_loans', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('self_loans')
        .select('*')
        .order('status', { ascending: true })
        .order('data', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useSelfLoanMutations() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['self_loans', user?.id] })

  const create = useMutation({
    mutationFn: async (values) => {
      const { error } = await supabase.from('self_loans').insert({ ...values, user_id: user.id })
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  const markPaid = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('self_loans')
        .update({ status: 'pago', data_pagamento: todayISO() })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('self_loans').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  return { create, markPaid, remove }
}
