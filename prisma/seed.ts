import { PrismaClient } from '@prisma/client'
import { availableDataPlans } from '../src/config/seed'
const prisma = new PrismaClient()


async function main() {

    availableDataPlans.forEach(async (plan) => {

        let dataPlan = await prisma.dataPlan.upsert({
            where: { id: plan.id },
            update: {},
            create: {
                id: plan.id,
                provider: plan.provider,
                name: plan.name,
                dataFreeInGb: plan.dataFreeInGb,
                billingCycleInDays: plan.billingCycleInDays,
                price: plan.price,
                excessChargePerMb: plan.excessChargePerMb
            }
        })

        console.log(dataPlan);
    })


}
main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })