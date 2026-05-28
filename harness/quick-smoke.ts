import { evaluate } from './evaluate.ts';

const guide = process.argv[2] ?? 'new-input-system-basics';
console.log(`Quick smoke: ${guide}`);
evaluate({ tasks: [guide] }).catch(err => { console.error(err); process.exit(1); });
