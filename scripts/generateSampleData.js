const fs = require('fs');
const path = require('path');

const phoneNumbers = [
  '80000000', '81111111', '82222222', '83333333', 
  '84444444', '85555555', '86666666', '87777777', 
  '88888888', '89999999',
];

const subscribedPlans = [
  'plan_3', 'plan_2', 'plan_6', 'plan_1', 
  'plan_2', 'plan_2', 'plan_3', 'plan_4', 
  'plan_4', 'plan_5',
];

const usageMin = 100;
const usageMax = 2000;
const numDays = 60;
const today = new Date();
const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

function getRandomUsage() {
  return Math.floor(Math.random() * (usageMax - usageMin + 1)) + usageMin;
}

function generateSampleData() {
  let data = 'phone_number,plan_id,date,usage_in_mb\n';
  
  phoneNumbers.forEach((phoneNumber, idx) => {
    for (let i = 0; i < numDays; i++) {
      const date = todayUTC - (i * 24 * 60 * 60 * 1000);
      const usage = getRandomUsage();
      data += `${phoneNumber},${subscribedPlans[idx]},${date},${usage}\n`;
    }
  });

  const filePath = path.join(__dirname, '../data/usage.csv');
  fs.writeFileSync(filePath, data);
}

generateSampleData();
