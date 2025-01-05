import { subscriberRepository } from "../repositories/subscriber.repository";

export const subscriberService = {
    getAllSubscribers: async () => {
        const subscribers = await subscriberRepository.findAll();
        return subscribers;
    },

    getSubsriberById: async (id: number) => {
        const subscriber = await subscriberRepository.findBySubscriberId(id);
        return subscriber;
    },

    getSubscriberByPhoneNumber: async (phoneNumber: string) => {
        const subscriber = await subscriberRepository.findByPhoneNumber(phoneNumber);
        return subscriber;
    },

    getOrCreateSubscriberId: async (phoneNumber: string, planId: string): Promise<number> => {
        try {
            const subscriber = await subscriberRepository.findByPhoneNumber(phoneNumber);

            if (subscriber) {
                // If subscriber exists, return their ID
                return subscriber.id;
            } else {
                // If no subscriber exists, create a new one
                const newSubscriber = await subscriberRepository.insertSubscriber(phoneNumber, planId);

                return newSubscriber.id;
            }
        } catch (error) {
            throw new Error('Database error while fetching or creating subscriber');
        }
    }
};
