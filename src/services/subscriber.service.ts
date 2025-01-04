import { subscriberRepository } from "../repositories/subscriber.repository";

export const subsriberService = {
    getSubscriberId: async (phoneNumber: string, planId: string): Promise<number> => {
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
