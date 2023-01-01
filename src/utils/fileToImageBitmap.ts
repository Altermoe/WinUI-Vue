export const file2ImageBitmap = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer()
  const blob = new Blob([arrayBuffer])
  return createImageBitmap(blob)
}
