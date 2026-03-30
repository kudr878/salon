import { useAuth } from '../context/AuthContext'
import { givenNameFromFullNameRu } from '../utils/personDisplayName'
import './Header.css'

export default function Header() {
  const { client, sessionLoading, openLogin, openRegister, logout } = useAuth()

  return (
    <header className="header">
      <div className="header-inner">
        <nav className="nav">
          <a href="#gallery">Галерея</a>
          <a href="#services">Услуги и цены</a>
          <a href="#masters">Мастера</a>
          <a href="#profile">Личный кабинет</a>
        </nav>
        <div className="header-auth">
          {sessionLoading && <span className="header-auth-hint">…</span>}
          {!sessionLoading && !client && (
            <>
              <button type="button" className="login" onClick={openLogin}>
                Войти
              </button>
              <button type="button" className="header-register" onClick={openRegister}>
                Регистрация
              </button>
            </>
          )}
          {!sessionLoading && client && (
            <>
              <span className="header-user-name" title={client.fullName}>
                {givenNameFromFullNameRu(client.fullName)}
              </span>
              <button type="button" className="header-logout" onClick={logout}>
                Выйти
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
