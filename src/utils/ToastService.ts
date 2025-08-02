type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

class ToastService {
  private static instance: ToastService;
  private listeners: ((toasts: Toast[]) => void)[] = [];
  private toasts: Toast[] = [];

  private constructor() {}

  public static getInstance(): ToastService {
    if (!ToastService.instance) {
      ToastService.instance = new ToastService();
    }
    return ToastService.instance;
  }

  public addToast(message: string, type: ToastType = 'info'): void {
    const toast: Toast = {
      id: Date.now().toString(),
      message,
      type
    };
    
    this.toasts.push(toast);
    this.notifyListeners();
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      this.removeToast(toast.id);
    }, 3000);
  }

  public removeToast(id: string): void {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notifyListeners();
  }
  
  public subscribe(listener: (toasts: Toast[]) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }
  
  public getToasts(): Toast[] {
    return [...this.toasts];
  }
}

export default ToastService;