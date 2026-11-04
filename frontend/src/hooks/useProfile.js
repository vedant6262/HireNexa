import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../utils/api'
import toast from 'react-hot-toast'

export function useProfile(options = {}) {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get('/users/me').then(res => res.data),
    ...options,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.put('/users/profile', data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Profile updated')
    },
    onError: (error) => toast.error(error.message),
  })
}

export function useAddSkill() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/users/skills', data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Skill added')
    },
  })
}

export function useRemoveSkill() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/users/skills/${id}`).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Skill removed')
    },
  })
}

export function useAddEducation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/users/education', data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Education added')
    },
  })
}

export function useAddExperience() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/users/experience', data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Experience added')
    },
  })
}

export function useAddProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/users/projects', data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Project added')
    },
  })
}

export function useAddCertificate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/users/certificates', data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Certificate added')
    },
  })
}

export function useUploadResume() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/users/resume', data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Resume uploaded')
    },
  })
}

export function useUpdateAvatar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (image) => api.post('/users/avatar', { image }).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Profile photo updated')
    },
    onError: (error) => toast.error(error.message),
  })
}

export function useDeleteAvatar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.delete('/users/avatar').then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Profile photo removed')
    },
    onError: (error) => toast.error(error.message),
  })
}
