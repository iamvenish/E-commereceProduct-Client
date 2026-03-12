import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HandleService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  GetProductsDetails() {
    return this.http.get<any[]>(`${this.apiUrl}/api/ProductDetails`);
  }

  getProductById(id: string) {
    return this.http.get<any[]>(`${this.apiUrl}/api/editProduct/${id}`);
  }

  updateProduct(product: any, id: string) {
    return this.http.put(`${this.apiUrl}/api/editedProduct/${id}`, product);
  }

  addProduct(product: any) {
    return this.http.post(`${this.apiUrl}/api/addProduct`, product);
  }

  deleteProduct(id: string) {
    return this.http.delete(`${this.apiUrl}/api/deleteProduct/${id}`);
  }

  addToCart(product: any, id: string) {
    return this.http.post(`${this.apiUrl}/api/AddToCartProducts/${id}`, product);
  }

  getCartProducts() {
    return this.http.get<any[]>(`${this.apiUrl}/api/AddToCartProducts`);
  }
}
