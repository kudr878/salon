import { DEFAULT_MASTER_PHOTO, masterPhotoSrc } from '../utils/masterPhoto'

type MasterAvatarProps = {
  photoId: string | null | undefined
  name: string
  className?: string
}

export default function MasterAvatar({ photoId, name, className }: MasterAvatarProps) {
  return (
    <img
      className={className}
      src={masterPhotoSrc(photoId)}
      alt=""
      title={name}
      onError={(e) => {
        const img = e.currentTarget
        if (img.src.includes('photo-default')) {
          img.onerror = null
          return
        }
        img.src = DEFAULT_MASTER_PHOTO
      }}
    />
  )
}
