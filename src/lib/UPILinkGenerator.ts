interface UpiLinkOptions {
    payeeVPA: string;             // e.g., 'merchant@upi'
    payeeName: string;            // e.g., 'Rice Agency'
    amount: number | string;      // e.g., 500.00
    transactionNote?: string;     // Optional note to include
    currency?: string;          
  }
  
  export function generateUpiLink({
    payeeVPA,
    payeeName,
    amount,
    transactionNote = '',
    currency = 'INR'
  }: UpiLinkOptions): string {
    const params = new URLSearchParams({
      pa: payeeVPA,
      pn: payeeName,
      am: amount.toString(),
      cu: currency,
      mc: "0000",
      mode: "02",
      purpose: "00"
    });
  
    if (transactionNote) params.append('tn', transactionNote);
  
    return `upi://pay?${params.toString()}`;
  }
  