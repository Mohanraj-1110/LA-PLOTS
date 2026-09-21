import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { plotService } from '../services/plotService';
import { customerService } from '../services/customerService';
import { appointmentService } from '../services/appointmentService';
import { salesService } from '../services/salesService';

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  const [plots, setPlots] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshAll = useCallback(async () => {
    try {
      const [p, c, a, s] = await Promise.all([
        plotService.getAllPlots(),
        customerService.getAllCustomers(),
        appointmentService.getAllAppointments(),
        salesService.getAllSales(),
      ]);
      setPlots(p);
      setCustomers(c);
      setAppointments(a);
      setSales(s);
    } catch (err) {
      console.error('Failed to load initial app state:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Plots CRUD
  const addPlot = useCallback(async (data) => {
    const newPlot = await plotService.createPlot(data);
    setPlots((prev) => [newPlot, ...prev]);
    return newPlot;
  }, []);

  const editPlot = useCallback(async (id, updates) => {
    const updated = await plotService.updatePlot(id, updates);
    setPlots((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  }, []);

  const changePlotStatus = useCallback(async (id, newStatus) => {
    const updated = await plotService.updatePlotStatus(id, newStatus);
    setPlots((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  }, []);

  const removePlot = useCallback(async (id) => {
    await plotService.deletePlot(id);
    setPlots((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // Customers CRUD
  const addCustomer = useCallback(async (data) => {
    const newCust = await customerService.createCustomer(data);
    setCustomers((prev) => [newCust, ...prev]);
    return newCust;
  }, []);

  const editCustomer = useCallback(async (id, updates) => {
    const updated = await customerService.updateCustomer(id, updates);
    setCustomers((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  }, []);

  const changeCustomerStatus = useCallback(async (id, newStatus) => {
    const updated = await customerService.updateCustomerStatus(id, newStatus);
    setCustomers((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  }, []);

  const removeCustomer = useCallback(async (id) => {
    await customerService.deleteCustomer(id);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // Appointments CRUD
  const addAppointment = useCallback(async (data) => {
    const newAppt = await appointmentService.createAppointment(data);
    setAppointments((prev) => [newAppt, ...prev]);
    return newAppt;
  }, []);

  const editAppointment = useCallback(async (id, updates) => {
    const updated = await appointmentService.updateAppointment(id, updates);
    setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
    return updated;
  }, []);

  const changeAppointmentStatus = useCallback(async (id, newStatus) => {
    const updated = await appointmentService.updateAppointmentStatus(id, newStatus);
    setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
    return updated;
  }, []);

  const removeAppointment = useCallback(async (id) => {
    await appointmentService.deleteAppointment(id);
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  // Sales
  const addSale = useCallback(async (data) => {
    const newSale = await salesService.createSale(data);
    setSales((prev) => [newSale, ...prev]);
    // Also mark the plot as sold if plotId is given
    if (data.plotId) {
      await plotService.updatePlotStatus(data.plotId, 'sold');
      setPlots((prev) =>
        prev.map((p) => (p.id === data.plotId ? { ...p, status: 'sold' } : p))
      );
    }
    return newSale;
  }, []);

  // BUG-12 FIX: AppStateContext was missing editSale and removeSale, forcing
  // consumers to call salesService directly and leaving shared state stale.
  const editSale = useCallback(async (id, updates) => {
    // salesService does not expose an updateSale yet; call the API directly
    // and update local state optimistically.
    const { api } = await import('../services/api.js');
    const updated = await api.put(`/sales/${id}`, updates);
    setSales((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
    return updated;
  }, []);

  const removeSale = useCallback(async (id) => {
    const { api } = await import('../services/api.js');
    await api.delete(`/sales/${id}`);
    setSales((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const value = {
    plots,
    customers,
    appointments,
    sales,
    loading,
    refreshAll,
    addPlot,
    editPlot,
    changePlotStatus,
    removePlot,
    addCustomer,
    editCustomer,
    changeCustomerStatus,
    removeCustomer,
    addAppointment,
    editAppointment,
    changeAppointmentStatus,
    removeAppointment,
    addSale,
    editSale,
    removeSale,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

AppStateProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}
