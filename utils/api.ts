import { useRuntimeConfig } from 'nuxt/app'

export const useApi = () => {
const config = useRuntimeConfig()
const base = config.public.apiBase


const postJson = async <T>(path: string, body: any): Promise<T> => {
const res = await fetch(`${base}${path}`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(body)
})
if (!res.ok) throw new Error(await res.text())
return res.json() as Promise<T>
}


return { base, postJson }
}