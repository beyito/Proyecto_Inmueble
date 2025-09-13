from django.db import models

from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import datetime
import random
import string

class Rol(models.Model):
    idRol = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        db_table = "rol" 

    def __str__(self):
        return self.nombre

class Usuario(AbstractUser):
    nombre = models.CharField(max_length=100)
    correo = models.EmailField(unique=True, null=True, blank=True)
    ci = models.CharField(max_length=20, unique=False, null=True, blank=True)
    telefono = models.CharField(max_length=20, null=True, blank=True)
    idRol = models.ForeignKey(Rol, on_delete=models.RESTRICT, db_column="idRol")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def es_cliente(self):
        return self.idRol.nombre == "Cliente"
    
    def es_agente(self):
        return self.idRol.nombre == "Agente"
    
    def es_admin(self):
        return self.idRol.nombre == "Administrador"
    
    class Meta:
        db_table = "usuario"

    def __str__(self):
        return self.nombre


class Cliente(models.Model):
    idUsuario = models.OneToOneField(
        Usuario,
        on_delete=models.CASCADE,
        primary_key=True,
        db_column="id"
    )
    ubicacion = models.CharField(max_length=200, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "cliente"


class Agente(models.Model):
    idUsuario = models.OneToOneField(
        Usuario,
        on_delete=models.CASCADE,
        primary_key=True,
        db_column="id"
    )
    numero_licencia = models.CharField(max_length=50, unique=True, null=True, blank=True) # Número de licencia profesional
    experiencia = models.IntegerField(default=0) # Años de experiencia
    puntaje = models.FloatField(default=0.0, blank = True) # Puntaje promedio basado en reseñas
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        db_table = "agente"

class Estado(models.Model):
    idEstado = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        db_table = "estado"

    def __str__(self):
        return self.nombre
    
def generate_code(length=6):
    """Genera un código alfanumérico aleatorio tipo 'AFG423'"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

class PasswordResetCode(models.Model):
    user = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='reset_codes')
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False) 
    expires_at = models.DateTimeField()

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = generate_code()
        if not self.expires_at:
            self.expires_at = timezone.now() + datetime.timedelta(minutes=15)  # código válido 15 min
        super().save(*args, **kwargs)

    def is_valid(self):
        return not self.is_used and timezone.now() <= self.expires_at