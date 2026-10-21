-- Allow university shortlist selections to reference directory universities.
--
-- "My Universities" now lists every university from the bundled institutions
-- directory (data/institutions.json), whose IDs are slugs like
-- 'university-of-ibadan' that do not exist in the curated public.universities
-- table. Dropping the foreign key lets university_selections store those IDs.
-- The toggle_university_selection() function keeps enforcing the max-3 rule.
--
-- The old shortlist entries pointed at the small curated list, which no longer
-- exists as a selection source, so they are cleared for a fresh start.

alter table public.university_selections
  drop constraint if exists university_selections_university_id_fkey;

truncate table public.university_selections;
