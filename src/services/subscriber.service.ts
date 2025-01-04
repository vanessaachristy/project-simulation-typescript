import { prisma } from "../plugins/prisma";

export async function getSubscriberId(phoneNumber: string, planId: string): Promise<number> {
    try {
        const subscriber = await prisma.subscriber.findUnique({
            where: {
                phoneNumber: phoneNumber,
            },
        });

        if (subscriber) {
            // If subscriber exists, return their ID
            return subscriber.id;
        } else {
            // If no subscriber exists, create a new one
            const newSubscriber = await prisma.subscriber.create({
                data: {
                    phoneNumber: phoneNumber,
                    planId: planId,
                },
            });

            return newSubscriber.id;
        }
    } catch (error) {
        throw new Error('Database error while fetching or creating subscriber');
    }
}