import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './AuthModal.css'

export default function AuthModal() {
  const { authModal, closeAuthModal, login, register, openLogin, openRegister } =
    useAuth()

  const [loginPhone, setLoginPhone] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [regFullName, setRegFullName] = useState('')
  const [regBirth, setRegBirth] = useState('')
  const [regGender, setRegGender] = useState<'M' | 'F'>('F')
  const [regPhone, setRegPhone] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (authModal === 'none') {
    return null
  }

  const effectiveTab = authModal === 'login' ? 'login' : 'register'

  function switchTab(next: 'login' | 'register') {
    setError(null)
    if (next === 'login') {
      openLogin()
    } else {
      openRegister()
    }
  }

  async function onLoginSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(loginPhone, loginPassword)
      setLoginPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа')
    } finally {
      setLoading(false)
    }
  }

  async function onRegisterSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!regFullName.trim() || regFullName.trim().length < 2) {
      setError('Укажите ФИО')
      return
    }
    if (!regBirth) {
      setError('Укажите дату рождения')
      return
    }
    if (!regPhone.trim()) {
      setError('Укажите телефон')
      return
    }
    if (!regEmail.includes('@')) {
      setError('Укажите email')
      return
    }
    if (regPassword.length < 6) {
      setError('Пароль не короче 6 символов')
      return
    }
    setLoading(true)
    try {
      await register({
        fullName: regFullName.trim(),
        birthDate: regBirth,
        gender: regGender,
        phone: regPhone,
        email: regEmail.trim(),
        password: regPassword,
      })
      setRegPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="auth-modal-backdrop"
      role="presentation"
      onClick={closeAuthModal}
      onKeyDown={(ev) => {
        if (ev.key === 'Escape') {
          closeAuthModal()
        }
      }}
    >
      <div
        className="auth-modal-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className="auth-modal-head">
          <h2 id="auth-modal-title" className="auth-modal-title">
            {effectiveTab === 'login' ? 'Вход' : 'Регистрация'}
          </h2>
          <button
            type="button"
            className="auth-modal-x"
            aria-label="Закрыть"
            onClick={closeAuthModal}
          >
            ×
          </button>
        </div>

        <div className="auth-modal-tabs">
          <button
            type="button"
            className={
              effectiveTab === 'login'
                ? 'auth-modal-tab auth-modal-tab--active'
                : 'auth-modal-tab'
            }
            onClick={() => switchTab('login')}
          >
            Вход
          </button>
          <button
            type="button"
            className={
              effectiveTab === 'register'
                ? 'auth-modal-tab auth-modal-tab--active'
                : 'auth-modal-tab'
            }
            onClick={() => switchTab('register')}
          >
            Регистрация
          </button>
        </div>

        {error && (
          <p className="auth-modal-error" role="alert">
            {error}
          </p>
        )}

        {effectiveTab === 'login' ? (
          <form className="auth-modal-form" onSubmit={onLoginSubmit}>
            <label className="auth-modal-field">
              Телефон
              <input
                type="tel"
                value={loginPhone}
                onChange={(e) => setLoginPhone(e.target.value)}
                placeholder="+7 900 000-00-00"
                required
                autoComplete="tel"
              />
            </label>
            <label className="auth-modal-field">
              Пароль
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </label>
            <button type="submit" className="auth-modal-submit" disabled={loading}>
              {loading ? 'Входим…' : 'Войти'}
            </button>
          </form>
        ) : (
          <form className="auth-modal-form" onSubmit={onRegisterSubmit}>
            <label className="auth-modal-field">
              ФИО
              <input
                type="text"
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                required
                minLength={2}
                autoComplete="name"
              />
            </label>
            <label className="auth-modal-field">
              Дата рождения
              <input
                type="date"
                value={regBirth}
                onChange={(e) => setRegBirth(e.target.value)}
                required
              />
            </label>
            <label className="auth-modal-field">
              Пол
              <select
                value={regGender}
                onChange={(e) => setRegGender(e.target.value as 'M' | 'F')}
              >
                <option value="F">Женский</option>
                <option value="M">Мужской</option>
              </select>
            </label>
            <label className="auth-modal-field">
              Телефон
              <input
                type="tel"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                placeholder="+7 900 000-00-00"
                required
                autoComplete="tel"
              />
            </label>
            <label className="auth-modal-field">
              Email
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </label>
            <label className="auth-modal-field">
              Пароль (не короче 6 символов)
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </label>
            <button type="submit" className="auth-modal-submit" disabled={loading}>
              {loading ? 'Создаём аккаунт…' : 'Зарегистрироваться'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
