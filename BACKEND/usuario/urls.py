from django.urls import path
from . import views

urlpatterns = [ 
    path('login/', views.login, name='login'),
    path('register/', views.register, name='register'),
    path('profile/', views.profile, name='profile'),
    path('registerAgente/', views.registerAgente, name='registerAgente'),
    path('recuperacion-codigo-actualizar/', views.SetNewPasswordView.as_view(), name='recuperacion-codigo-actualizar'),
    path('recuperacion-codigo/', views.PasswordResetRequestView.as_view(), name='codigo-recuperacion'),
    path('recuperacion-codigo-confirmar/', views.PasswordResetVerifyCodeView.as_view(), name='recuperacion-codigo-confirmar'),
    path("generarContratoPdf/", views.ContratoAgenteView.as_view(), name="generarContratoPdf"),
    path('editarUsuario', views.actualizarUsuario, name='editarUsuario') # Editar usuario
]


# pasos para recuperar contraseña
#1. /usuario/recuperacion-codigo/
# {
#   "email": "sebas@gmail.com"
# }
#
#2. /usuario/recuperacion-codigo-confirmar/
# {
#   "email": "sebas@gmail.com",
#   "code": "(codigo enviado al email)"
# }
#
#3. /usuario/recuperacion-codigo-actualizar/
# {
#   "email": "sebas@gmail.com",
#   "password": "123456"
# }