import { sendPushNotification } from "../../../firebase";


// Define types for parameters
type VendorDeviceToken = string;
type OrderId = string;
type CustomerDeviceToken = string;
type RequestId = string;
type BidId = string;
type NewStatus = string;




// 1. When a customer places an order containing a bid created by a vendor
export const notifyVendorOrderAgainstBid = async (vendorDeviceToken: VendorDeviceToken, orderId: OrderId) => {
    const notification = {
        title: "New Order Against Your Bid",
        body: `You have a new order with ID ${orderId} placed against your bid.`
    };
    await sendPushNotification(vendorDeviceToken, notification.title, notification.body);
}

// 2. When a request is placed by a customer
export const notifyVendorOnNewRequest = async (vendorDeviceToken: VendorDeviceToken, requestId: RequestId) => {
    const notification = {
        title: "New Request from Customer",
        body: `You have a new request with ID ${requestId} from a customer.`
    };
    await sendPushNotification(vendorDeviceToken, notification.title, notification.body);
}

// 3. When a vendor updates the order status
export const notifyCustomerOrderStatusUpdate = async (customerDeviceToken: CustomerDeviceToken, orderId: OrderId, newStatus: NewStatus) => {
    const notification = {
        title: "Order Status Update",
        body: `The status of your order with ID ${orderId} is now ${newStatus}.`
    };
    await sendPushNotification(customerDeviceToken, notification.title, notification.body);
}

// 4. When a vendor creates a bid against a customer request
export const notifyCustomerBidCreation = async (customerDeviceToken: CustomerDeviceToken, requestId: RequestId, bidId: BidId) => {
    const notification = {
        title: "New Bid on Your Request",
        body: `You have a new bid with ID ${bidId} against your request with ID ${requestId}.`
    };
    await sendPushNotification(customerDeviceToken, notification.title, notification.body);
}
