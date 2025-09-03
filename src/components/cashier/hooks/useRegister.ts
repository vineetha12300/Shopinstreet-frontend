import { useState } from 'react';
import { RegisterStatus, RegisterForm, RegisterOperation } from '../types/cashier.types';

export const useRegister = (vendorId: number) => {
  const [registerStatus, setRegisterStatus] = useState<RegisterStatus>({ 
    register_open: false, 
    session: null 
  });
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerOperation, setRegisterOperation] = useState<RegisterOperation>('open');
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    opening_float: 0,
    cashier_name: '',
    register_name: 'Main Register',
    opening_notes: '',
    closing_amount: 0,
    closing_notes: ''
  });
  const [isLoadingRegister, setIsLoadingRegister] = useState(false);

  const checkRegisterStatus = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/cashier/register-status/${vendorId}`);
      const data = await response.json();
      setRegisterStatus(data);
    } catch (error) {
      console.error('Error checking register status:', error);
    }
  };

  const openRegister = async () => {
    setIsLoadingRegister(true);
    try {
      const response = await fetch(`http://localhost:8000/api/cashier/register/open?vendor_id=${vendorId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opening_float: registerForm.opening_float,
          cashier_name: registerForm.cashier_name,
          register_name: registerForm.register_name,
          opening_notes: registerForm.opening_notes
        })
      });

      const result = await response.json();
      if (response.ok) {
        await checkRegisterStatus();
        setShowRegisterModal(false);
        setRegisterForm({ 
          ...registerForm, 
          opening_notes: '', 
          closing_notes: '' 
        });
        return { success: true };
      } else {
        return { success: false, error: result.detail };
      }
    } catch (error) {
      console.error('Error opening register:', error);
      return { success: false, error: 'Network error occurred' };
    } finally {
      setIsLoadingRegister(false);
    }
  };

  const closeRegister = async () => {
    setIsLoadingRegister(true);
    try {
      const response = await fetch(`http://localhost:8000/api/cashier/register/close?vendor_id=${vendorId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          closing_amount: registerForm.closing_amount,
          closing_notes: registerForm.closing_notes
        })
      });

      const result = await response.json();
      if (response.ok) {
        await checkRegisterStatus();
        setShowRegisterModal(false);
        return { success: true, summary: result.summary };
      } else {
        return { success: false, error: result.detail };
      }
    } catch (error) {
      console.error('Error closing register:', error);
      return { success: false, error: 'Network error occurred' };
    } finally {
      setIsLoadingRegister(false);
    }
  };

  const openCloseRegisterModal = () => {
    if (!registerStatus.session) return;
    
    setRegisterOperation('close');
    setRegisterForm({ 
      ...registerForm, 
      closing_amount: registerStatus.session.opening_float + registerStatus.session.total_cash_sales 
    });
    setShowRegisterModal(true);
  };

  const updateRegisterForm = (updates: Partial<RegisterForm>) => {
    setRegisterForm(prev => ({ ...prev, ...updates }));
  };

  return {
    registerStatus,
    showRegisterModal,
    registerOperation,
    registerForm,
    isLoadingRegister,
    setShowRegisterModal,
    setRegisterForm,
    updateRegisterForm, // NEW: Add this helper function
    checkRegisterStatus,
    openRegister,
    closeRegister,
    openCloseRegisterModal
  };
};