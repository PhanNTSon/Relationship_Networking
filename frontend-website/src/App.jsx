import { useState, useContext } from 'react'
import './App.css'
import { AppCtx, AppProvider } from './context/AppContext'
import MainPage from './pages/main/MainPage'
import LoginPage from './pages/login/LoginPage'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Navigate } from 'react-router-dom'

function AppContent() {

  return (
    <Routes>
      <Route path="/main" element={
        <ProtectedRoute>
          <MainPage />
        </ProtectedRoute>
      } />
      <Route path="/" element={<LoginPage />} />
    </Routes>
  )
}

function ProtectedRoute({ children }) {
  const { jwt } = useContext(AppCtx)

  if (!jwt) {
    return <Navigate to="/" replace />
  }

  return children
}

function App() {
  return (
    <Router>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </Router>
  )
}

export default App
