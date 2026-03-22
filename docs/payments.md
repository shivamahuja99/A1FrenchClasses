# Payment Documentation

This document describes how payments are processed in A1FrenchClasses.

## Payment Flow

1.  **Checkout Initiation**:
    - The user clicks the checkout button on the Cart Page.
    - Frontend calls `POST /api/checkout`.
    - Backend creates an `Order` and `OrderItem` records in the database (Status: `PENDING`).
    - Backend calls PayPal API to create a PayPal Order.
    - Backend returns the PayPal Order ID and Approval URL to the frontend.

2.  **User Approval**:
    - Frontend redirects user or opens PayPal modal.
    - User approves the payment on PayPal.

3.  **Capture Payment**:
    - Frontend receives the `orderID` from PayPal after approval.
    - Frontend calls `POST /api/checkout/capture` with `paypal_order_id`.
    - Backend calls PayPal API to capture the funds.
    - On success:
        - Backend creates a `Payment` record in the database.
        - Backend updates the `Order` status to `COMPLETED`.
    - On failure:
        - Backend updates the `Order` status to `FAILED`.

## Database Tables

### `orders`
Stores the overall order information.
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key to users)
- `total_amount`: decimal/float
- `status`: string (`PENDING`, `COMPLETED`, `FAILED`, `CANCELLED`)

### `order_items`
Stores individual items (courses) within an order.
- `id`: UUID (Primary Key)
- `order_id`: UUID (Foreign Key to orders)
- `course_id`: UUID (Foreign Key to courses)
- `price`: decimal/float

### `payments`
Stores transaction details for every payment attempt/success.
- `id`: UUID (Primary Key)
- `order_id`: UUID (Foreign Key to orders)
- `transaction_amount`: decimal/float
- `transaction_id`: string (Internal ID)
- `paypal_transaction_id`: string (PayPal's capture ID)
- `transaction_status`: string (`PENDING`, `COMPLETED`, `FAILED`)

## Debugging Plan

In case of a payment bug, follow these steps:

1.  **Check Server Logs**:
    - Look for errors in `POST /api/checkout` or `POST /api/checkout/capture`.
    - PayPal API errors will be logged in the backend.

2.  **Verify Database State**:
    - Find the order by `id` or `user_id`.
    - Check if `order_items` were created correctly.
    - Check the `payments` table for any entry with the corresponding `order_id`.
    - If `transaction_status` is `FAILED`, check the logs for the reason.

3.  **PayPal Dashboard**:
    - Log in to the PayPal Developer Dashboard.
    - Check the "API Caller" logs to see the requests sent and responses received.
    - Verify if the transaction was captured on PayPal's side but failed to update the database.

4.  **Common Issues**:
    - **Null Course ID**: Ensure the `course_id` is passed correctly from the cart to the checkout handler.
    - **Status Mismatch**: Ensure `CaptureCheckout` correctly updates both the `Payment` and `Order` status.
    - **CORS/Network**: Ensure the frontend can reach the backend for capture after PayPal approval.

## Retrying Failed Payments

If an order is `FAILED` but the user wants to try again, the backend provides `POST /api/orders/{id}/retry` which creates a new PayPal order for the existing local order.
