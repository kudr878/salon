import './Gallery.css'

const galleryPhotos = [
  {
    src: 'https://i.pinimg.com/736x/2c/3d/04/2c3d04816fc01828eeaf84b0c88c9e58.jpg',
    alt: 'Пример причёски',
  },
  {
    src: 'https://i.pinimg.com/736x/10/25/0b/10250b164e34e23aae0e5768f3fa9eb5.jpg',
    alt: 'Журнал, примеры причёсок',
  },
  {
    src: 'https://i.pinimg.com/736x/3e/cd/76/3ecd767090c2483931b5ba82f0633364.jpg',
    alt: 'Кавайные причёски',
  },
  {
    src: 'https://i.pinimg.com/736x/61/28/b2/6128b2afafcc24ab9f1a6c0655ec2051.jpg',
    alt: 'Реклама косметики',
  },
]

export default function Gallery() {
  return (
    <section id="gallery" className="gallery">
      <h2>Галерея</h2>
      <div className="gallery-grid">
        {galleryPhotos.map((photo) => (
          <div key={photo.src} className="gallery-cell">
            <img src={photo.src} alt={photo.alt} loading="lazy" />
          </div>
        ))}
      </div>
    </section>
  )
}
