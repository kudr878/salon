export type ServiceCategoryBrief = {
  id: number
  name: string
}

export type MasterFromApi = {
  id: number
  fullName: string
  photoId: string | null
  categories?: ServiceCategoryBrief[]
}
