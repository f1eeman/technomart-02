export const readText = (key: string): string | null => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export const writeText = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value)
  } catch {
    return
  }
}

export const dropText = (key: string): void => {
  try {
    localStorage.removeItem(key)
  } catch {
    return
  }
}
