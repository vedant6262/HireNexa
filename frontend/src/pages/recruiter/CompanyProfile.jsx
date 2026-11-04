import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const emptyForm = { name: '', industry: 'Technology', size: '1-10', website: '', headquarters: '', founded: '', description: '' }

export default function CompanyProfile() {
  const queryClient = useQueryClient()
  const { data: company, isLoading, isError, error } = useQuery({ queryKey: ['companyProfile'], queryFn: () => api.get('/companies/me').then(response => response.data) })
  const [form, setForm] = useState(emptyForm)
  const activateRecruiter = useMutation({
    mutationFn: () => api.post('/users/activate-recruiter').then(response => response.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companyProfile'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Recruiter access enabled')
    },
    onError: activationError => toast.error(activationError.message),
  })
  useEffect(() => {
    if (company) setForm({ ...emptyForm, ...company })
  }, [company])
  const saveCompany = useMutation({
    mutationFn: data => company ? api.put(`/companies/${company.id}`, data).then(response => response.data) : api.post('/companies', data).then(response => response.data),
    onSuccess: saved => {
      queryClient.setQueryData(['companyProfile'], saved)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['myJobs'] })
      toast.success('Company profile saved')
    },
    onError: saveError => toast.error(saveError.message),
  })

  const handleSubmit = event => {
    event.preventDefault()
    saveCompany.mutate(form)
  }

  if (isLoading) return <p className="text-sm text-slate-500">Loading company profile…</p>
  if (isError) return (
    <div className="glass-card p-6 max-w-xl">
      <h1 className="text-xl font-bold text-slate-900 dark:text-white">Recruiter access needed</h1>
      <p className="text-sm text-slate-500 mt-2">Enable recruiter access for this account to manage your company and job listings.</p>
      <button type="button" onClick={() => activateRecruiter.mutate()} disabled={activateRecruiter.isPending} className="btn-primary mt-5">{activateRecruiter.isPending ? 'Enabling…' : 'Enable recruiter access'}</button>
      {error.message !== 'Insufficient permissions' && <p className="text-xs text-slate-400 mt-3">{error.message}</p>}
    </div>
  )

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Company Profile</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Set up your company profile before posting jobs.</p>
      <div className="glass-card p-6 mb-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center"><HiOutlineBuildingOffice2 className="w-8 h-8 text-primary-600" /></div>
        <div><h2 className="text-xl font-bold text-slate-900 dark:text-white">{form.name || 'Your company'}</h2><p className="text-sm text-slate-500">{form.industry}{form.headquarters ? ` · ${form.headquarters}` : ''}</p></div>
      </div>
      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Company Name *<input required value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} className="input-field mt-1" /></label>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Industry<select value={form.industry} onChange={event => setForm({ ...form, industry: event.target.value })} className="input-field mt-1">{['Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce', 'Manufacturing', 'Consulting', 'Other'].map(item => <option key={item}>{item}</option>)}</select></label>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Company Size<select value={form.size} onChange={event => setForm({ ...form, size: event.target.value })} className="input-field mt-1">{['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+'].map(item => <option key={item}>{item}</option>)}</select></label>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Website<input type="url" value={form.website || ''} onChange={event => setForm({ ...form, website: event.target.value })} className="input-field mt-1" /></label>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Headquarters<input value={form.headquarters || ''} onChange={event => setForm({ ...form, headquarters: event.target.value })} className="input-field mt-1" /></label>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Founded Year<input value={form.founded || ''} onChange={event => setForm({ ...form, founded: event.target.value })} className="input-field mt-1" /></label>
          <label className="sm:col-span-2 text-sm font-medium text-slate-700 dark:text-slate-300">Company Description<textarea rows={5} value={form.description || ''} onChange={event => setForm({ ...form, description: event.target.value })} className="input-field mt-1 resize-y" /></label>
        </div>
        <button type="submit" className="btn-primary" disabled={saveCompany.isPending}>{saveCompany.isPending ? 'Saving…' : company ? 'Save Changes' : 'Create Company Profile'}</button>
      </form>
    </div>
  )
}
