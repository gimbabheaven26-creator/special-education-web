/**
 * fix-orphan-chapters.mjs
 *
 * Finds quiz questions whose `chapter` value doesn't match any slug
 * in the chapters table, maps them to the correct existing chapter,
 * and updates them in Supabase.
 *
 * Usage:
 *   node scripts/fix-orphan-chapters.mjs <SUPABASE_SERVICE_ROLE_KEY>
 */

const SUPABASE_URL = "https://ssluhxvbyzqmdkbjwoke.supabase.co";
const SERVICE_KEY = process.argv[2];

if (!SERVICE_KEY) {
  throw new Error("Usage: node scripts/fix-orphan-chapters.mjs <SERVICE_ROLE_KEY>");
}

// ─── Mapping: orphan chapter value → correct existing chapter slug ───
// Determined by inspecting question content and matching to existing chapters.
const ORPHAN_MAP = {
  // curriculum / "2022-revised" → general-curriculum
  // Question cur-q91 is about 2022 개정 특수교육 교육과정 (general/national curriculum revision)
  "2022-revised": "general-curriculum",

  // physical-disability / "cerebral-palsy" → cp-types
  // Question pd-q66 mentions GMFCS but the topic is cerebral palsy classification
  "cerebral-palsy": "cp-types",

  // visual-impairment / "deafblind" → assistive-tech
  // Question vi-q75 is about 시청각중복장애 (deafblind) education support
  // Best fit among existing VI chapters: assistive-tech (보조공학)
  "deafblind": "assistive-tech",

  // laws / "practices" → special-education-act
  // All 10 questions reference 「장애인 등에 대한 특수교육법」 directly
  "practices": "special-education-act",

  // laws / "strategies" → special-education-act
  // All 5 questions reference 「장애인 등에 대한 특수교육법」 directly
  "strategies": "special-education-act",
};

async function apiFetch(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return null;
}

async function fetchJson(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }
  return res.json();
}

async function main() {
  console.log("=== Step 1: Fetch all chapters and quiz questions ===\n");

  const chapters = await fetchJson(
    "chapters?select=slug,title,subject_slug,sort_order&order=subject_slug,sort_order"
  );
  console.log(`Chapters: ${chapters.length}`);

  const questions = await fetchJson(
    "quiz_questions?select=id,chapter,subject,question&order=chapter"
  );
  console.log(`Quiz questions: ${questions.length}`);

  // ─── Step 2: Find orphans ───
  console.log("\n=== Step 2: Find orphan questions ===\n");

  const chapterSlugs = new Set(chapters.map((c) => c.slug));
  const orphans = questions.filter((q) => !chapterSlugs.has(q.chapter));

  if (orphans.length === 0) {
    console.log("No orphan questions found. All chapters are valid.");
    return;
  }

  console.log(`Found ${orphans.length} orphan question(s).\n`);

  // ─── Step 3: Group and display mapping ───
  console.log("=== Step 3: Orphan → Correct chapter mapping ===\n");

  const grouped = {};
  for (const q of orphans) {
    const key = q.chapter;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key] = [...grouped[key], q];
  }

  for (const [orphanChapter, qs] of Object.entries(grouped)) {
    const newChapter = ORPHAN_MAP[orphanChapter];
    if (!newChapter) {
      console.log(
        `WARNING: No mapping for orphan chapter "${orphanChapter}" (${qs.length} questions)`
      );
      continue;
    }

    const subjects = [...new Set(qs.map((q) => q.subject))];
    console.log(
      `"${orphanChapter}" → "${newChapter}" (subject: ${subjects.join(", ")}, ${qs.length} questions)`
    );
    for (const q of qs) {
      console.log(
        `  ${q.id} | current: "${q.chapter}" → new: "${newChapter}" | ${q.question.substring(0, 60)}...`
      );
    }
    console.log();
  }

  // ─── Step 4: Apply updates ───
  console.log("=== Step 4: Updating questions in Supabase ===\n");

  let totalUpdated = 0;

  for (const [orphanChapter, qs] of Object.entries(grouped)) {
    const newChapter = ORPHAN_MAP[orphanChapter];
    if (!newChapter) {
      console.log(`SKIPPED: "${orphanChapter}" (no mapping defined)`);
      continue;
    }

    const ids = qs.map((q) => q.id);
    const idsParam = ids.map((id) => `"${id}"`).join(",");

    await apiFetch(
      `quiz_questions?id=in.(${idsParam})`,
      {
        method: "PATCH",
        body: JSON.stringify({ chapter: newChapter }),
      }
    );

    console.log(
      `Updated ${ids.length} question(s): "${orphanChapter}" → "${newChapter}" [${ids.join(", ")}]`
    );
    totalUpdated += ids.length;
  }

  console.log(`\nTotal updated: ${totalUpdated}`);

  // ─── Step 5: Verify ───
  console.log("\n=== Step 5: Verification — re-checking for orphans ===\n");

  const verifyQuestions = await fetchJson(
    "quiz_questions?select=id,chapter,subject&order=chapter"
  );
  const remainingOrphans = verifyQuestions.filter(
    (q) => !chapterSlugs.has(q.chapter)
  );

  if (remainingOrphans.length === 0) {
    console.log("PASS: Zero orphan questions remain. All chapters are valid.");
  } else {
    console.log(
      `FAIL: ${remainingOrphans.length} orphan(s) still remain:`
    );
    for (const q of remainingOrphans) {
      console.log(`  ${q.id} | chapter: "${q.chapter}" | subject: "${q.subject}"`);
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
