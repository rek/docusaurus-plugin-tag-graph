export type InputContent = {
  colours: {
    text: string
    background: string
  }
}
export type LoadedContent = {
  tagMap: {
    tags: unknown
    source: string
  }[]
  category: string
} & InputContent
