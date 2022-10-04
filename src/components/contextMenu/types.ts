export interface ContextMenuItem<T> {
  title: string
  key: string | number | symbol
  value?: T
}
