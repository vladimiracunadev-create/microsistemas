"""
Script de prueba de carga para Locust.
Simula usuarios navegando por el índice y realizando búsquedas.
"""
from locust import HttpUser, task, between

class WebsiteUser(HttpUser):
    """
    Usuario simulado que realiza peticiones HTTP.
    """
    wait_time = between(1, 3)

    @task(3)
    def index(self):
        self.client.get("/")

    @task(1)
    def search(self):
        self.client.get("/search?q=test")
