from locust import HttpUser, task, between

class SearchUser(HttpUser):
    wait_time = between(1, 5)

    @task
    def search_products(self):
        self.client.get("/product/search?term=all")
        self.client.get("/product/search?term=new")
        self.client.get("/product/search?term=old")
        self.client.get("/product/search?term=bad")

    @task
    def search_customers(self):
       self.client.get("/customer/search?term=all")
       self.client.get("/customer/search?term=new")
       self.client.get("/customer/search?term=old")
       self.client.get("/customer/search?term=bad")