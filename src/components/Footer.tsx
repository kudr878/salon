import './Footer.css'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-tile" aria-hidden="true" />
      <div className="site-footer-inner">
        <p className="site-footer-brand">Салон красоты</p>

        <div className="site-footer-columns">
          <div className="site-footer-col">
            <h3 className="site-footer-heading">Услуги</h3>
            <ul className="site-footer-list site-footer-list--accent">
              <li>
                <a href="#services-1">Стрижка и укладка</a>
              </li>
              <li>
                <a href="#services-2">Окрашивание</a>
              </li>
              <li>
                <a href="#services-3">Уход за волосами</a>
              </li>
            </ul>
          </div>
          <div className="site-footer-col">
            <h3 className="site-footer-heading">О салоне</h3>
            <ul className="site-footer-list">
              <li>
                <a href="#hero">Акции</a>
              </li>
              <li>
                <a href="#gallery">Галерея</a>
              </li>
              <li>
                <a href="#masters">Мастера</a>
              </li>
              <li>
                <a href="#profile">Личный кабинет</a>
              </li>
            </ul>
          </div>
          <div className="site-footer-col">
            <h3 className="site-footer-heading">Информация</h3>
            <ul className="site-footer-list">
              <li>
                <a href="#">Политика конфиденциальности</a>
              </li>
              <li>
                <a href="#">Пользовательское соглашение</a>
              </li>
            </ul>
          </div>
          <div className="site-footer-col site-footer-col--newsletter">
            <h3 className="site-footer-heading">Рассылка</h3>
            <div className="site-footer-newsletter">
              <div className="site-footer-newsletter-row">
                <input
                  type="email"
                  className="site-footer-input"
                  placeholder="E-mail"
                  autoComplete="email"
                />
                <button type="button" className="site-footer-subscribe">
                  Подписаться
                </button>
              </div>
              <label className="site-footer-consent">
                <input type="checkbox" />
                <span>Согласие с условиями и политикой конфиденциальности</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
