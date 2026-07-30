"use client"

import useSWR from "swr"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Erreur ${res.status}`)
  const json = await res.json()
  return json.data ?? json
}

/**
 * Récupère une collection depuis l'API MongoDB.
 * Retourne un tableau (jamais undefined) pour simplifier l'usage dans les pages.
 */
export function useCollection<T = unknown>(resource: string) {
  const { data, error, isLoading, mutate } = useSWR<T[]>(`/api/${resource}`, fetcher, {
    revalidateOnFocus: false,
  })
  return { data: data ?? [], error, isLoading, mutate }
}
