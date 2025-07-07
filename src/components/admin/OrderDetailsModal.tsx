import React, { useEffect, useRef, useState } from "react";
import {
  X,
  Printer,
  MapPin,
  Package,
  CreditCard,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  Truck,
  Tag,
  Weight,
} from "lucide-react";
import { Order } from "../../types";
import { Link } from "react-router-dom";
import LocationMarker from "../location/LocationMarker";
import SuggestedVehicleCard from "../SuggestedVehicleCard";

interface OrderDetailsModalProps {
  isOpen: boolean;
  onChangePaymentStatus: (order_id: string, status: string) => void;
  onClose: () => void;
  order: Order | null;
}

export type payment_status_type = "pending" | "partial" | "completed";

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOpen,
  onChangePaymentStatus,
  onClose,
  order,
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [fetchVehicleLoading, setFetchVehicleLoading] =
    useState<boolean>(false);
  const [suggestedVehicle, setSuggestedVehicle] = useState(null);

  const totalWeight = order?.order_items?.reduce((total, item) => {
    const weight = parseInt(item.products?.weight.replace("kg", "")) || 0;
    return total + item.quantity * weight;
  }, 0);

  useEffect(() => {
    const fetchSuggestedVehicle = async () => {
      if (!isOpen || !order) return null;

      setFetchVehicleLoading(true);

      const totalWeight = order.order_items?.reduce((total, item) => {
        const weight = parseInt(item.products?.weight.replace("kg", "")) || 0;
        return total + item.quantity * weight;
      }, 0);

      const queryParams = new URLSearchParams({
        to_address_lat: order.delivery_address.coordinates?.lat,
        to_address_long: order.delivery_address.coordinates?.lng,
        weight: totalWeight.toString(),
      });

      const url = `${
        import.meta.env.VITE_PORTER_SERVER_URL
      }/fare-estimate?${queryParams}`;

      try {
        const result = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        });

        if (result.ok) {
          const data = await result.json();
          setSuggestedVehicle(data.vehicle_name ? data : null);
        } else {
          setSuggestedVehicle(null);
        }
      } catch (error) {
        console.error("Error fetching fare estimate:", error);
        setSuggestedVehicle(null);
      } finally {
        setFetchVehicleLoading(false);
      }
    };

    fetchSuggestedVehicle();
  }, [order, isOpen]);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order #${order.id}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
              background: white;
            }
            
            .print-container {
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            
            .header {
              text-align: center;
              border-bottom: 2px solid #f97316;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            
            .company-name {
              font-size: 28px;
              font-weight: bold;
              color: #f97316;
              margin-bottom: 5px;
            }
            
            .company-tagline {
              font-size: 14px;
              color: #666;
              margin-bottom: 10px;
            }
            
            .company-contact {
              font-size: 12px;
              color: #888;
            }
            
            .order-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 30px;
              padding: 15px;
              background: #f8f9fa;
              border-radius: 8px;
            }
            
            .order-title {
              font-size: 24px;
              font-weight: bold;
              color: #333;
            }
            
            .order-date {
              font-size: 14px;
              color: #666;
            }
            
            .order-amount {
              font-size: 24px;
              font-weight: bold;
              color: #f97316;
            }
            
            .section {
              margin-bottom: 25px;
            }
            
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #333;
              margin-bottom: 15px;
              padding-bottom: 5px;
              border-bottom: 1px solid #e5e7eb;
            }
            
            .info-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 20px;
              margin-bottom: 20px;
            }
            
            .info-item {
              padding: 15px;
              background: #f8f9fa;
              border-radius: 8px;
            }
            
            .info-label {
              font-weight: bold;
              color: #666;
              font-size: 12px;
              text-transform: uppercase;
              margin-bottom: 5px;
            }
            
            .info-value {
              color: #333;
              font-size: 14px;
            }
            
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
            }
            
            .status-pending {
              background: #fef3c7;
              color: #92400e;
            }
            
            .status-prepaid,
            .status-fully_paid {
              background: #dbeafe;
              color: #1e40af;
            }
            
            .status-dispatched {
              background: #e9d5ff;
              color: #7c3aed;
            }
            
            .status-delivered {
              background: #d1fae5;
              color: #065f46;
            }
            
            .status-cancelled {
              background: #fee2e2;
              color: #dc2626;
            }
            
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            
            .items-table th,
            .items-table td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #e5e7eb;
            }
            
            .items-table th {
              background: #f8f9fa;
              font-weight: bold;
              color: #374151;
              font-size: 12px;
              text-transform: uppercase;
            }
            
            .items-table td {
              font-size: 14px;
            }
            
            .total-section {
              margin-top: 20px;
              padding: 20px;
              background: #f8f9fa;
              border-radius: 8px;
            }
            
            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
            }
            
            .total-row.final {
              font-size: 18px;
              font-weight: bold;
              color: #f97316;
              border-top: 2px solid #e5e7eb;
              padding-top: 10px;
              margin-top: 10px;
            }
            
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            
            .address-block {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 8px;
              margin-top: 10px;
            }
            
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              .print-container {
                padding: 0;
                max-width: none;
              }
              
              .section {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "status-pending";
      case "prepaid":
      case "fully_paid":
        return "status-prepaid";
      case "dispatched":
        return "status-dispatched";
      case "delivered":
        return "status-delivered";
      case "cancelled":
        return "status-cancelled";
      default:
        return "status-pending";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Payment Pending";
      case "prepaid":
        return "Partially Paid";
      case "fully_paid":
        return "Fully Paid";
      case "dispatched":
        return "Dispatched";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateSubtotal = () => {
    return (
      order.subtotal_amount ||
      order.order_items?.reduce(
        (sum, item) => sum + item.price_per_bag * item.quantity,
        0
      ) ||
      0
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-amber-500 text-white">
          <div>
            <h2 className="text-2xl font-bold">Order Details</h2>
            <p className="opacity-90">Order #{order.id}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              <Printer size={18} />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
          <div ref={printRef} className="print-container">
            {/* Print Header (only visible in print) */}
            <div className="header" style={{ display: "none" }}>
              <div className="company-name">Sri Vijaya Lakshmi Agency</div>
              <div className="company-tagline">
                Premium Rice Delivery Service
              </div>
              <div className="company-contact">
                📍 New Hafeezpet, Marthanda Nagar, Hyderabad, Telangana - 500049
                <br />
                📞 +91 9550607240 | 📧 contact@svlrice.in
              </div>
            </div>

            <div className="p-6">
              {/* Order Header */}
              <div className="order-header bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="order-title text-2xl font-bold text-gray-800 mb-2">
                      Order #{order.id}
                    </h3>
                    <p className="order-date text-gray-600">
                      Placed on {formatDate(order.created_at)}
                    </p>
                    {order.scheduled_delivery && (
                      <p className="text-gray-600 mt-1">
                        <Clock size={16} className="inline mr-1" />
                        Scheduled: {formatDate(order.scheduled_delivery)}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="order-amount text-3xl font-bold text-orange-500 mb-2">
                      ₹{order.total_amount.toLocaleString()}
                    </div>
                    <span
                      className={`status-badge ${getStatusBadgeClass(
                        order.payment_status
                      )}`}
                    >
                      {getStatusText(order.payment_status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Information Grid */}
              <div className="section">
                <h4 className="section-title">Order Information</h4>
                <div className="info-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="info-item bg-gray-50 p-4 rounded-lg">
                    <div className="info-label text-xs font-semibold text-gray-500 uppercase mb-1">
                      Order Type
                    </div>
                    <div className="info-value flex items-center">
                      <Package size={16} className="mr-2 text-orange-500" />
                      <span className="capitalize">{order.order_type}</span>
                    </div>
                  </div>

                  <div className="info-item bg-gray-50 p-4 rounded-lg">
                    <div className="info-label text-xs font-semibold text-gray-500 uppercase mb-1">
                      Payment Status
                    </div>
                    <div className="info-value flex items-center">
                      <CreditCard size={16} className="mr-2 text-blue-500" />
                      <select
                        value={order.payment_status}
                        onChange={(e) => {
                          onChangePaymentStatus(order.id, e.target.value);
                        }}
                        className="text-sm border border-gray-300 rounded px-2 py-1 min-w-[120px]"
                      >
                        <option value="pending">Pending</option>
                        <option value="partial">Partial</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  <div className="info-item bg-gray-50 p-4 rounded-lg">
                    <div className="info-label text-xs font-semibold text-gray-500 uppercase mb-1">
                      Customer Type
                    </div>
                    <div className="info-value flex items-center">
                      <User size={16} className="mr-2 text-green-500" />
                      <span>
                        {order.user_id ? "Registered User" : "Guest Customer"}
                      </span>
                    </div>
                  </div>

                  <div className="info-item bg-gray-50 p-4 rounded-lg">
                    <div className="info-label text-xs font-semibold text-gray-500 uppercase mb-1">
                      Items Count
                    </div>
                    <div className="info-value flex items-center">
                      <Package size={16} className="mr-2 text-purple-500" />
                      <span>{order.order_items?.length || 0} items</span>
                    </div>
                  </div>
                </div>

                {order.gst_number && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center">
                      <FileText size={16} className="mr-2 text-blue-500" />
                      <span className="font-semibold text-blue-800">
                        GST Number:{" "}
                      </span>
                      <span className="text-blue-700 ml-1">
                        {order.gst_number}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Coupon Information */}
              {order.coupon_code && (
                <div className="section">
                  <h4 className="section-title">Coupon Applied</h4>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Tag size={16} className="text-green-600" />
                        <span className="font-semibold text-green-800">
                          Coupon Code: {order.coupon_code}
                        </span>
                      </div>
                      <span className="font-bold text-green-800">
                        -₹{order.coupon_discount}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Transportation Information */}
              {order.transportation_required && (
                <div className="section">
                  <h4 className="section-title">Transportation</h4>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center">
                      <Truck size={16} className="mr-2 text-yellow-600" />
                      <span className="font-semibold text-yellow-800">
                        Transportation Required
                      </span>
                      {order.transportation_amount && (
                        <span className="ml-auto font-bold text-yellow-800">
                          ₹{order.transportation_amount}
                        </span>
                      )}
                    </div>
                    <p className="text-yellow-700 text-sm mt-1">
                      Additional transportation assistance requested
                    </p>
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="section">
                <h4 className="section-title">Order Items</h4>
                <div className="overflow-x-auto">
                  <table className="items-table w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left p-3 font-semibold text-gray-700">
                          Product
                        </th>
                        <th className="text-left p-3 font-semibold text-gray-700">
                          Weight
                        </th>
                        <th className="text-left p-3 font-semibold text-gray-700">
                          Slab
                        </th>
                        <th className="text-center p-3 font-semibold text-gray-700">
                          Quantity
                        </th>
                        <th className="text-right p-3 font-semibold text-gray-700">
                          Price/Bag
                        </th>
                        <th className="text-right p-3 font-semibold text-gray-700">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.order_items?.map((item) => (
                        <tr key={item.id} className="border-b border-gray-200">
                          <td className="p-3">
                            <div className="flex items-center space-x-3">
                              {item.products?.image && (
                                <img
                                  src={item.products.image}
                                  alt={item.products.name}
                                  className="w-12 h-12 object-cover rounded-lg"
                                />
                              )}
                              <div>
                                <div className="font-semibold text-gray-800">
                                  {item.products?.name}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {item.products?.category}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-gray-600">
                            {item.products?.weight}
                          </td>
                          <td className="p-3">
                            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                              {item.slab_label}
                            </span>
                          </td>
                          <td className="p-3 text-center font-semibold">
                            {item.quantity}
                          </td>
                          <td className="p-3 text-right font-semibold">
                            ₹{item.price_per_bag.toLocaleString()}
                          </td>
                          <td className="p-3 text-right font-bold text-orange-600">
                            ₹
                            {(
                              item.price_per_bag * item.quantity
                            ).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Order Total */}
                <div className="total-section bg-gray-50 rounded-lg p-4 sm:p-6 mt-6">
                  <div className="space-y-4 text-sm sm:text-base">
                    <div className="total-row flex flex-col sm:flex-row justify-between gap-1">
                      <span className="text-gray-600">Total Weight:</span>
                      <span className="font-semibold">{totalWeight} Kg</span>
                    </div>

                    <div className="total-row flex flex-col sm:flex-row justify-between gap-1">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-semibold">
                        ₹{calculateSubtotal().toLocaleString()}
                      </span>
                    </div>

                    {order.coupon_code &&
                      order.coupon_discount &&
                      order.coupon_discount > 0 && (
                        <div className="total-row flex flex-col sm:flex-row justify-between text-green-600 gap-1">
                          <span>Coupon Discount ({order.coupon_code}):</span>
                          <span className="font-semibold">
                            -₹{order.coupon_discount.toLocaleString()}
                          </span>
                        </div>
                      )}

                    {order.transportation_required &&
                      order.transportation_amount && (
                        <div className="total-row flex flex-col sm:flex-row justify-between gap-1">
                          <span className="text-gray-600">Transportation:</span>
                          <span className="font-semibold">
                            ₹{order.transportation_amount?.toLocaleString()}
                          </span>
                        </div>
                      )}

                    <div className="total-row final flex flex-col sm:flex-row justify-between border-t-2 border-gray-300 pt-3 gap-1">
                      <span className="text-lg font-bold">Total Amount:</span>
                      <span className="text-2xl font-bold text-orange-600">
                        ₹{order.total_amount.toLocaleString()}
                      </span>
                    </div>

                    {order.order_type === "preorder" &&
                      order.payment_status === "partial" && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2 text-sm">
                          <div className="flex flex-col sm:flex-row justify-between">
                            <span>Amount Paid:</span>
                            <span className="font-semibold">
                              ₹
                              {Math.ceil(
                                order.total_amount / 2
                              ).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex flex-col sm:flex-row justify-between">
                            <span>Remaining:</span>
                            <span className="font-semibold">
                              ₹
                              {Math.floor(
                                order.total_amount / 2
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="section">
                <h4 className="section-title flex items-center">
                  <MapPin size={18} className="mr-2 text-orange-500" />
                  Delivery Address
                </h4>
                <a
                  href={`geo:${order.delivery_address.coordinates?.lat},${order.delivery_address.coordinates?.lng}?q=${order.delivery_address.coordinates?.lat},${order.delivery_address.coordinates?.lng}(Drop)`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary-500 rounded-lg flex items-center text-white px-3 py-2 justify-center overflow-hidden hover:bg-primary-600 "
                >
                  Book Porter
                </a>
                <LocationMarker
                  coordinates={order.delivery_address.coordinates}
                />
                <div className="address-block bg-gray-50 rounded-lg p-4">
                  <div className="text-gray-800">
                    <p className="font-semibold mb-2">
                      {order.delivery_address.fullAddress}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">
                          Pincode:{" "}
                        </span>
                        <span>{order.delivery_address.pincode}</span>
                      </div>
                      {order.delivery_address.landmark && (
                        <div>
                          <span className="font-medium text-gray-600">
                            Landmark:{" "}
                          </span>
                          <span>{order.delivery_address.landmark}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <SuggestedVehicleCard
                vehicle={suggestedVehicle}
                loading={fetchVehicleLoading}
              />

              {/* Payment Information */}
              <div className="section">
                <h4 className="section-title">Payment Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="info-item bg-gray-50 p-4 rounded-lg">
                    <div className="info-label text-xs font-semibold text-gray-500 uppercase mb-1">
                      Payment Id
                    </div>
                    <Link
                      to={`https://business.phonepe.com/transactions/details/${order.transaction?.transaction_utr}`}
                      target="_blank"
                      className="info-value font-mono text-sm break-all text-blue-500 hover:text-blue-600 hover:underline"
                    >
                      {order.transaction?.transaction_utr}
                    </Link>
                  </div>
                  <div className="info-item bg-gray-50 p-4 rounded-lg">
                    <div className="info-label text-xs font-semibold text-gray-500 uppercase mb-1">
                      Amount
                    </div>
                    <div className="info-value">
                      <div className="info-value font-mono text-sm break-all">
                        ₹ {order.transaction?.amount}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="section mb-10">
                <h4 className="section-title">Timeline</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="info-item bg-gray-50 p-4 rounded-lg">
                    <div className="info-label text-xs font-semibold text-gray-500 uppercase mb-1">
                      Order At
                    </div>
                    <div className="info-value">
                      {formatDate(order.created_at)}
                    </div>
                  </div>
                  <div className="info-item bg-gray-50 p-4 rounded-lg">
                    <div className="info-label text-xs font-semibold text-gray-500 uppercase mb-1">
                      Payment At
                    </div>
                    <div className="info-value">
                      {formatDate(order.transaction?.processed_at)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Print Footer (only visible in print) */}
            <div className="footer" style={{ display: "none" }}>
              <p>Thank you for choosing Sri Vijaya Lakshmi Agency!</p>
              <p>
                For support, contact us at +91 9550607240 or contact@svlrice.in
              </p>
              <p style={{ marginTop: "10px", fontSize: "10px" }}>
                This is a computer-generated document. No signature required.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media print {
          .header,
          .footer {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderDetailsModal;
