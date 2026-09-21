import { plotService } from './plotService';
import { customerService } from './customerService';
import { appointmentService } from './appointmentService';
import { salesService } from './salesService';
import { enquiryService } from './enquiryService';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';

export const reportService = {
  async getSummaryMetrics() {
    const [plots, customers, appointments, sales, enquiries] = await Promise.all([
      plotService.getAllPlots(),
      customerService.getAllCustomers(),
      appointmentService.getAllAppointments(),
      salesService.getAllSales(),
      enquiryService.getAllEnquiries(),
    ]);

    const totalPlots = plots.length;
    const availablePlots = plots.filter((p) => p.status === 'available').length;
    const reservedPlots = plots.filter((p) => p.status === 'reserved').length;
    const soldPlots = plots.filter((p) => p.status === 'sold').length;
    const blockedPlots = plots.filter((p) => p.status === 'blocked').length;

    // BUG-05 FIX: Sales objects use `cost` and `profit` (not `costAmount`/`netProfit`)
    const totalSalesRevenue = sales.reduce((acc, s) => acc + (s.saleAmount || 0), 0);
    const totalCost = sales.reduce((acc, s) => acc + (s.cost || 0), 0);
    const totalNetProfit = sales.reduce((acc, s) => acc + (s.profit || 0), 0);
    const avgProfitMargin =
      totalSalesRevenue > 0 ? ((totalNetProfit / totalSalesRevenue) * 100).toFixed(1) : 0;

    const activeCustomers = customers.filter(
      (c) => c.status !== 'Converted' && c.status !== 'Lost'
    ).length;
    const convertedCustomers = customers.filter((c) => c.status === 'Converted').length;

    // BUG-06 FIX: Appointments are created with status 'scheduled' (lowercase),
    // not 'Upcoming' (Title Case), so the filter was always returning 0.
    const upcomingAppts = appointments.filter(
      (a) => a.status?.toLowerCase() === 'scheduled'
    ).length;

    return {
      totalPlots,
      availablePlots,
      reservedPlots,
      soldPlots,
      blockedPlots,
      totalSalesRevenue,
      totalCost,
      totalNetProfit,
      avgProfitMargin,
      totalCustomers: customers.length,
      activeCustomers,
      convertedCustomers,
      totalAppointments: appointments.length,
      upcomingAppts,
      totalEnquiries: enquiries.length,
    };
  },

  /**
   * Export CSV helper
   */
  exportToCsv(filename, rows) {
    if (!rows || !rows.length) return false;
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      rows
        .map((row) =>
          keys
            .map((k) => {
              let cell = row[k] === null || row[k] === undefined ? '' : row[k];
              // BUG-14 FIX: serialize arrays and objects to JSON instead of
              // using .toString() which produces "[object Object]" or
              // comma-joined array values that corrupt the CSV.
              if (cell instanceof Date) {
                cell = cell.toLocaleString();
              } else if (typeof cell === 'object' && cell !== null) {
                cell = JSON.stringify(cell);
              } else {
                cell = String(cell);
              }
              cell = cell.replace(/"/g, '""');
              if (cell.search(/("|,|\n)/g) >= 0) {
                cell = `"${cell}"`;
              }
              return cell;
            })
            .join(separator)
        )
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  },

  /**
   * Export Real Excel (.xlsx) using xlsx library
   */
  exportToExcel(filename, rows) {
    if (!rows || !rows.length) return false;
    try {
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Report');
      XLSX.writeFile(wb, `${filename}.xlsx`);
      return true;
    } catch (err) {
      console.warn('XLSX export fallback to CSV:', err);
      return this.exportToCsv(filename, rows);
    }
  },

  /**
   * Export PDF using jsPDF
   */
  exportToPdf(title, rows, filename) {
    if (!rows || !rows.length) return false;
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(title || 'LK PROPERTIES Report', 14, 20);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 14, 28);

      let y = 38;
      const keys = Object.keys(rows[0]);
      doc.setFont('helvetica', 'bold');
      doc.text(keys.slice(0, 5).join(' | '), 14, y);
      y += 8;
      doc.setFont('helvetica', 'normal');

      rows.slice(0, 30).forEach((row) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        const line = keys.slice(0, 5).map((k) => String(row[k] || '')).join(' | ');
        doc.text(line.substring(0, 85), 14, y);
        y += 7;
      });

      doc.save(`${filename || 'report'}.pdf`);
      return true;
    } catch (err) {
      console.error('jsPDF generation failed:', err);
      return false;
    }
  },

  /**
   * Trigger print window
   */
  triggerPrint() {
    window.print();
  },
};

export default reportService;
