import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useState } from "react";
import { stripeConfirmDemo } from "../api/payments";

export default function CheckoutForm({ paymentId, onDone, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      setLoading(false);
      onError?.(error.message || "Payment failed");
      return;
    }

    try {
      await stripeConfirmDemo({ paymentId });
      setLoading(false);
      onDone?.("Payment successful (demo)!");
    } catch (e2) {
      setLoading(false);
      onError?.(e2?.response?.data?.message || "Failed to finalize payment");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <PaymentElement />
      <button
        disabled={!stripe || loading}
        className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
      >
        {loading ? "Processing..." : "Pay now"}
      </button>
    </form>
  );
}
