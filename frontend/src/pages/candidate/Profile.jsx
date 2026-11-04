import { useEffect, useRef, useState } from 'react'
import { HiOutlineCog6Tooth, HiOutlineUser, HiOutlineTrash, HiOutlineCloudArrowUp } from 'react-icons/hi2'
import {
  useAddSkill,
  useDeleteAvatar,
  useProfile,
  useRemoveSkill,
  useUpdateAvatar,
  useUpdateProfile,
} from '../../hooks/useProfile'

export default function Profile() {
  const { data: profile, isLoading, isError } = useProfile()
  const updateProfile = useUpdateProfile()
  const updateAvatar = useUpdateAvatar()
  const deleteAvatar = useDeleteAvatar()
  const addSkill = useAddSkill()
  const removeSkill = useRemoveSkill()
  const fileInputRef = useRef(null)
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', location: '', headline: '', bio: '' })
  const [skillName, setSkillName] = useState('')

  useEffect(() => {
    if (!profile) return
    setForm({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      phone: profile.phone || '',
      location: profile.location || '',
      headline: profile.headline || '',
      bio: profile.bio || '',
    })
  }, [profile])

  if (isLoading) return <p className="text-sm text-slate-500">Loading your profile...</p>
  if (isError || !profile) return <p className="text-sm text-rose-600">Unable to load your profile.</p>

  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Your name'
  const profileCompletion = Math.round(([profile.firstName, profile.lastName, profile.phone, profile.location, profile.headline, profile.bio].filter(Boolean).length / 6) * 100)

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => updateAvatar.mutate(reader.result)
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.firstName.trim()) return
    updateProfile.mutate(form)
  }

  const handleAddSkill = (event) => {
    event.preventDefault()
    const name = skillName.trim()
    if (!name) return
    addSkill.mutate({ name }, { onSuccess: () => setSkillName('') })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">My Profile</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        {profile.isOnboarded ? 'Manage your professional profile.' : 'Complete your profile before continuing.'}
      </p>

      <div className="glass-card p-6 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={fullName} className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-2xl font-bold text-white">
                {fullName.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{fullName}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{profile.headline || 'Add a professional headline'}</p>
            <p className="text-xs text-slate-400 mt-1">{profile.email}</p>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-secondary text-sm px-4 py-2" disabled={updateAvatar.isPending}>
            <HiOutlineCloudArrowUp className="w-4 h-4" /> {updateAvatar.isPending ? 'Uploading...' : 'Upload Photo'}
          </button>
          {profile.avatarUrl && (
            <button type="button" onClick={() => deleteAvatar.mutate()} className="btn-ghost text-sm px-3 py-2 text-red-500" disabled={deleteAvatar.isPending}>
              <HiOutlineTrash className="w-4 h-4" /> Remove
            </button>
          )}
        </div>
        <div className="mt-5 flex items-center gap-2 text-sm">
          <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2"><div className="h-full rounded-full bg-primary-600" style={{ width: `${profileCompletion}%` }} /></div>
          <span className="text-slate-500 dark:text-slate-400">{profileCompletion}% Complete</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <HiOutlineUser className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Basic Information</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">First name *
            <input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="input-field mt-1" />
          </label>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Last name
            <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="input-field mt-1" />
          </label>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field mt-1" />
          </label>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Location
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input-field mt-1" />
          </label>
          <label className="sm:col-span-2 text-sm font-medium text-slate-700 dark:text-slate-300">Professional headline
            <input value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} className="input-field mt-1" />
          </label>
          <label className="sm:col-span-2 text-sm font-medium text-slate-700 dark:text-slate-300">Bio
            <textarea rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="input-field mt-1 resize-none" />
          </label>
        </div>
        <button type="submit" className="btn-primary mt-6" disabled={updateProfile.isPending}>{updateProfile.isPending ? 'Saving...' : 'Save Changes'}</button>
      </form>

      <div className="glass-card p-6 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <HiOutlineCog6Tooth className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Skills</h3>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {profile.skills?.map((skill) => (
            <span key={skill.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
              {skill.name}
              <button type="button" onClick={() => removeSkill.mutate(skill.id)}><HiOutlineTrash className="w-3.5 h-3.5 hover:text-red-500" /></button>
            </span>
          ))}
        </div>
        <form onSubmit={handleAddSkill} className="flex gap-2">
          <input value={skillName} onChange={(e) => setSkillName(e.target.value)} placeholder="Add a skill..." className="input-field flex-1" />
          <button type="submit" className="btn-primary px-4">Add</button>
        </form>
      </div>
    </div>
  )
}
