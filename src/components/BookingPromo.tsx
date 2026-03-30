import './BookingPromo.css'

export default function BookingPromo() {
  return (
    <section id="booking" className="booking-promo" aria-label="Онлайн-запись">
      <h2 className="booking-promo-title">Онлайн-запись</h2>
      <p className="booking-promo-text">
        Выберите услугу, мастера и время в личном кабинете — без звонка в салон.
        Или позвоните по номеру <span className="booking-promo-phone">+7 928 957 53 21</span>
      </p>
      <a className="booking-promo-cta" href="#profile">
        Открыть личный кабинет
      </a>
    </section>
  )
}
