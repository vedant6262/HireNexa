import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../utils/api'
import toast from 'react-hot-toast'

export function useApplications() {
  return useQuery({
    queryKey: ['applications'],
    queryFn: () => api.get('/applications').then(res => res.data),
  })
}

export function useJobApplications(jobId) {
  return useQuery({
    queryKey: ['applications', jobId],
    queryFn: () => api.get(`/applications/job/${jobId}`).then(res => res.data),
    enabled: !!jobId,
  })
}

export function useApplyJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/applications', data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Application submitted successfully')
    },
    onError: (error) => toast.error(error.message),
  })
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }) => api.patch(`/applications/${id}/status`, { status }).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      toast.success('Application status updated')
    },
    onError: (error) => toast.error(error.message),
  })
}
