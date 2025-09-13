from django.urls import path
from . import views

from django.http import JsonResponse

def custom_404(request, exception=None):
    return JsonResponse(
        {"error": "La URL solicitada no existe"},
        status=404
    )

urlpatterns = [ 
    path('login', views.login, name='login'),
    path('register', views.register, name='register'), # Registro de Cliente
    path('profile', views.profile, name='profile'),
    path('registerAgente', views.registerAgente, name='registerAgente'), # Registro de Agente
    path('mostrarUsuarios', views.mostrarUsuarios, name='mostrarUsuarios'), # Mostrar usuarios
]