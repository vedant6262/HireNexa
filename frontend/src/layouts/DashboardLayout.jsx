import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth, useUser } from '../context/AuthProvider'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiOutlineHome, HiOutlineBriefcase, HiOutlineHeart, HiOutlineUser,
  HiOutlineCalendar, HiOutlineCpuChip, HiOutlineChartBar, HiOutlineBuildingOffice,
  HiOutlineUsers, HiOutlineDocumentText, HiOutlineShieldCheck,
  HiOutlineBell, HiOutlineMoon, HiOutlineSun, HiOutlineArrowRightOnRectangle,
  HiOutlineMagnifyingGlass, HiOutlineChevronDown, HiOutlineSparkles,
  HiOutlineChatBubbleLeftRight, HiOutlineAcademicCap,
} from 'react-icons/hi2'
import { useTheme } from '../context/ThemeContext'

export default function DashboardLayout({ role }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { user } = useUser()
  const { isDark, toggleTheme } = useTheme()

  const [aiToolsExpanded, setAiToolsExpanded] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const candidateLinks = [
    { to: '/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
    { to: '/skill-assessment', icon: HiOutlineSparkles, label: 'Skill Assessment' },
    { to: '/dashboard/live-jobs', icon: HiOutlineMagnifyingGlass, label: 'Live Jobs' },
    { to: '/dashboard/hirenexa-jobs', icon: HiOutlineBriefcase, label: 'HireNexa Jobs' },
    { to: '/dashboard/applications', icon: HiOutlineDocumentText, label: 'My Applications' },
    { to: '/dashboard/saved-jobs', icon: HiOutlineHeart, label: 'Saved Jobs' },
    { to: '/dashboard/profile', icon: HiOutlineUser, label: 'Profile' },
    { to: '/dashboard/interviews', icon: HiOutlineCalendar, label: 'Interviews' },
  ]

  const aiToolLinks = [
    { to: '/dashboard/ai-tools?tool=ats', icon: HiOutlineDocumentText, label: 'ATS Score Checker' },
    { to: '/dashboard/ai-tools?tool=recommendations', icon: HiOutlineBriefcase, label: 'Recommendations' },
    { to: '/dashboard/ai-tools?tool=career', icon: HiOutlineAcademicCap, label: 'Career Path' },
  ]

  const recruiterLinks = [
    { to: '/recruiter', icon: HiOutlineHome, label: 'Dashboard' },
    { to: '/recruiter/post-job', icon: HiOutlineBriefcase, label: 'Post Job' },
    { to: '/recruiter/manage-jobs', icon: HiOutlineDocumentText, label: 'Manage Jobs' },
    { to: '/recruiter/company', icon: HiOutlineBuildingOffice, label: 'Company Profile' },
    { to: '/recruiter/analytics', icon: HiOutlineChartBar, label: 'Analytics' },
  ]

  const adminLinks = [
    { to: '/admin', icon: HiOutlineHome, label: 'Dashboard' },
    { to: '/admin/users', icon: HiOutlineUsers, label: 'Users' },
    { to: '/admin/recruiters', icon: HiOutlineShieldCheck, label: 'Recruiters' },
    { to: '/admin/companies', icon: HiOutlineBuildingOffice, label: 'Companies' },
    { to: '/admin/reports', icon: HiOutlineChartBar, label: 'Reports' },
  ]

  const links = role === 'candidate' ? candidateLinks : role === 'recruiter' ? recruiterLinks : adminLinks

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="flex">
        <aside className="sticky top-0 z-40 hidden h-screen w-64 shrink-0 overflow-y-auto border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 lg:block">
          <div className="p-4 flex flex-col h-full">
            <Link to="/" className="flex items-center gap-2 mb-6 px-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <HiOutlineBriefcase className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg gradient-text">HireNexa Jobs</span>
            </Link>
            <nav className="space-y-1 flex-1">
              {links.map(link => {
                const Icon = link.icon
                const isActive = location.pathname === link.to
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400'
                        : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                )
              })}

              {role === 'candidate' && (
                <div>
                  <button
                    onClick={() => setAiToolsExpanded(!aiToolsExpanded)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      location.pathname === '/dashboard/ai-tools'
                        ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400'
                        : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <HiOutlineCpuChip className="w-5 h-5" />
                      AI Tools
                    </span>
                    <HiOutlineChevronDown className={`w-4 h-4 transition-transform duration-200 ${aiToolsExpanded ? 'rotate-0' : '-rotate-90'}`} />
                  </button>
                  <AnimatePresence>
                    {aiToolsExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="ml-2 mt-1 space-y-1 border-l-2 border-primary-200 dark:border-primary-800 pl-2">
                          {aiToolLinks.map(tool => {
                            const ToolIcon = tool.icon
                            const isToolActive = location.pathname + location.search === tool.to
                            return (
                              <Link
                                key={tool.to}
                                to={tool.to}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                                  isToolActive
                                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400'
                                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700/50'
                                }`}
                              >
                                <ToolIcon className="w-4 h-4" />
                                {tool.label}
                              </Link>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </nav>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 px-4 py-3 mb-2">
                <img src={user?.imageUrl} alt="" className="w-8 h-8 rounded-full" />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.fullName}</p>
                  <p className="text-xs text-slate-500 capitalize">{role}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 px-4 mb-3">
                <button onClick={toggleTheme} className="btn-ghost p-2">
                  {isDark ? <HiOutlineSun className="w-5 h-5" /> : <HiOutlineMoon className="w-5 h-5" />}
                </button>
                <button className="btn-ghost p-2 relative">
                  <HiOutlineBell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </button>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 w-full transition-all duration-200"
              >
                <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        <main className="min-h-screen min-w-0 flex-1 overflow-x-hidden p-4 md:p-6 lg:p-10">
          <div className="mb-7 flex items-center justify-between">
            <div className="flex max-w-md flex-1 items-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <HiOutlineMagnifyingGlass className="w-5 h-5 text-slate-400" />
              <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none ml-2 text-sm w-full text-slate-700 dark:text-slate-300 placeholder-slate-400" />
            </div>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
