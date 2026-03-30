export type ServiceItem = {
  name: string
  price: number
}

export type ServiceCategory = {
  id: number
  title: string
  items: ServiceItem[]
}

export type ServicesPayload = {
  categories: ServiceCategory[]
}
