import { useState } from 'react'
import './ModalContratoAgente.css'

export default function ModalContratoAgente({ onClose }) {
  const [formData, setFormData] = useState({
    ciudad: '',
    fecha: '',
    inmobiliaria_nombre: '',
    inmobiliaria_direccion: '',
    inmobiliaria_representante: '',
    agente_nombre: '',
    agente_direccion: '',
    agente_ci: '',
    agente_licencia: '',
    comision: '',
    duracion: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch(
        'http://127.0.0.1:8000/usuario/generarContratoPdf/',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        }
      )

      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `contrato_${formData.agente_nombre || 'agente'}.pdf`
        document.body.appendChild(a)
        a.click()
        a.remove()
        setMessage('Contrato generado con éxito.')
      } else {
        setMessage('Error al generar contrato.')
      }
    } catch (err) {
      setMessage('Error de conexión.')
    }
    setLoading(false)
  }

  // Tipos de input según el campo
  const getInputType = (key) => {
    if (key === 'fecha') return 'date'
    if (key === 'comision' || key === 'duracion') return 'number'
    return 'text'
  }

  // Secciones para mejor organización
  const sections = [
    { title: 'Información general', fields: ['ciudad', 'fecha'] },
    {
      title: 'Inmobiliaria',
      fields: [
        'inmobiliaria_nombre',
        'inmobiliaria_direccion',
        'inmobiliaria_representante'
      ]
    },
    {
      title: 'Agente',
      fields: [
        'agente_nombre',
        'agente_direccion',
        'agente_ci',
        'agente_licencia'
      ]
    },
    {
      title: 'Contrato',
      fields: ['comision', 'duracion']
    }
  ]

  return (
    <div className='modal-overlay'>
      <div className='modal-content'>
        <h3>Generar Contrato de Agente</h3>
        {message && <p>{message}</p>}

        {sections.map((section) => (
          <div key={section.title} className='modal-section'>
            <h4>{section.title}</h4>
            {section.fields.map((key) => (
              <input
                key={key}
                name={key}
                type={getInputType(key)}
                placeholder={key.replace(/_/g, ' ').toUpperCase()}
                value={formData[key]}
                onChange={handleChange}
                className='modal-input'
              />
            ))}
          </div>
        ))}

        <div className='modal-buttons'>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className='modal-button'
          >
            {loading ? 'Generando...' : 'Generar PDF'}
          </button>
          <button onClick={onClose} className='modal-button cancel'>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
