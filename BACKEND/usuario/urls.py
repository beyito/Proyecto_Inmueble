from django.urls import path
from . import views

urlpatterns = [ 
    path('login', views.login, name='login'),
    path('register', views.register, name='register'),
    path('profile', views.profile, name='profile'),
    path('registerAgente', views.registerAgente, name='registerAgente'),
    path('<int:pk>/update', views.update_usuario, name='update-usuario'),
]