import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { CreditCard, Wallet, Building } from 'lucide-react';

interface PaymentFormProps {
  amount: number;
  certificationType: string;
  paymentType: string;
  moduleId?: string;
  onPaymentSuccess: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  certificationType,
  paymentType,
  moduleId,
  onPaymentSuccess
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard },
    { id: 'wallet', name: 'Digital Wallet', icon: Wallet },
    { id: 'bank', name: 'Bank Transfer', icon: Building }
  ];

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess();
    }, 2000);
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Payment Details</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p><span className="font-medium">Certification:</span> {certificationType}</p>
          <p><span className="font-medium">Type:</span> {paymentType}</p>
          {moduleId && <p><span className="font-medium">Module:</span> {moduleId}</p>}
          <p className="text-lg font-bold text-green-600">Amount: ${amount}</p>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-md font-medium mb-3">Select Payment Method</h4>
        <div className="space-y-2">
          {paymentMethods.map((method) => {
            const IconComponent = method.icon;
            return (
              <label
                key={method.id}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedMethod === method.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={selectedMethod === method.id}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="sr-only"
                />
                <IconComponent className="w-5 h-5 mr-3 text-gray-600" />
                <span className="text-sm font-medium">{method.name}</span>
              </label>
            );
          })}
        </div>
      </div>

      <Button
        onClick={handlePayment}
        disabled={isProcessing}
        className="w-full"
      >
        {isProcessing ? 'Processing Payment...' : `Pay $${amount}`}
      </Button>
    </Card>
  );
};