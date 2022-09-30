export interface DropdownItem<T = any> {
  title?: string
  value: T
  key: string | number | symbol
}
