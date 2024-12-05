// import * as admin from 'firebase-admin';
import admin, { ServiceAccount } from "firebase-admin";
// import * as serviceAccount from "./tashliyah-service-account";
import { serviceAccountJson } from "./tashliyeah-service-account";


const firebaseAdmin = admin.initializeApp({
    credential: admin.credential.cert(serviceAccountJson() as ServiceAccount),
});

export const sendPushNotification = async (devicePushToken: string, title: string, body: string) => {
    try {
        await firebaseAdmin.messaging().send({
            token: devicePushToken,
            notification: {
                title,
                body
            }
        });
        console.log("Push notification sent successfully!");
    } catch (error) {
        console.error("Error sending push notification:", error);
    }
}







// const firebaseAdmin = admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
// });

// export const sendPushNotification = async (devicePushToken: string, title: string, body: string) => {
//     try {
//         await firebaseAdmin.messaging().send({
//             token: devicePushToken,
//             notification: {
//                 title,
//                 body
//             }
//         });
//         console.log("Push notification sent successfully!");
//     } catch (error) {
//         console.error("Error sending push notification:", error);
//     }
// }







// import admin from 'firebase-admin';
// import serviceAccount from "./tashliyeah-firebase-adminsdk-ldqy8-ac6b025992.json";

// const firebaseAdmin = admin.initializeApp({
//     credential: firebaseAdmin.credential.cert(serviceAccount),
    
// });

// export const sendPushNotification = async (devicePushToken, title, body) => {
//     try {
//         await firebaseAdmin.messaging().send({
//             token: devicePushToken,
//             notification: {
//                 title,
//                 body
//             }
//         });
//         console.log("Push notification sent successfully!");
//     } catch (error) {
//         console.error("Error sending push notification:", error);
//     }
// }



