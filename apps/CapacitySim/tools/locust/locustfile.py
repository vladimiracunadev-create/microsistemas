from locust import HttpUser, task, between

class WebsiteUser(HttpUser):
    wait_time = between(1, 3)

    @task(3)
    def index(self):
        self.client.get("/")

    @task(1)
    def search(self):
        self.client.get("/search?q=test")
