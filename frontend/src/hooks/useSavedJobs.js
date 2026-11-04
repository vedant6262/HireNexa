import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../utils/api'
import toast from 'react-hot-toast'

export function useSavedJobs(options = {}) {
  return useQuery({
    queryKey: ['savedJobs'],
    queryFn: () => api.get('/saved-jobs').then(res => res.data),
    ...options,
  })
}

export function useToggleSaveJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (jobId) => api.post('/saved-jobs', { jobId }).then(res => res.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['savedJobs'] })
      toast.success(data.saved ? 'Job saved' : 'Job unsaved')
    },
    onError: (error) => toast.error(error.message),
  })
}
