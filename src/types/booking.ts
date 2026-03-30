export type BookingService = {
  id: number
  name: string
  price: number
}

export type BookingCategory = {
  id: number
  name: string
  services: BookingService[]
}
