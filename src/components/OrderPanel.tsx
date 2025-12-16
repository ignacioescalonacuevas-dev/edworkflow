import { useState } from 'react';
import { TestTube, Scan, Pill, Radio, Plus, Check, FileCheck, Activity, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Order, OrderStatus } from '@/types/patient';
import { EditableTimestamp } from './EditableTimestamp';
import { cn } from '@/lib/utils';

interface OrderPanelProps {
  orders: Order[];
  onAddOrder: (type: Order['type'], description: string) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onUpdateTimestamp: (orderId: string, field: 'orderedAt' | 'doneAt' | 'reportedAt', time: Date) => void;
}

const orderTypeConfig = {
  lab: { icon: TestTube, label: 'Laboratory', color: 'text-status-info' },
  xray: { icon: Radio, label: 'X-Ray', color: 'text-status-pending' },
  scanner: { icon: Scan, label: 'CT Scan', color: 'text-status-admission' },
  medication: { icon: Pill, label: 'Medication', color: 'text-status-complete' },
  ecg: { icon: Activity, label: 'ECG', color: 'text-red-400' },
  echo: { icon: Heart, label: 'ECHO', color: 'text-pink-400' },
};

const ECHO_TYPES = [
  'Cardiac (TTE)',
  'Abdominal',
  'Limbs/Vascular',
  'Carotid',
  'Renal',
  'Pelvic',
  'FAST',
] as const;

export function OrderPanel({ orders, onAddOrder, onUpdateStatus, onUpdateTimestamp }: OrderPanelProps) {
  const [newOrderType, setNewOrderType] = useState<Order['type'] | null>(null);
  const [newOrderDescription, setNewOrderDescription] = useState('');
  const [selectedEchoType, setSelectedEchoType] = useState<string>('');

  const handleAddOrder = () => {
    if (newOrderType) {
      let description = newOrderDescription.trim();
      
      // For ECHO, prepend the selected type
      if (newOrderType === 'echo' && selectedEchoType) {
        description = description ? `${selectedEchoType} - ${description}` : selectedEchoType;
      }
      
      if (description) {
        onAddOrder(newOrderType, description);
        setNewOrderType(null);
        setNewOrderDescription('');
        setSelectedEchoType('');
      }
    }
  };

  const canAddOrder = () => {
    if (newOrderType === 'echo') {
      return !!selectedEchoType;
    }
    return !!newOrderDescription.trim();
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'ordered':
        return <span className="px-2 py-0.5 text-xs rounded-full status-info">Ordered</span>;
      case 'done':
        return <span className="px-2 py-0.5 text-xs rounded-full status-pending">Done</span>;
      case 'reported':
        return <span className="px-2 py-0.5 text-xs rounded-full status-complete">Reported</span>;
    }
  };

  const getNextAction = (order: Order) => {
    switch (order.status) {
      case 'ordered':
        return (
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1 border-status-pending text-status-pending hover:bg-status-pending hover:text-status-pending-foreground"
            onClick={() => onUpdateStatus(order.id, 'done')}
          >
            <Check className="h-3 w-3" />
            Mark Done
          </Button>
        );
      case 'done':
        return (
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1 border-status-complete text-status-complete hover:bg-status-complete hover:text-status-complete-foreground"
            onClick={() => onUpdateStatus(order.id, 'reported')}
          >
            <FileCheck className="h-3 w-3" />
            Mark Reported
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Medical Plan</h3>
      </div>

      {/* Quick Add Buttons */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {(Object.keys(orderTypeConfig) as Order['type'][]).map((type) => {
          const config = orderTypeConfig[type];
          const Icon = config.icon;
          return (
            <Popover
              key={type}
              open={newOrderType === type}
              onOpenChange={(open) => {
                setNewOrderType(open ? type : null);
                if (!open) {
                  setNewOrderDescription('');
                  setSelectedEchoType('');
                }
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'h-16 flex-col gap-1 border-border hover:border-primary',
                    config.color
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{config.label}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-card border-border">
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Icon className={cn('h-4 w-4', config.color)} />
                    New {config.label} Order
                  </h4>
                  
                  {/* ECHO type selector */}
                  {type === 'echo' && (
                    <Select value={selectedEchoType} onValueChange={setSelectedEchoType}>
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue placeholder="Select ECHO type..." />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {ECHO_TYPES.map((echoType) => (
                          <SelectItem key={echoType} value={echoType}>
                            {echoType}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  
                  <Input
                    placeholder={type === 'echo' ? "Additional notes (optional)..." : "Order description..."}
                    value={newOrderDescription}
                    onChange={(e) => setNewOrderDescription(e.target.value)}
                    className="bg-input border-border"
                    autoFocus={type !== 'echo'}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleAddOrder} disabled={!canAddOrder()}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                    <Button variant="ghost" onClick={() => setNewOrderType(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          );
        })}
      </div>

      {/* Orders List */}
      <div className="space-y-2">
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No orders recorded
          </p>
        ) : (
          orders.map((order) => {
            const config = orderTypeConfig[order.type];
            const Icon = config.icon;
            return (
              <div
                key={order.id}
                className={cn(
                  'p-3 rounded-lg gradient-card border border-border',
                  order.status === 'done' && 'border-l-4 border-l-status-pending',
                  order.status === 'reported' && 'border-l-4 border-l-status-complete'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <Icon className={cn('h-5 w-5 mt-0.5', config.color)} />
                    <div>
                      <p className="font-medium">{order.description}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-1">
                        <EditableTimestamp
                          timestamp={order.orderedAt}
                          onEdit={(time) => onUpdateTimestamp(order.id, 'orderedAt', time)}
                          label="Ordered"
                        />
                        {order.doneAt && (
                          <EditableTimestamp
                            timestamp={order.doneAt}
                            onEdit={(time) => onUpdateTimestamp(order.id, 'doneAt', time)}
                            label="Done"
                          />
                        )}
                        {order.reportedAt && (
                          <EditableTimestamp
                            timestamp={order.reportedAt}
                            onEdit={(time) => onUpdateTimestamp(order.id, 'reportedAt', time)}
                            label="Reported"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(order.status)}
                    {getNextAction(order)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
