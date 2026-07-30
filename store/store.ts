// Redux Classic - Store (avec middleware thunk pour les appels API)
import { createStore, applyMiddleware, compose } from "redux"
import { thunk, type ThunkAction, type ThunkDispatch } from "redux-thunk"
import type { AnyAction } from "redux"
import { rootReducer, type RootState } from "./reducers"

const composeEnhancers =
  (typeof window !== "undefined" &&
    (window as unknown as { __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose }).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
  compose

export function makeStore() {
  return createStore(rootReducer, composeEnhancers(applyMiddleware(thunk)))
}

export const store = makeStore()
export type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>
export type AppThunk<R = void> = ThunkAction<R, RootState, unknown, AnyAction>
