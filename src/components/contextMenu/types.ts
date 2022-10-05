export interface ContextMenuItem<T = any> {
  title: string
  key: string | number | symbol
  value?: T
  children?: ContextMenuItem[]
}
