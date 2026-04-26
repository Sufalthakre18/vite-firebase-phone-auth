import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import { auth } from '../firebase/config'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
    const navigate = useNavigate()
    const { user } = useAuth()

    const [phone, setPhone] = useState('')
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const [step, setStep] = useState('phone')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [confirmationResult, setConfirmationResult] = useState(null)
    const [resendTimer, setResendTimer] = useState(0)
    const otpRefs = useRef([])

    useEffect(() => {
        if (user) navigate('/dashboard', { replace: true })
    }, [user])

    useEffect(() => {
        if (resendTimer <= 0) return
        const id = setTimeout(() => setResendTimer((t) => t - 1), 1000)
        return () => clearTimeout(id)
    }, [resendTimer])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear()
                window.recaptchaVerifier = null
            }
        }
    }, [])

    async function setupRecaptcha() {
        // Always fully destroy old instance
        if (window.recaptchaVerifier) {
            try { window.recaptchaVerifier.clear() } catch (_) {}
            window.recaptchaVerifier = null
        }
        // Wipe the DOM node so reCAPTCHA gets a blank slate
        const container = document.getElementById('recaptcha-container')
        if (container) container.innerHTML = ''

        window.recaptchaVerifier = new RecaptchaVerifier(
            auth,
            'recaptcha-container',
            { size: 'invisible' }
        )
        await window.recaptchaVerifier.render()
    }

    async function sendOTP() {
        setError('')
        if (!phone || phone.length < 10) {
            setError('Enter a valid phone number.')
            return
        }
        setLoading(true)
        try {
            await setupRecaptcha()
            const fullPhone = phone.startsWith('+') ? phone : `+91${phone}`
            const result = await signInWithPhoneNumber(auth, fullPhone, window.recaptchaVerifier)
            setConfirmationResult(result)
            setStep('otp')
            setResendTimer(30)
            setTimeout(() => otpRefs.current[0]?.focus(), 100)
        } catch (err) {
            setError(err.message || 'Failed to send OTP. Try again.')
            if (window.recaptchaVerifier) {
                try { window.recaptchaVerifier.clear() } catch (_) {}
                window.recaptchaVerifier = null
            }
        } finally {
            setLoading(false)
        }
    }

    async function verifyOTP() {
        const code = otp.join('')
        if (code.length !== 6) { setError('Enter all 6 digits.'); return }
        setError('')
        setLoading(true)
        try {
            await confirmationResult.confirm(code)
            navigate('/dashboard', { replace: true })
        } catch (err) {
            setError('Invalid OTP. Please try again.')
            setOtp(['', '', '', '', '', ''])
            otpRefs.current[0]?.focus()
        } finally {
            setLoading(false)
        }
    }

    function handleOtpChange(val, idx) {
        if (!/^\d?$/.test(val)) return
        const next = [...otp]
        next[idx] = val
        setOtp(next)
        if (val && idx < 5) otpRefs.current[idx + 1]?.focus()
    }

    function handleOtpKeyDown(e, idx) {
        if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus()
    }

    async function resendOTP() {
        setOtp(['', '', '', '', '', ''])
        setError('')
        if (window.recaptchaVerifier) {
            try { window.recaptchaVerifier.clear() } catch (_) {}
            window.recaptchaVerifier = null
        }
        const container = document.getElementById('recaptcha-container')
        if (container) container.innerHTML = ''
        setStep('phone')
    }

    function fillDemoPhone() { setPhone('9999999999') }
    function fillDemoOtp() { setOtp(['1', '2', '3', '4', '5', '6']) }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1b3e 50%, #0a1628 100%)' }}>

            {/* Background blobs */}
            <div className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl"
                style={{ background: 'radial-gradient(circle, #3b82f6, transparent)', top: '-5rem', left: '-5rem' }} />
            <div className="absolute w-80 h-80 rounded-full opacity-15 blur-3xl"
                style={{ background: 'radial-gradient(circle, #06b6d4, transparent)', bottom: '-3rem', right: '-3rem' }} />

            {/* reCAPTCHA mount point — never conditionally rendered */}
            <div id="recaptcha-container" />

            {/* ── DEMO CREDENTIALS BANNER ── */}
            <div className="w-full max-w-md mb-4 relative z-10">
                <div className="rounded-2xl px-5 py-4"
                    style={{
                        background: 'rgba(16,185,129,0.08)',
                        border: '1px solid rgba(16,185,129,0.25)',
                        backdropFilter: 'blur(12px)',
                    }}>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#34d399' }}>
                            Demo Credentials
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl p-3"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <p className="text-xs mb-1" style={{ color: '#64748b' }}>Phone Number</p>
                            <p className="font-bold text-sm mb-2" style={{ color: '#f1f5f9', fontFamily: "'Space Mono', monospace" }}>
                                9999999999
                            </p>
                            <button onClick={fillDemoPhone}
                                className="text-xs px-2 py-1 rounded-lg font-medium transition-all"
                                style={{ background: 'rgba(59,130,246,0.2)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.3)' }}>
                                Auto-fill →
                            </button>
                        </div>
                        <div className="rounded-xl p-3"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <p className="text-xs mb-1" style={{ color: '#64748b' }}>OTP Code</p>
                            <p className="font-bold text-sm mb-2" style={{ color: '#f1f5f9', fontFamily: "'Space Mono', monospace" }}>
                                1 2 3 4 5 6
                            </p>
                            <button onClick={fillDemoOtp}
                                className="text-xs px-2 py-1 rounded-lg font-medium transition-all"
                                style={{ background: 'rgba(6,182,212,0.2)', color: '#67e8f9', border: '1px solid rgba(6,182,212,0.3)' }}>
                                Auto-fill →
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Glass card */}
            <div className="w-full max-w-md relative z-10"
                style={{
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '24px',
                    padding: '2.5rem',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
                }}>

                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                        style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                            <path d="M18.5 3H6C4.9 3 4 3.9 4 5v2c0 .55.22 1.05.59 1.41L10 14v5h4v-5l5.41-5.59C19.78 8.05 20 7.55 20 7V5c0-1.1-.9-2-1.5-2zM18 7H6V5h12v2z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight"
                        style={{ fontFamily: "'DM Sans', sans-serif", color: '#f1f5f9' }}>
                        Laundry Buddy
                    </h1>
                    <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>
                        {step === 'phone' ? 'Sign in with your phone number' : 'Enter the OTP sent to your phone'}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 px-4 py-3 rounded-xl text-sm"
                        style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                        {error}
                    </div>
                )}

                {step === 'phone' ? (
                    <>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>
                            Phone Number
                        </label>
                        <div className="flex gap-2 mb-6">
                            <div className="flex items-center px-3 rounded-xl text-sm font-mono"
                                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#94a3b8' }}>
                                +91
                            </div>
                            <input
                                type="tel"
                                placeholder="9999999999"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                onKeyDown={(e) => e.key === 'Enter' && sendOTP()}
                                className="flex-1 px-4 py-3 rounded-xl text-sm outline-none transition-all"
                                style={{
                                    background: 'rgba(255,255,255,0.08)',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    color: '#f1f5f9',
                                    fontFamily: "'Space Mono', monospace",
                                }}
                            />
                        </div>
                        <button onClick={sendOTP} disabled={loading}
                            className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Sending OTP...
                                </span>
                            ) : 'Send OTP'}
                        </button>
                    </>
                ) : (
                    <>
                        <label className="block text-sm font-medium mb-3" style={{ color: '#94a3b8' }}>
                            Enter 6-digit OTP
                        </label>
                        <div className="flex gap-2 justify-between mb-6">
                            {otp.map((digit, i) => (
                                <input key={i} ref={(el) => (otpRefs.current[i] = el)}
                                    type="text" inputMode="numeric" maxLength={1} value={digit}
                                    onChange={(e) => handleOtpChange(e.target.value, i)}
                                    onKeyDown={(e) => handleOtpKeyDown(e, i)}
                                    className="w-12 h-14 text-center rounded-xl text-lg font-bold outline-none transition-all"
                                    style={{
                                        background: digit ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.08)',
                                        border: digit ? '1px solid rgba(59,130,246,0.6)' : '1px solid rgba(255,255,255,0.12)',
                                        color: '#f1f5f9',
                                        fontFamily: "'Space Mono', monospace",
                                    }}
                                />
                            ))}
                        </div>
                        <button onClick={verifyOTP} disabled={loading}
                            className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-3"
                            style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Verifying...
                                </span>
                            ) : 'Verify & Login'}
                        </button>
                        <div className="text-center text-sm" style={{ color: '#64748b' }}>
                            {resendTimer > 0 ? (
                                <span>Resend OTP in <span style={{ color: '#3b82f6' }}>{resendTimer}s</span></span>
                            ) : (
                                <button onClick={resendOTP} style={{ color: '#3b82f6' }}>
                                    Resend OTP
                                </button>
                            )}
                        </div>
                        <button onClick={() => { setStep('phone'); setError('') }}
                            className="w-full mt-3 text-sm" style={{ color: '#64748b' }}>
                            ← Change number
                        </button>
                    </>
                )}
            </div>

            {/* ── FOOTER NOTE ── */}
            <div className="w-full max-w-md mt-4 relative z-10">
                <div className="rounded-2xl px-5 py-4"
                    style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        backdropFilter: 'blur(8px)',
                    }}>
                    <div className="flex gap-3">
                        <div className="mt-0.5 shrink-0">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs font-semibold mb-1" style={{ color: '#475569' }}>
                                Why test credentials?
                            </p>
                            <p className="text-xs leading-relaxed text-slate-500" >
                                This app uses <span className='text-slate-400'>Firebase Phone Authentication</span>.
                                Real SMS delivery requires a paid billing plan. For this demo, Firebase test numbers
                                are used — an industry-standard practice that bypasses SMS while keeping the full
                                auth flow intact. In production, simply upgrade to Blaze plan to enable live OTPs.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}