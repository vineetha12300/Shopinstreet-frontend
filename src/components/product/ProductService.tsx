import { createProduct } from '../services/ApiServices';
import { Product } from './IProductTypes';


export class ProductService {
  private static instance: ProductService;
  private products: Product[] = [];

 

  public static getInstance(): ProductService {
    if (!ProductService.instance) {
      ProductService.instance = new ProductService();
    }
    return ProductService.instance;
  }

 

  public addProduct(product: Omit<Product, 'id'>): Product {
    const response = createProduct(product)
    console.log("Product created successfully:", response);
    if (response) {
      console.log("Product created successfully:", response);
    }
 
    // const newProduct = {
    //   ...product,
    //   id: newId,
    //   created_at: new Date().toISOString()
    // };
    // this.products.push(newProduct);
    const newProduct: Product = {
      ...product,
      id: this.products.length + 1, // Assuming id is auto-incremented
      created_at: new Date().toISOString(),
    };
    this.products.push(newProduct);
    return newProduct;
  }

  public updateProduct(id: number, product: Partial<Product>): Product | null {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    this.products[index] = { ...this.products[index], ...product };
    return this.products[index];
  }

  public deleteProduct(id: number): boolean {
    const initialLength = this.products.length;
    this.products = this.products.filter(p => p.id !== id);
    return this.products.length !== initialLength;
  }

  public getProductById(id: number): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  public getCategories(): string[] {
    return [...new Set(this.products.map(p => p.category))];
  }
}
