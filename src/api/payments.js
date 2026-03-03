import { http } from "./http";

export async function stripeCreateIntent({ penaltyId, idempotencyKey }) {
    const { data } = await http.post("/payments/stripe/create-intent", {
        penaltyId,
        idempotencyKey,
    });
    return data; // { paymentId, clientSecret, amountLkr, receiptNo }
}

export async function stripeConfirmDemo({ paymentId }) {
    const { data } = await http.post("/payments/stripe/confirm-demo", {
        paymentId,
    });
    return data;
}

export async function myPayments() {
    const { data } = await http.get("/payments/my");
    return data;
}

export async function getPaymentReceipt(paymentId) {
    const { data } = await http.get(`/payments/${paymentId}/receipt.pdf`, {
        responseType: "blob",
    });
    return data;
}
