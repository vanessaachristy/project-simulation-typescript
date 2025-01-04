"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const seed_1 = require("../src/config/seed");
const prisma = new client_1.PrismaClient();
async function main() {
    seed_1.availableDataPlans.forEach(async (plan) => {
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
        });
        console.log(dataPlan);
    });
}
main()
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
//# sourceMappingURL=seed.js.map