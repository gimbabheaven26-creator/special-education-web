import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ssluhxvbyzqmdkbjwoke.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY env var required.\nUsage: SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/fix-subject-icons.mjs')
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

// Fix 4 new subjects: emoji → lucide icon name, hex → Tailwind bg class
const FIXES = [
  { slug: 'visual-impairment', icon: 'Eye', color: 'bg-indigo-500' },
  { slug: 'hearing-impairment', icon: 'Ear', color: 'bg-pink-500' },
  { slug: 'physical-disability', icon: 'Accessibility', color: 'bg-amber-500' },
  { slug: 'communication-disorder', icon: 'MessageCircle', color: 'bg-teal-500' },
]

async function main() {
  console.log('=== Fix Subject Icons & Colors ===\n')

  for (const fix of FIXES) {
    const { error } = await supabase
      .from('subjects')
      .update({ icon: fix.icon, color: fix.color })
      .eq('slug', fix.slug)

    if (error) {
      console.error(`FAIL ${fix.slug}: ${error.message}`)
    } else {
      console.log(`OK ${fix.slug}: icon=${fix.icon}, color=${fix.color}`)
    }
  }

  // Verify
  const { data } = await supabase
    .from('subjects')
    .select('slug, icon, color')
    .order('sort_order')

  console.log('\n--- Final state ---')
  for (const s of (data || [])) {
    const isLucide = /^[A-Z]/.test(s.icon)
    const isTailwind = s.color.startsWith('bg-')
    const status = isLucide && isTailwind ? 'OK' : 'WARN'
    console.log(`  [${status}] ${s.slug}: icon=${s.icon}, color=${s.color}`)
  }
}

main().catch(err => {
  console.error(err.message)
  process.exit(1)
})
