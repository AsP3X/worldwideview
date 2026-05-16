import { stripe } from "@/lib/stripe/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            sig!,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } // TODO: Legacy Airbnb linting violation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (err: any) {
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
        // TODO: Legacy Airbnb linting violation
        // eslint-disable-next-line no-console
        console.log("Subscription completed!");
        // Update user tier in DB, send license key via email
    }

    return new NextResponse(null, { status: 200 });
}
