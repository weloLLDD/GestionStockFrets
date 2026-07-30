"use client"

import { useEffect } from "react"
import { Provider, useDispatch } from "react-redux"
import { store, type AppDispatch } from "@/store/store"
import { fetchAll } from "@/store/actions"

function DataLoader({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    // Charge les données depuis l'API MongoDB au démarrage
    dispatch(fetchAll())
  }, [dispatch])

  return <>{children}</>
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <DataLoader>{children}</DataLoader>
    </Provider>
  )
}
