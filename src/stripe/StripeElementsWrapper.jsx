import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "./stripePromise";

export default function StripeElementsWrapper({ clientSecret, children }) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      {children}
    </Elements>
  );
}
