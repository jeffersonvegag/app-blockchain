import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Shield, Bug, Droplets, Home, Users, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface Service {
  id: number
  name: string
  description: string
}

const Services = () => {
  const [services, setServices] = useState<Service[]>([])

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API_URL}/services`)
      setServices(response.data)
    } catch (error) {
      console.error('Error fetching services:', error)
    }
  }

  const getServiceIcon = (serviceName: string) => {
    switch (serviceName) {
      case 'Desratización':
        return <Shield className="w-12 h-12 text-primary" />
      case 'Desinsectación':
        return <Bug className="w-12 h-12 text-primary" />
      case 'Desinfección/Sanitización':
        return <Droplets className="w-12 h-12 text-primary" />
      case 'Control de Termitas':
        return <Home className="w-12 h-12 text-primary" />
      case 'Tratamiento de Murciélagos':
        return <Users className="w-12 h-12 text-primary" />
      default:
        return <Shield className="w-12 h-12 text-primary" />
    }
  }

  const getServiceDetails = (serviceName: string) => {
    const serviceDetails = {
      'Desratización': {
        details: 'Cordones sanitarios, asesoría, instalación y mantenimiento de estaciones de cebado y de captura, para el control y monitoreo de roedores y otros tipos de plagas.',
        additionalInfo: 'Mediante cebos rodenticidas de condiciones excepcionales, muy efectivos, son un potente anticoagulante de última generación que actúan mortalmente luego de la primera ingesta. Este tipo de raticida elimina en un 80% los malos olores que se producen al morir los roedores.'
      },
      'Desinsectación': {
        details: 'Fumigaciones mediante: aspersión con bomba manual y bomba a motor, nebulización y/o termo nebulizaciones.',
        additionalInfo: 'Aplicación de gel insecticida, polvo larvicida, lámparas de monitoreo y captura para el control efectivo de insectos voladores y rastreros.'
      },
      'Desinfección/Sanitización': {
        details: 'Eliminación de elementos patógenos como los virus, bacterias y hongos, entre otros. Estos agentes pueden perturbar la fisiología normal de plantas, animales y humanos.',
        additionalInfo: 'Mediante la aplicación de desinfectantes o sanitizantes con bomba manual, bomba a motor y atomización.'
      },
      'Control de Termitas': {
        details: 'Los mecanismos a usar dependerán según el área y el grado de infestación que está presente.',
        additionalInfo: 'Técnicas incluyen: Perforaciones con taladro de percusión en las áreas infestadas, aplicación de termicidas mediante inyección directa, y aspersión focalizada en áreas infestadas.'
      },
      'Tratamiento de Murciélagos': {
        details: 'Es un proceso que consiste en etapas tales como: Sellado de huecos y grietas, limpieza profunda, desinfección y sanitización de las áreas tratadas.',
        additionalInfo: 'Aplicación de repelente y reubicación de la fauna silvestre. Prestamos nuestros servicios en zonas residenciales, comerciales e industriales.'
      }
    }
    return serviceDetails[serviceName as keyof typeof serviceDetails] || { details: '', additionalInfo: '' }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Nuestros Servicios</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Ofrecemos soluciones profesionales y especializadas para el control de plagas, 
          respaldados por tecnología blockchain para garantizar transparencia y trazabilidad.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {services.map((service) => {
          const details = getServiceDetails(service.name)
          return (
            <div key={service.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex justify-center mb-4">
                {getServiceIcon(service.name)}
              </div>
              <h3 className="text-xl font-semibold text-center mb-3">{service.name}</h3>
              <p className="text-gray-600 mb-4">{details.details}</p>
              {details.additionalInfo && (
                <p className="text-sm text-gray-500 mb-4">{details.additionalInfo}</p>
              )}
              <div className="text-center">
                <Link
                  to="/calendar"
                  className="inline-flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary transition-colors"
                >
                  <Calendar size={18} />
                  <span>Agendar Servicio</span>
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-8 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">¿Por qué elegirnos?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="font-semibold mb-2">Profesionales Certificados</h3>
              <p className="text-sm opacity-90">Técnicos capacitados y con experiencia</p>
            </div>
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Droplets className="w-8 h-8" />
              </div>
              <h3 className="font-semibold mb-2">Productos Seguros</h3>
              <p className="text-sm opacity-90">Químicos de última generación, seguros para el ambiente</p>
            </div>
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Bug className="w-8 h-8" />
              </div>
              <h3 className="font-semibold mb-2">Garantía de Calidad</h3>
              <p className="text-sm opacity-90">Seguimiento post-servicio y garantía de resultados</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 bg-blue-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Innovación Blockchain</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-blue-800">Transparencia Total</h3>
            <p className="text-blue-700">
              Cada servicio queda registrado de forma inmutable en la blockchain, 
              proporcionando un historial completo y verificable de todos los tratamientos realizados.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3 text-blue-800">Certificados Digitales</h3>
            <p className="text-blue-700">
              Recibe certificados NFT únicos como comprobante legal de los servicios de fumigación, 
              con validez legal y verificación blockchain.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Services