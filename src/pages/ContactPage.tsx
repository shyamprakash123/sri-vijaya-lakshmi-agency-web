import React, { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageCircle,
  Star,
} from "lucide-react";
import toast from "react-hot-toast";

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const imageUrl = `https://api.olamaps.io/tiles/v1/styles/default-light-standard/static/78.356371,17.475702,15/800x600.png?marker=78.356371,17.475702|red|scale:1&api_key=${
    import.meta.env.VITE_OLA_MAPS_API_KEY || "demo-key"
  }`;

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbxkntsbfuQacGwg5gldtDI41YxWhCi_wPRbNCpKmTUI7gee6Uxh0-X9jJxEhzLfYanI2w/exec",
        {
          method: "POST",
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            subject: formData.subject,
            message: formData.message,
          }),
        }
      );

      // Can't read response due to no-cors, assume success
      setSubmitted(true);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      toast.success("Message sent successfully");
      setSubmitted(false);
      setLoading(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      details: ["+91 9550607240", "+91 8374237713"],
      action: "tel:+919550607240",
    },
    {
      icon: Mail,
      title: "Email",
      details: ["contact@svlrice.in"],
      action: "mailto:contact@svlrice.in",
    },
    {
      icon: MapPin,
      title: "Address",
      details: [
        "New Hafeezpet, Marthanda Nagar, Hyderabad, Telangana - 500049",
      ],
      action: "https://maps.google.com",
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: ["Mon - Sat: 6:00 AM - 10:00 PM", "Sunday: 7:00 AM - 9:00 PM"],
      action: null,
    },
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      rating: 5,
      comment:
        "Excellent quality rice and super fast delivery! The customer service is outstanding.",
      location: "T. Nagar, Chennai",
    },
    {
      name: "Rajesh Kumar",
      rating: 5,
      comment:
        "Been ordering from them for 2 years. Always fresh stock and reliable service.",
      location: "Adyar, Chennai",
    },
    {
      name: "Meera Patel",
      rating: 5,
      comment:
        "The pre-order system is fantastic. Great discounts and perfect timing.",
      location: "Velachery, Chennai",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 to-amber-500 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Get in Touch
            </h1>
            <p className="text-xl opacity-90 mb-8">
              We're here to help with all your rice delivery needs. Reach out to
              us anytime!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <a
                href="https://wa.me/+919550607240"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-semibold transition-colors transform hover:scale-105"
              >
                <MessageCircle size={20} />
                <span>WhatsApp Us</span>
              </a>
              <a
                href="tel:+919550607240"
                className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-full font-semibold transition-colors"
              >
                <Phone size={20} />
                <span>Call Now</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {contactInfo.map((info, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow text-center group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <info.icon size={32} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  {info.title}
                </h3>
                <div className="space-y-1">
                  {info.details.map((detail, idx) => (
                    <p key={idx} className="text-gray-600 text-sm">
                      {info.action && idx === 0 ? (
                        <a
                          href={info.action}
                          target={
                            info.action.startsWith("http")
                              ? "_blank"
                              : undefined
                          }
                          rel={
                            info.action.startsWith("http")
                              ? "noopener noreferrer"
                              : undefined
                          }
                          className="hover:text-orange-500 transition-colors"
                        >
                          {detail}
                        </a>
                      ) : (
                        detail
                      )}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Send us a Message
              </h2>
              <p className="text-gray-600 mb-8">
                Have a question or special request? Fill out the form below and
                we'll get back to you within 24 hours.
              </p>

              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send size={32} className="text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-800 mb-2">
                    Message Sent!
                  </h3>
                  <p className="text-green-600">
                    Thank you for contacting us. We'll get back to you soon!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="+91 9550607240"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject *
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">Select a subject</option>
                        <option value="general">General Inquiry</option>
                        <option value="order">Order Support</option>
                        <option value="bulk">Bulk Orders</option>
                        <option value="complaint">Complaint</option>
                        <option value="feedback">Feedback</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 px-6 rounded-lg font-semibold transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Map & Additional Info */}
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Visit Our Store
              </h2>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${
                  import.meta.env.VITE_STORE_LAT
                },${import.meta.env.VITE_STORE_LNG}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary-500 rounded-lg flex items-center text-white px-3 py-2 justify-center overflow-hidden hover:bg-primary-600 "
              >
                Get Directions
              </a>
              {/* Map Placeholder - Replace with actual map integration */}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${
                  import.meta.env.VITE_STORE_LAT
                },${import.meta.env.VITE_STORE_LNG}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-200 rounded-lg h-64 flex items-center justify-center mb-4 overflow-hidden"
              >
                <img
                  src={imageUrl}
                  alt="Static Map"
                  className="object-cover w-full h-full "
                />
              </a>
              <div className="text-center">
                <MapPin size={48} className="text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 font-medium">
                  Sri Vijaya Lakshmi Agency
                </p>
                <p className="text-sm text-gray-400">
                  123 Rice Market Street, Chennai
                </p>
                <p className="text-sm text-gray-400">Tamil Nadu 600001</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mt-6">
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-semibold text-orange-800 mb-2">
                    Store Hours
                  </h4>
                  <p className="text-sm text-orange-700">
                    Mon - Sat: 6:00 AM - 10:00 PM
                  </p>
                  <p className="text-sm text-orange-700">
                    Sunday: 7:00 AM - 9:00 PM
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Contact</h4>
                  <p className="text-sm text-blue-700">📞 +91 9550607240</p>
                  <p className="text-sm text-blue-700">📧 contact@svlrice.in</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">
                    Facilities
                  </h4>
                  <p className="text-sm text-green-700">💳 Card Payments</p>
                </div>
              </div>

              {/* Store Info */}
              <div className="bg-orange-50 rounded-lg p-6 mb-6 mt-6">
                <h3 className="text-lg font-semibold text-orange-800 mb-3">
                  Store Information
                </h3>
                <div className="space-y-2 text-orange-700">
                  <p>🏪 Physical store available for walk-in customers</p>
                  <p>💳 Cash and digital payments accepted</p>
                  <p>📦 Bulk orders welcome</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <a
                  href="https://wa.me/+919550607240?text=Hi! I need help with my order."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <MessageCircle size={20} />
                  <span>Chat on WhatsApp</span>
                </a>
                <a
                  href="tel:+919550607240"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <Phone size={20} />
                  <span>Call Now</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {/* <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-gray-600">
              Don't just take our word for it - hear from our satisfied
              customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "{testimonial.comment}"
                </p>
                <div>
                  <p className="font-semibold text-gray-800">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {testimonial.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}
    </div>
  );
};

export default ContactPage;
