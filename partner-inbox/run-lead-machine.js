const url = process.env.LEAD_MACHINE_URL || 'https://vaklease-partner-inbox.onrender.com/api/internal/lead-machine-run';
const token = process.env.LEAD_MACHINE_JOB_TOKEN || '';

if (!token) {
  console.error('LEAD_MACHINE_JOB_TOKEN ontbreekt');
  process.exit(1);
}

const response = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Lead-Machine-Token': token
  },
  body: '{}'
});

const text = await response.text();
console.log(response.status, text);
if (!response.ok) process.exit(1);
