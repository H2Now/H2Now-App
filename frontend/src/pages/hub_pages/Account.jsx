import { useState, useEffect } from "react"

import Camera from "../../assets/icons/camera.png"
import Logout from "../../assets/icons/logout.png"

export default function Account() {
    // allow overriding backend URL via Vite env (VITE_API_URL). Falls back to localhost:5000.
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    const [modal, setModal] = useState(false)
    const [user, setUser] = useState({ name: "", email: "", profilePic: "" })
    const [loading, setLoading] = useState(true)
    // which field is being edited: null | 'name' | 'password'
    const [editingField, setEditingField] = useState(null)
    const [form, setForm] = useState({ name: "", password: "", confirmPassword: "" })
    // message: { type: 'error'|'warning'|'success', text: string } or null
    const [message, setMessage] = useState(null)

    useEffect(() => {
        // fetch current user profile
        const fetchUser = async () => {
            try {
                const res = await fetch(`${API_URL}/user`, {
                    credentials: "include",
                })
                const data = await res.json()
                if (res.ok && data.success) {
                    setUser({ name: data.user.name, email: data.user.email, profilePic: data.user.profilePic })
                    setForm((f) => ({ ...f, name: data.user.name }))
                } else if (res.status === 401) {
                    setMessage({ type: 'warning', text: "Not authenticated" })
                } else {
                    setMessage({ type: 'error', text: data?.message || "Failed to load profile" })
                }
            } catch (err) {
                setMessage({ type: 'error', text: "Network error" })
            } finally {
                setLoading(false)
            }
        }
        fetchUser()
    }, [])

    return (
        <div className="w-full flex flex-col items-center max-w-[600px] mx-auto px-4">
            {/* Logout modal overlay */}
            <div className={`
                fixed inset-0 bg-black/60 flex items-center justify-center z-40 transition-opacity duration-250
                ${modal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
            `}>
                <div className="w-[325px] h-[325px] p-[15px] bg-white/90 dark:bg-slate-800/90 rounded-2xl flex flex-col items-center justify-evenly shadow-lg border border-gray-200/40 dark:border-slate-700/40">
                    <p className="text-gray-900 dark:text-gray-100 text-[28px]">Log Out</p>
                    <p className="text-gray-700 dark:text-gray-200 text-[16px] text-center">Are you sure you want to log out?</p>
                    <div className="w-full pt-[15px] flex justify-center gap-4">
                        <button
                            className="w-[125px] h-[44px] bg-gray-300 hover:bg-gray-400 dark:bg-slate-600 dark:hover:bg-slate-500 transition-colors duration-200 rounded-lg flex items-center justify-center"
                            onClick={() => setModal(false)}
                        >
                            <span className="text-gray-800 dark:text-gray-100">Cancel</span>
                        </button>
                        <button
                            className="w-[125px] h-[44px] bg-red-500 hover:bg-red-600 transition-colors duration-200 rounded-lg flex items-center justify-center"
                            onClick={async () => {
                                try {
                                    const res = await fetch(`${API_URL}/auth/logout`, {
                                        credentials: "include",
                                    })
                                    if (res.ok) {
                                        // Redirect to login page after successful logout
                                        window.location.href = "/"
                                    }
                                } catch (err) {
                                    console.error("Logout failed:", err)
                                }
                            }}
                        >
                            <img src={Logout} className="w-6 h-6 mr-2" />
                            <span className="text-white">Log Out</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Profile card */}
            <div className="w-full max-w-[500px] bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/40 dark:border-slate-700/40 flex flex-col items-center py-8 lg:py-10">
                <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden flex items-center justify-center">
                    {user.profilePic ? (
                        <img
                            src={user.profilePic}
                            alt="Profile"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        <img
                            src={Camera}
                            alt="Upload profile"
                            className="w-12 h-12 lg:w-16 lg:h-16"
                        />
                    )}
                </div>
                <p className="mt-4 text-gray-900 dark:text-gray-100 text-[20px] lg:text-[24px] font-semibold">{loading ? 'Loading...' : `Welcome, ${user.name || 'User'}`}</p>
            </div>

            {message && (
                <div className={`w-full max-w-[500px] mt-4 ${message.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300' : message.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300' : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'} px-4 py-3 rounded-lg`}>
                    <div className="flex items-start">
                        <div className="mr-2 mt-0.5">
                            {message.type === 'error' && (
                                <svg className="h-5 w-5 text-red-400 dark:text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            )}
                            {message.type === 'warning' && (
                                <svg className="h-5 w-5 text-amber-500 dark:text-amber-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            )}
                            {message.type === 'success' && (
                                <svg className="h-5 w-5 text-green-400 dark:text-green-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 11.586 7.707 10.293a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l5-5z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>
                        <div className="text-sm">
                            <span>{message.text}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Info + Actions column */}
            <div className="mt-6 w-full flex flex-col items-center gap-4">
                <div className="w-full max-w-[500px] h-auto bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/40 dark:border-slate-700/40 flex items-center px-4 lg:px-6 py-4 lg:py-5">
                    <div className="flex-1">
                        <p className="text-[16px] lg:text-[18px] text-gray-700 dark:text-gray-200">Name</p>
                        {editingField === 'name' ? (
                            <>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="mt-3 w-full h-10 lg:h-12 px-3 lg:px-4 rounded-md border border-gray-200/40 dark:border-slate-700/40 bg-white/90 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
                                />
                                <div className="w-full mt-4 flex justify-end gap-3">
                                    <button
                                        className="text-sm px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors duration-200"
                                        onClick={async () => {
                                            setMessage(null)
                                            try {
                                                const payload = { name: form.name }
                                                const res = await fetch(`${API_URL}/user`, {
                                                    method: 'PUT',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    credentials: 'include',
                                                    body: JSON.stringify(payload)
                                                })
                                                const data = await res.json()
                                                if (res.ok && data.success) {
                                                    setUser((u) => ({ ...u, name: form.name }))
                                                    setEditingField(null)
                                                    setMessage({ type: 'success', text: 'Name updated' })
                                                } else {
                                                    setMessage({ type: 'error', text: data?.message || 'Update failed' })
                                                }
                                            } catch (err) {
                                                setMessage({ type: 'error', text: 'Network error' })
                                            }
                                        }}
                                    >
                                        Save
                                    </button>
                                    <button
                                        className="text-sm px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-md transition-colors duration-200"
                                        onClick={() => { setEditingField(null); setForm({ ...form, name: user.name }); setMessage(null) }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </>
                        ) : (
                            <p className="text-[14px] text-gray-900 dark:text-gray-100">{loading ? '...' : user.name}</p>
                        )}
                    </div>

                    <div className="ml-3">
                        {editingField !== 'name' && (
                            <button
                                onClick={() => { setEditingField('name'); setForm((f) => ({ ...f, name: user.name })); setMessage(null) }}
                                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700"
                                aria-label="Edit name"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="h-5 w-5 text-gray-600 dark:text-gray-300" viewBox="0 0 16 16">
                                    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>


                <div className="w-full max-w-[500px] h-auto bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/40 dark:border-slate-700/40 flex items-center px-4 lg:px-6 py-4 lg:py-5">
                    <div className="flex-1">
                        <p className="text-[16px] lg:text-[18px] text-gray-700 dark:text-gray-200">Email</p>
                        <p className="text-[14px] lg:text-[16px] text-gray-900 dark:text-gray-100">{loading ? '...' : user.email}</p>
                    </div>
                </div>

                <div className="w-full max-w-[500px] h-auto bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/40 dark:border-slate-700/40 flex items-center px-4 lg:px-6 py-4 lg:py-5">
                    <div className="flex-1">
                        <p className="text-[16px] lg:text-[18px] text-gray-700 dark:text-gray-200">Password</p>
                        {editingField === 'password' ? (
                            <>
                                <div className="flex flex-col gap-2">
                                    <input
                                        type="password"
                                        placeholder="New password"
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        className="mt-3 w-full h-10 lg:h-12 px-3 lg:px-4 rounded-md border border-gray-200/40 dark:border-slate-700/40 bg-white/90 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
                                    />
                                    <input
                                        type="password"
                                        placeholder="Confirm new password"
                                        value={form.confirmPassword}
                                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                        className="w-full h-10 lg:h-12 px-3 lg:px-4 rounded-md border border-gray-200/40 dark:border-slate-700/40 bg-white/90 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div className="w-full mt-4 flex justify-end gap-3">
                                    <button
                                        className="text-sm px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors duration-200"
                                        onClick={async () => {
                                            setMessage(null)
                                            if (form.password && form.password !== form.confirmPassword) {
                                                setMessage({ type: 'error', text: 'Passwords do not match' })
                                                return
                                            }
                                            try {
                                                const payload = {}
                                                if (form.password) payload.password = form.password
                                                const res = await fetch(`${API_URL}/user`, {
                                                    method: 'PUT',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    credentials: 'include',
                                                    body: JSON.stringify(payload)
                                                })
                                                const data = await res.json()
                                                if (res.ok && data.success) {
                                                    setEditingField(null)
                                                    setForm((f) => ({ ...f, password: '', confirmPassword: '' }))
                                                    setMessage({ type: 'success', text: 'Password updated' })
                                                } else {
                                                    setMessage({ type: 'error', text: data?.message || 'Update failed' })
                                                }
                                            } catch {
                                                setMessage({ type: 'error', text: 'Network error' })
                                            }
                                        }}
                                    >
                                        Save
                                    </button>
                                    <button
                                        className="text-sm px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-md transition-colors duration-200"
                                        onClick={() => {
                                            setEditingField(null)
                                            setForm({ ...form, password: '', confirmPassword: '' })
                                            setMessage(null)
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </>
                        ) : (
                            <p className="text-[14px] text-gray-900 dark:text-gray-100">********</p>
                        )}
                    </div>

                    <div className="ml-3">
                        {editingField !== 'password' && (
                            <button
                                onClick={() => { setEditingField('password'); setForm((f) => ({ ...f, password: '', confirmPassword: '' })); setMessage(null) }}
                                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700"
                                aria-label="Edit password"
                            >
                                {/* Same SVG as Name field */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="h-5 w-5 text-gray-600 dark:text-gray-300" viewBox="0 0 16 16">
                                    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>


                <div className="mt-5 w-full max-w-[500px] flex items-center justify-center gap-4">
                    <button
                        className="w-[150px] lg:w-[200px] h-[44px] lg:h-[50px] bg-red-500 hover:bg-red-600 transition-colors duration-200 rounded-lg flex items-center justify-center"
                        onClick={() => setModal(true)}
                    >
                        <img src={Logout} className="w-5 h-5 lg:w-6 lg:h-6 mr-3" />
                        <span className="text-white text-[14px] lg:text-[16px]">Log Out</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
