import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'

export function useGoals() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['investment_goals', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: goals, error } = await supabase
        .from('investment_goals')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error

      const { data: contributions, error: cError } = await supabase
        .from('investment_contributions')
        .select('goal_id, valor')
      if (cError) throw cError

      const totals = new Map()
      for (const c of contributions) {
        totals.set(c.goal_id, (totals.get(c.goal_id) || 0) + Number(c.valor))
      }

      return goals.map((g) => ({ ...g, valor_atual: totals.get(g.id) || 0 }))
    },
  })
}

export function useGoalMutations() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['investment_goals', user?.id] })
    qc.invalidateQueries({ queryKey: ['investment_contributions'] })
  }

  const create = useMutation({
    mutationFn: async (values) => {
      const { error } = await supabase
        .from('investment_goals')
        .insert({ ...values, user_id: user.id })
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: async ({ id, ...values }) => {
      const { error } = await supabase.from('investment_goals').update(values).eq('id', id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('investment_goals').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  return { create, update, remove }
}

export function useContributions(goalId) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['investment_contributions', goalId],
    enabled: !!user && !!goalId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investment_contributions')
        .select('*')
        .eq('goal_id', goalId)
        .order('data', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useAllContributions() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['investment_contributions', 'all', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investment_contributions')
        .select('*, investment_goals(nome)')
        .order('data', { ascending: true })
      if (error) throw error
      return data
    },
  })
}

export function useContributionMutations(goalId) {
  const { user } = useAuth()
  const qc = useQueryClient()
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['investment_contributions'] })
    qc.invalidateQueries({ queryKey: ['investment_goals', user?.id] })
  }

  const create = useMutation({
    mutationFn: async (values) => {
      const { error } = await supabase
        .from('investment_contributions')
        .insert({ ...values, goal_id: goalId, user_id: user.id })
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('investment_contributions').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  return { create, remove }
}
