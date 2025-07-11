import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { Calendar, Clock, MapPin, CheckCircle, XCircle, AlertCircle, Link as LinkIcon } from 'lucide-react'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface Appointment {
  id: number
  service_type: string
  date: string
  address: string
  comments: string
  status: string
  blockchain_tx: string | null
  created_at: string
  user?: {
    id: number
    email: string
    full_name: string
    phone: string
  }
}

const Dashboard = () => {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(`${API_URL}/appointments`)
      setAppointments(response.data)
    } catch (error) {
      toast.error('Error al cargar las citas')
    } finally {
      setLoading(false)
    }
  }

  const updateAppointmentStatus = async (appointmentId: number, status: string) => {
    try {
      await axios.put(`${API_URL}/appointments/${appointmentId}/status?status=${status}`)
      toast.success('Estado actualizado correctamente')
      fetchAppointments()
    } catch (error) {
      toast.error('Error al actualizar el estado')
    }
  }

  const registerOnBlockchain = async (appointmentId: number) => {
    try {
      const response = await axios.post(`${API_URL}/blockchain/register-appointment?appointment_id=${appointmentId}`)
      toast.success('Cita registrada en blockchain')
      fetchAppointments()
    } catch (error) {
      toast.error('Error al registrar en blockchain')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente'
      case 'approved':
        return 'Aprobada'
      case 'completed':
        return 'Completada'
      case 'cancelled':
        return 'Cancelada'
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-blue-600" />
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {user?.role === 'admin' ? 'Panel de Administración' : 'Mi Dashboard'}
        </h1>
        <p className="text-gray-600">
          Bienvenido, {user?.full_name}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Citas</p>
              <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">
                {appointments.filter(a => a.status === 'pending').length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completadas</p>
              <p className="text-2xl font-bold text-green-600">
                {appointments.filter(a => a.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {user?.role === 'admin' ? 'Todas las Citas' : 'Mis Citas'}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {user?.role === 'admin' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Servicio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dirección
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Blockchain
                </th>
                {user?.role === 'admin' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-gray-50">
                  {user?.role === 'admin' && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.user?.full_name || 'Usuario desconocido'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {appointment.user?.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        {appointment.user?.phone}
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {appointment.service_type}
                    </div>
                    {appointment.comments && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {appointment.comments}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {new Date(appointment.date).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-900 truncate max-w-xs">
                        {appointment.address}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(appointment.status)}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {appointment.blockchain_tx ? (
                      <div className="flex items-center space-x-2">
                        <LinkIcon className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-green-600 font-mono">
                          {appointment.blockchain_tx.slice(0, 10)}...
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => registerOnBlockchain(appointment.id)}
                        className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                      >
                        Registrar
                      </button>
                    )}
                  </td>
                  {user?.role === 'admin' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {appointment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'approved')}
                              className="bg-green-100 text-green-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-green-200 transition-colors"
                            >
                              ✓ Aprobar
                            </button>
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                              className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-red-200 transition-colors"
                            >
                              ✗ Rechazar
                            </button>
                          </>
                        )}
                        {appointment.status === 'approved' && (
                          <button
                            onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                            className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors"
                          >
                            ✓ Completar
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard