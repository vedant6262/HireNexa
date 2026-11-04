import { useState } from 'react'
import { motion } from 'framer-motion'
import { HiOutlinePaperAirplane, HiOutlineEye } from 'react-icons/hi2'
import { JOB_TYPES, EXPERIENCE_LEVELS, WORK_MODES } from '../../utils/constants'
import { useCreateJob } from '../../hooks/useJobs'
import { useNavigate } from 'react-router-dom'
import { useProfile } from '../../hooks/useProfile'

export default function PostJob() {
  const createJob = useCreateJob()
  const navigate = useNavigate()
  const { data: profile } = useProfile()
  const [preview, setPreview] = useState(false)
  const [form, setForm] = useState({
    title: '',
    location: '',
    employmentType: '',
    experience: '',
    workMode: '',
    salaryMin: '',
    salaryMax: '',
    description: '',
    requirements: '',
    responsibilities: '',
    benefits: '',
    skills: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    createJob.mutate({ title: form.title, location: form.location, employmentType: form.employmentType, experienceLevel: form.experience, workMode: form.workMode, salaryMin: form.salaryMin || undefined, salaryMax: form.salaryMax || undefined, description: form.description, requirements: form.requirements, responsibilities: form.responsibilities, benefits: form.benefits, skills: form.skills.split(',').map(skill => skill.trim()).filter(Boolean) }, { onSuccess: () => navigate('/recruiter/manage-jobs') })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{preview ? 'Preview Job' : 'Post a New Job'}</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{preview ? 'Review your job listing before publishing.' : 'Create a new job listing to attract top talent.'}</p>

      {!preview ? (
        <form onSubmit={handleSubmit}>
          <div className="glass-card p-6 space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Job Title *</label>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Senior React Developer" className="input-field" required />
              </div>
              <div>
                <p className="sm:col-span-2 text-sm text-slate-600 dark:text-slate-300">Posting as <strong>{profile?.company?.name || 'your company'}</strong>. <a className="text-primary-600" href="/recruiter/company">Edit company profile</a></p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Location *</label>
                <input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. San Francisco, CA (Remote)" className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Employment Type *</label>
                <select value={form.employmentType} onChange={e => setForm({ ...form, employmentType: e.target.value })} className="input-field" required>
                  <option value="">Select type</option>
                  {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Experience Level *</label>
                <select value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} className="input-field" required>
                  <option value="">Select level</option>
                  {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Work Mode *</label>
                <select value={form.workMode} onChange={e => setForm({ ...form, workMode: e.target.value })} className="input-field" required>
                  <option value="">Select mode</option>
                  {WORK_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Min Salary</label>
                  <input type="number" value={form.salaryMin} onChange={e => setForm({ ...form, salaryMin: e.target.value })} placeholder="e.g. 80000" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Max Salary</label>
                  <input type="number" value={form.salaryMax} onChange={e => setForm({ ...form, salaryMax: e.target.value })} placeholder="e.g. 150000" className="input-field" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Skills Required *</label>
                <input type="text" value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} placeholder="e.g. React, TypeScript, Node.js (comma separated)" className="input-field" required />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Job Description *</label>
                <textarea rows={6} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the role, responsibilities, and ideal candidate..." className="input-field resize-none" required />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Requirements</label>
                <textarea rows={4} value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })} placeholder="List key requirements (one per line)" className="input-field resize-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Responsibilities</label>
                <textarea rows={4} value={form.responsibilities} onChange={e => setForm({ ...form, responsibilities: e.target.value })} placeholder="What will the new hire do?" className="input-field resize-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Benefits</label>
                <textarea rows={3} value={form.benefits} onChange={e => setForm({ ...form, benefits: e.target.value })} placeholder="List benefits and perks" className="input-field resize-none" />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button type="submit" className="btn-primary" disabled={createJob.isPending}><HiOutlinePaperAirplane className="w-5 h-5" /> {createJob.isPending ? 'Publishing…' : 'Publish Job'}</button>
              <button type="button" onClick={() => setPreview(true)} className="btn-secondary"><HiOutlineEye className="w-5 h-5" /> Preview</button>
            </div>
          </div>
        </form>
      ) : (
        <div>
          <div className="glass-card p-6 mb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{form.title || 'Senior React Developer'}</h2>
            <p className="text-sm text-slate-500">{profile?.company?.name || 'Your company'} · {form.location || 'Location'}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {form.employmentType && <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-primary-50 text-primary-600">{form.employmentType}</span>}
              {form.experience && <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600">{form.experience}</span>}
              {form.workMode && <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-secondary-50 text-secondary-600">{form.workMode}</span>}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-4 whitespace-pre-line">{form.description || 'Job description...'}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSubmit} className="btn-primary" disabled={createJob.isPending}><HiOutlinePaperAirplane className="w-5 h-5" /> {createJob.isPending ? 'Publishing…' : 'Publish Job'}</button>
            <button onClick={() => setPreview(false)} className="btn-secondary">Edit</button>
          </div>
        </div>
      )}
    </div>
  )
}
