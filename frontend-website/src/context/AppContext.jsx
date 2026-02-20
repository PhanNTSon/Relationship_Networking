import { createContext, useState } from "react"

export const AppCtx = createContext(null)

export function AppProvider({ children }) {
    const [jwt, setJwt] = useState("")
    const [persons, setPersons] = useState([])
    const [role, setRole] = useState("")

    const value = {
        jwt,
        setJwt,
        persons,
        setPersons,
        role,
        setRole
    }

    return (
        <AppCtx.Provider value={value}>
            {children}
        </AppCtx.Provider>
    )
}