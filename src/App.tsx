import Header from './components/Header'
import Hero from './components/Hero'
import Gallery from './components/Gallery'
import Services from './components/Services'
import Masters from './components/Masters'
import Footer from './components/Footer'
import BookingPromo from './components/BookingPromo'
import ProfilePage from './components/ProfilePage'
import { useProfileHash } from './hooks/useProfileHash'
import './App.css'

export default function App() {
  const onProfile = useProfileHash()

  return (
    <div className="site-layout">
      <Header />

      {onProfile ? (
        <ProfilePage />
      ) : (
        <>
          <Hero />
          <div className="app">
            <main className="main">
              <Gallery />
              <Services />
              <Masters />
              <BookingPromo />
            </main>
          </div>
        </>
      )}

      <Footer />
    </div>
  )
}
