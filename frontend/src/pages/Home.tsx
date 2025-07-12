import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, Users, Award, Calendar } from 'lucide-react'
import portadaBackground from '../utils/portada-background.jpg'

const Home = () => {
  return (
    <div className="space-y-16">
      <section 
        className="relative bg-cover bg-center h-96 rounded-lg flex items-center justify-center"
        style={{ backgroundImage: `url(${portadaBackground})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg"></div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Fumigación Blockchain
          </h1>
          <p className="text-lg md:text-xl mb-8">
            Soluciones profesionales contra plagas con tecnología blockchain
          </p>
          <Link 
            to="/calendar" 
            className="bg-primary hover:bg-secondary text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Agendar Cita
          </Link>
        </div>
      </section>

      <section className="text-center">
        <h2 className="text-3xl font-bold mb-8">¿Quiénes Somos?</h2>
        <div className="max-w-4xl mx-auto">
          <p className="text-lg text-gray-700 mb-6">
            Somos una empresa que se especializa en brindar un acompañamiento constante a nuestros clientes 
            ofreciendo un servicio competitivo y profesional en el proceso de solucionar sus problemas con 
            la proliferación de plagas en zonas residenciales, comerciales e industriales.
          </p>
          <p className="text-lg text-gray-700">
            Contamos con un equipo humano, pro activo, técnico y profesional, capacitado para la manipulación 
            y aplicación de los respectivos químicos e insumos, dispuestos a entregar sólidas respuestas a 
            los requerimientos específicos de nuestros clientes.
          </p>
        </div>
      </section>

      <section className="bg-gray-100 py-12 px-6 rounded-lg">
        <h2 className="text-3xl font-bold text-center mb-12">Nuestros Servicios</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-primary mb-4">
              <Shield size={48} />
            </div>
            <h3 className="text-xl font-semibold mb-3">Desratización</h3>
            <p className="text-gray-600">
              Control de Roedores: Cordones sanitarios, asesoría, instalación y mantenimiento 
              de estaciones de cebado y de captura, para el control y monitoreo de roedores y otros tipos de plagas.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-primary mb-4">
              <Users size={48} />
            </div>
            <h3 className="text-xl font-semibold mb-3">Desinsectación</h3>
            <p className="text-gray-600">
              Control de insectos voladores y rastreros: Fumigaciones mediante aspersión con bomba 
              manual y bomba a motor, nebulización y/o termo nebulizaciones. Aplicación de gel insecticida, 
              polvo larvicida, lámparas de monitoreo y captura.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-primary mb-4">
              <Award size={48} />
            </div>
            <h3 className="text-xl font-semibold mb-3">Desinfección, Sanitización</h3>
            <p className="text-gray-600">
              Eliminación de elementos patógenos como los virus, bacterias y hongos, entre otros. 
              Estos agentes pueden perturbar la fisiología normal de plantas, animales y humanos. 
              Mediante la aplicación de desinfectantes o sanitizantes con bomba manual, bomba a motor y atomización.
            </p>
          </div>
        </div>
      </section>

      <section className="text-center">
        <h2 className="text-3xl font-bold mb-8">Innovación Blockchain</h2>
        <div className="max-w-4xl mx-auto">
          <p className="text-lg text-gray-700 mb-6">
            Implementamos tecnología blockchain para garantizar la transparencia y trazabilidad 
            de todos nuestros servicios. Cada cita se registra de forma inmutable en la blockchain, 
            proporcionando certificados digitales verificables.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3 text-blue-800">Registro Inmutable</h3>
              <p className="text-blue-700">
                Todas las citas y servicios se registran en blockchain, 
                creando un historial transparente e inmutable.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3 text-green-800">Certificados NFT</h3>
              <p className="text-green-700">
                Recibe certificados digitales únicos como comprobante 
                legal de los servicios de fumigación realizados.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary text-white py-12 px-6 rounded-lg text-center">
        <h2 className="text-3xl font-bold mb-4">¿Listo para agendar tu cita?</h2>
        <p className="text-xl mb-8">
          Utiliza nuestro calendario interactivo para seleccionar la fecha que mejor te convenga
        </p>
        <Link 
          to="/calendar" 
          className="bg-white text-primary hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center space-x-2"
        >
          <Calendar size={24} />
          <span>Ver Calendario</span>
        </Link>
      </section>
    </div>
  )
}

export default Home