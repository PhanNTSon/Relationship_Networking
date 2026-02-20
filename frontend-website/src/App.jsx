import { useState } from 'react'
import './App.css'
import { AppCtx, AppProvider } from './context/AppContext'
import MainPage from './pages/main/MainPage'
import LoginPage from './pages/login/LoginPage'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function AppContent() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  )
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
