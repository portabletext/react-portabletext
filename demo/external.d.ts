declare module 'refractor/lang/typescript' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lang: any
  export default lang
}

declare module 'leaflet/dist/images/*' {
  const path: string
  export default path
}
