import { useState } from 'react'
import './contraseña.css'
import { Navigate } from 'react-router-dom'

const RecuperarContrasena = () => {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)

  if (step === 4) {
    return <Navigate to='/' />
  }

  const BASE = 'http://127.0.0.1:8000/usuario'

  const handleRequestCode = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${BASE}/recuperacion-codigo/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: email })
      })
      const data = await res.json()
      if (res.ok && data.status === 1) {
        setMessage('Código enviado al correo.')
        setStep(2)
      } else {
        setMessage(data.message || 'Error al enviar el código.')
      }
    } catch {
      setMessage('Error de conexión.')
    }
    setLoading(false)
  }

  const handleVerifyCode = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${BASE}/recuperacion-codigo-confirmar/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: email, code })
      })
      const data = await res.json()
      if (res.ok && data.status === 1) {
        setMessage('Código verificado, ahora ingresa nueva contraseña.')
        setStep(3)
      } else {
        setMessage(data.message || 'Código inválido.')
      }
    } catch {
      setMessage('Error de conexión.')
    }
    setLoading(false)
  }

  const handleSetPassword = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${BASE}/recuperacion-codigo-actualizar/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: email, password })
      })
      const data = await res.json()
      if (res.ok && data.status === 1) {
        setShowModal(true) // Mostramos modal
      } else {
        setMessage(data.message || 'No se pudo cambiar la contraseña.')
      }
    } catch {
      setMessage('Error de conexión.')
    }
    setLoading(false)
  }

  const closeModal = () => {
    setShowModal(false)
    setStep(4) // redirigir al login
    setEmail('')
    setCode('')
    setPassword('')
  }

  return (
    <div className='recuperar-container'>
      <div className='recuperar-panel'>
        <h2 className='recuperar-title'>Recuperar Contraseña</h2>
        {message && <p className='recuperar-message'>{message}</p>}

        {step === 1 && (
          <div className='recuperar-step'>
            <input
              type='email'
              placeholder='Correo electrónico'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='recuperar-input'
            />
            <button
              onClick={handleRequestCode}
              disabled={loading}
              className='recuperar-button'
            >
              {loading ? 'Enviando...' : 'Enviar código'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className='recuperar-step'>
            <input
              type='text'
              placeholder='Código de recuperación'
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className='recuperar-input'
            />
            <button
              onClick={handleVerifyCode}
              disabled={loading}
              className='recuperar-button'
            >
              {loading ? 'Verificando...' : 'Verificar código'}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className='recuperar-step'>
            <input
              type='password'
              placeholder='Nueva contraseña'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='recuperar-input'
            />
            <button
              onClick={handleSetPassword}
              disabled={loading}
              className='recuperar-button'
            >
              {loading ? 'Cambiando...' : 'Cambiar contraseña'}
            </button>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className='modal-overlay'>
            <div className='modal-content'>
              <h3>¡Éxito!</h3>
              <p>La contraseña ha sido cambiada correctamente.</p>
              <button onClick={closeModal} className='modal-button'>
                Aceptar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RecuperarContrasena
