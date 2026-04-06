import { getClient } from './lib/supabase-client.mjs';

const sb = getClient();

const { data } = await sb.from('quiz_questions')
  .select('id,type,answer,wrong_explanations')
  .not('wrong_explanations', 'is', null)
  .limit(3000);

const keyIssues = data.filter(r => {
  if (!r.wrong_explanations || typeof r.wrong_explanations !== 'object') return false;
  const keys = Object.keys(r.wrong_explanations);
  return keys.some(k => !['0','1','2','3'].includes(k));
});
console.log('WE key issues count:', keyIssues.length);
console.log('Sample:', JSON.stringify(keyIssues.slice(0,5), null, 2));

// also check wrong_explanations that include the answer key
const answerKeyIssues = data.filter(r => {
  if (!r.wrong_explanations || !r.answer) return false;
  return Object.keys(r.wrong_explanations).includes(r.answer);
});
console.log('\nWE answer key issues count:', answerKeyIssues.length);
console.log('Sample:', JSON.stringify(answerKeyIssues.slice(0,3), null, 2));
