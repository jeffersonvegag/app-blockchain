import React, { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Calendar as CalendarIcon, Clock, MapPin, MessageSquare, Send } from 'lucide-react'

const API_URL = 'https://app-blockchain.onrender.com';
interface CalendarDay {
  date: string
  available: boolean
}

interface Service {
  id: number
  name: string
  description: string
}

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    service_type: '',
    address: '',
    comments: ''
  })

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ]

  useEffect(() => {
    fetchCalendarData()
    fetchServices()
  }, [currentDate])

  const fetchCalendarData = async () => {
    try {
      const response = await axios.get(`${API_URL}/calendar/available`, {
        params: {
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear()
        }
      })
      setCalendarData(response.data)
    } catch (error) {
      toast.error('Error al cargar el calendario')
    }
  }

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API_URL}/services`)
      setServices(response.data)
    } catch (error) {
      toast.error('Error al cargar los servicios')
    }
  }

  const handleDateClick = (date: string, available: boolean) => {
    if (available) {
      setSelectedDate(date)
      setShowModal(true)
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedDate || !selectedTime || !formData.service_type || !formData.address) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    try {
      const appointmentDate = new Date(`${selectedDate}T${selectedTime}:00`)
      
      await axios.post(`${API_URL}/appointments`, {
        service_type: formData.service_type,
        date: appointmentDate.toISOString(),
        address: formData.address,
        comments: formData.comments
      })
      
      toast.success('Cita agendada exitosamente')
      setShowModal(false)
      setFormData({ service_type: '', address: '', comments: '' })
      setSelectedTime('')
      fetchCalendarData()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Error al agendar la cita')
    }
  }

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const current = new Date(startDate)
    
    while (current <= lastDay || current.getDay() !== 0) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const isDateAvailable = (date: Date) => {
    const dateString = formatDate(date)
    const calendarDay = calendarData.find(d => d.date.split('T')[0] === dateString)
    return calendarDay ? calendarDay.available : false
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <CalendarIcon className="text-primary" />
            <span>Calendario de Citas</span>
          </h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              ←
            </button>
            <span className="text-lg font-semibold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-4">
          {dayNames.map(day => (
            <div key={day} className="text-center font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {getDaysInMonth().map((date, index) => {
            const available = isDateAvailable(date) && isCurrentMonth(date)
            const currentMonthDate = isCurrentMonth(date)
            const today = isToday(date)
            
            return (
              <div
                key={index}
                onClick={() => handleDateClick(formatDate(date), available)}
                className={`
                  h-12 flex items-center justify-center cursor-pointer rounded transition-colors
                  ${!currentMonthDate ? 'text-gray-300' : ''}
                  ${today ? 'ring-2 ring-blue-500' : ''}
                  ${available ? 'bg-blue-100 hover:bg-blue-200 text-blue-800' : ''}
                  ${!available && currentMonthDate ? 'bg-red-100 text-red-800' : ''}
                  ${!available && !currentMonthDate ? 'bg-gray-50' : ''}
                `}
              >
                {date.getDate()}
              </div>
            )
          })}
        </div>

        <div className="mt-6 flex justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-100 rounded"></div>
            <span>Disponible</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-100 rounded"></div>
            <span>No disponible</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 ring-2 ring-blue-500 rounded"></div>
            <span>Hoy</span>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Agendar Cita</h3>
            <p className="text-gray-600 mb-4">
              Fecha seleccionada: {selectedDate && new Date(selectedDate).toLocaleDateString()}
            </p>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Selecciona una hora</option>
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Servicio
                </label>
                <select
                  value={formData.service_type}
                  onChange={(e) => setFormData({...formData, service_type: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Selecciona un servicio</option>
                  {services.map(service => (
                    <option key={service.id} value={service.name}>{service.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección del Servicio
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows={3}
                    placeholder="Dirección completa donde se realizará el servicio"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comentarios Adicionales
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <textarea
                    value={formData.comments}
                    onChange={(e) => setFormData({...formData, comments: e.target.value})}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows={3}
                    placeholder="Información adicional sobre el servicio (opcional)"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white py-2 px-4 rounded-md hover:bg-secondary transition-colors flex items-center justify-center space-x-2"
                >
                  <Send size={18} />
                  <span>Agendar Cita</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Calendar