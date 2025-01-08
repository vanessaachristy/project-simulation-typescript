import { FastifyReply, FastifyRequest } from 'fastify';
import { ApiResponse } from '../types';
import { Subscriber } from '@prisma/client';
import { subscriberService } from '../services/subscriber.service';

export const subscriberController = {
    getSubscriber: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id, phoneNumber } = request.query as { id?: string, phoneNumber?: string };
            let subscribers: Subscriber[] = [];

            if (id) {
                const subscriber = await subscriberService.getSubsriberById(Number(id));
                subscribers = subscriber ? [subscriber] : [];
            } else if (phoneNumber) {
                const subscriber = await subscriberService.getSubscriberByPhoneNumber(phoneNumber);
                subscribers = subscriber ? [subscriber] : [];
            } else {
                subscribers = await subscriberService.getAllSubscribers();
            }

            const res: ApiResponse<Subscriber[]> = {
                success: true,
                data: subscribers
            };

            reply.send(res);
        } catch (error) {
            const res: ApiResponse<{}> = {
                success: false,
                error: (error as any)?.message || "Internal server error"
            };

            reply.status((error as any)?.statusCode || 500).send(res);
        }
    }

}
