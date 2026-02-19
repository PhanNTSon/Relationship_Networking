import { createContext } from "react";

export const AppCtx = createContext({
    jwt: "",
    persons: [],
    role: ""
})

export function AppProvider({ children }) {
    return (
        <AppCtx.Provider value={{
            jwt,
            persons,
            role
        }}>
            {children}
        </AppCtx.Provider>
    )
}