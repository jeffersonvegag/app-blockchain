import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, Calendar, Home, User, Settings } from 'lucide-react'
import logo from '../utils/logo.png'

const Navbar = () => {
  const { user, logout } = useAuth()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <img src={logo} alt="Logo" className="h-8 w-8" />
            <span className="text-xl font-bold text-primary">Fumigación Blockchain</span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md ${
                isActive('/') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Home size={18} />
              <span>Inicio</span>
            </Link>

            <Link
              to="/services"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md ${
                isActive('/services') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Settings size={18} />
              <span>Servicios</span>
            </Link>

            {user ? (
              <>
                <Link
                  to="/calendar"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md ${
                    isActive('/calendar') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Calendar size={18} />
                  <span>Calendario</span>
                </Link>

                <Link
                  to="/dashboard"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md ${
                    isActive('/dashboard') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <User size={18} />
                  <span>Dashboard</span>
                </Link>

                <div className="flex items-center space-x-2 text-gray-700">
                  <span className="text-sm">Hola, {user.full_name}</span>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={18} />
                    <span>Salir</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-md text-primary border border-primary hover:bg-primary hover:text-white transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-md bg-primary text-white hover:bg-secondary transition-colors"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar