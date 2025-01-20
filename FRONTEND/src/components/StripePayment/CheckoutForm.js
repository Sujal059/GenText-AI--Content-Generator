import { useParams, useSearchParams } from "react-router-dom";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createStripePaymentIntentAPI } from "../../apis/stripePayment/stripePayment";
import StatusMessage from "../Alert/StatusMessage";

const CheckoutForm = () => {
  // Extract URL parameters and query string values
  const params = useParams();
  const [searchParams] = useSearchParams();
  const plan = params.plan;
  const amount = searchParams.get("amount");

  // Initialize Stripe hooks
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState(null);

  // Configure React Query mutation for payment intent creation
  const mutation = useMutation({
    mutationFn: createStripePaymentIntentAPI,
  });

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
        setErrorMessage("Stripe is not initialized.");
        return;
    }

    try {
        // Step 1: Submit elements (collect and verify customer input)
        const { error: submitError } = await elements.submit();
        if (submitError) {
            setErrorMessage(submitError?.message);
            return;
        }

        // Step 2: Prepare payment intent data
        const data = { amount, plan };

        // Step 3: Trigger mutation to create payment intent
        mutation.mutate(data, {
            onSuccess: async (data) => {
                const clientSecret = data?.clientSecret;
                if (!clientSecret) {
                    setErrorMessage("Client secret not found.");
                    return;
                }

                // Step 4: Confirm the payment using Stripe
                const { error } = await stripe.confirmPayment({
                    elements,
                    clientSecret,
                    confirmParams: {
                        return_url: "http://localhost:3000/success", // Update to production URL in production
                    },
                });

                if (error) {
                    setErrorMessage(error?.message);
                }
            },
            onError: (error) => {
                setErrorMessage(
                    error?.response?.data?.error || "Failed to create payment intent"
                );
            },
        });
    } catch (error) {
        setErrorMessage(error?.message || "An unexpected error occurred.");
    }
};


  return (
    <div className="bg-gray-900 h-screen -mt-4 flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="w-96 mx-auto my-4 p-6 bg-white rounded-lg shadow-md"
      >
        <div className="mb-4">
          <PaymentElement />
        </div>

        {/* Display loading */}
        {mutation?.isPending && (
          <StatusMessage type="loading" message="Processing, please wait..." />
        )}

        {/* Display error */}
        {mutation?.isError && (
          <StatusMessage
            type="error"
            message={mutation?.error?.response?.data?.error}
          />
        )}

        {/* Submit button */}
        <button
          type="submit"
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Pay
        </button>

        {/* Display error message if present */}
        {errorMessage && (
          <div className="text-red-500 mt-4 text-sm">{errorMessage}</div>
        )}
      </form>
    </div>
  );
};

export default CheckoutForm;
