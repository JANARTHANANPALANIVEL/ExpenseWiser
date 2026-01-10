import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, parseISO, subMonths } from 'date-fns';
import { Pencil, Wallet, Smartphone, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Loader, FullPageLoader } from '@/components/ui/Loader';
import { useWallet } from '@/contexts/WalletContext';
import { exportToCSV, exportToPDF } from '@/lib/export';
import { SpendRecord } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const SpendPage = () => {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [isExporting, setIsExporting] = useState(false);
  const { spendRecords, loading } = useWallet();

  const filteredRecords = useMemo(() => {
    return spendRecords
      .filter((record) => record.date.startsWith(selectedMonth))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [spendRecords, selectedMonth]);

  const monthOptions = useMemo(() => {
    const options = [];
    for (let i = 0; i < 12; i++) {
      const date = subMonths(new Date(), i);
      options.push({
        value: format(date, 'yyyy-MM'),
        label: format(date, 'MMM yyyy'),
      });
    }
    return options;
  }, []);

  const handleEdit = (record: SpendRecord) => {
    navigate(`/edit-spend/${record.id}`);
  };

  const handleExportCSV = async () => {
    if (filteredRecords.length === 0) {
      toast.error('No records to export');
      return;
    }
    setIsExporting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      exportToCSV(filteredRecords, selectedMonth);
      toast.success('CSV exported!');
    } catch (error) {
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (filteredRecords.length === 0) {
      toast.error('No records to export');
      return;
    }
    setIsExporting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      exportToPDF(filteredRecords, selectedMonth);
      toast.success('PDF exported!');
    } catch (error) {
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return <FullPageLoader />;
  }

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-3"
        >
          <div>
            <h1 className="text-xl font-semibold text-foreground">Spending</h1>
            <p className="text-xs text-muted-foreground">View expenses</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-28 h-9 text-sm">
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={isExporting || filteredRecords.length === 0}
                  className="h-9 w-9"
                >
                  {isExporting ? <Loader size="sm" /> : <Download className="w-4 h-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportCSV}>
                  <FileSpreadsheet className="w-4 h-4 mr-2 text-success" />
                  CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPDF}>
                  <FileText className="w-4 h-4 mr-2 text-destructive" />
                  PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>

        {/* Summary */}
        {filteredRecords.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl p-4 shadow-card border border-border/50 flex items-center justify-between"
          >
            <span className="text-sm text-muted-foreground">
              {filteredRecords.length} expense{filteredRecords.length > 1 ? 's' : ''}
            </span>
            <span className="text-lg font-semibold text-destructive">
              -₹{filteredRecords.reduce((sum, r) => sum + r.amount, 0).toLocaleString('en-IN')}
            </span>
          </motion.div>
        )}

        {/* Records List */}
        <div className="space-y-2">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record, index) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="bg-card rounded-xl p-4 shadow-card border border-border/50 flex items-center gap-3"
              >
                <div className={`p-2 rounded-lg ${record.method === 'hand' ? 'bg-hand/15' : 'bg-gpay/15'}`}>
                  {record.method === 'hand' ? (
                    <Wallet className="w-4 h-4 text-hand" />
                  ) : (
                    <Smartphone className="w-4 h-4 text-gpay" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{record.purpose}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(record.date), 'MMM dd')} • {record.method === 'gpay' ? 'GPay' : 'Hand'}
                  </p>
                </div>
                <div className="text-right flex items-center gap-2">
                  <span className="text-destructive font-semibold">
                    -₹{record.amount.toLocaleString('en-IN')}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(record)}
                    className="h-8 w-8"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-muted-foreground text-sm mb-4">No expenses this month</p>
              <Button onClick={() => navigate('/add-spend')}>Add Expense</Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SpendPage;
