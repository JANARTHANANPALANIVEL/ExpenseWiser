import { useState, useMemo } from 'react';
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SpendRecord } from '@/lib/types';
import { exportToCSV, exportToPDF } from '@/lib/export';
import { toast } from 'sonner';

interface ExportDialogProps {
  spendRecords: SpendRecord[];
}

export const ExportDialog = ({ spendRecords }: ExportDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  // Generate month options for last 12 months
  const monthOptions = useMemo(() => {
    const options = [];
    for (let i = 0; i < 12; i++) {
      const date = subMonths(new Date(), i);
      options.push({
        value: format(date, 'yyyy-MM'),
        label: format(date, 'MMMM yyyy'),
      });
    }
    return options;
  }, []);

  // Filter records by selected month
  const filteredRecords = useMemo(() => {
    const [year, month] = selectedMonth.split('-');
    const monthStart = startOfMonth(new Date(parseInt(year), parseInt(month) - 1, 1));
    const monthEnd = endOfMonth(monthStart);

    return spendRecords.filter((record) => {
      const recordDate = parseISO(record.date);
      return recordDate >= monthStart && recordDate <= monthEnd;
    }).sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  }, [spendRecords, selectedMonth]);

  const monthLabel = useMemo(() => {
    const [year, month] = selectedMonth.split('-');
    return format(new Date(parseInt(year), parseInt(month) - 1, 1), 'MMMM-yyyy');
  }, [selectedMonth]);

  const handleExportCSV = () => {
    if (filteredRecords.length === 0) {
      toast.error('No records to export for selected month');
      return;
    }
    exportToCSV(filteredRecords, monthLabel);
    toast.success(`Exported ${filteredRecords.length} records as CSV`);
    setOpen(false);
  };

  const handleExportPDF = () => {
    if (filteredRecords.length === 0) {
      toast.error('No records to export for selected month');
      return;
    }
    exportToPDF(filteredRecords, monthLabel);
    toast.success(`Exported ${filteredRecords.length} records as PDF`);
    setOpen(false);
  };

  const totalAmount = filteredRecords.reduce((sum, r) => sum + r.amount, 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export Data
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Spending Records</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {/* Month Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Select Month</label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview Stats */}
          <motion.div
            key={selectedMonth}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-secondary/50 rounded-lg p-3 space-y-1"
          >
            <p className="text-sm text-muted-foreground">
              Records found: <span className="font-medium text-foreground">{filteredRecords.length}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Total amount: <span className="font-medium text-foreground">₹{totalAmount.toLocaleString('en-IN')}</span>
            </p>
          </motion.div>

          {/* Export Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="gap-2 h-12"
              onClick={handleExportCSV}
              disabled={filteredRecords.length === 0}
            >
              <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
              <div className="text-left">
                <p className="text-sm font-medium">CSV</p>
                <p className="text-[10px] text-muted-foreground">Spreadsheet</p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="gap-2 h-12"
              onClick={handleExportPDF}
              disabled={filteredRecords.length === 0}
            >
              <FileText className="w-5 h-5 text-red-500" />
              <div className="text-left">
                <p className="text-sm font-medium">PDF</p>
                <p className="text-[10px] text-muted-foreground">Document</p>
              </div>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
