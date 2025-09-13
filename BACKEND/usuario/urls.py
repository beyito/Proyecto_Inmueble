from django.urls import path
from . import views

urlpatterns = [ 
    path('login', views.login, name='login'),
    path('register', views.register, name='register'), # Registro de Cliente
    path('profile', views.profile, name='profile'),
    path('<int:pk>/update', views.update_usuario, name='update-usuario'),
    path('registerAgente', views.registerAgente, name='registerAgente'), # Registro de Agente
    path('mostrarUsuarios', views.mostrarUsuarios, name='mostrarUsuarios'), # Mostrar usuarios
]