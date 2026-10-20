# Institutions directory data

`institutions.json` is the bundled dataset behind the Institutions directory
(`/dashboard/institutions`) and the `/api/institutions` API routes. It holds
752 Nigerian tertiary institutions (universities, polytechnics, colleges of
education) and ~18,000 courses with qualifications and typical durations.

It is served straight from this file, so the directory adds zero weight to
the Supabase database.

## Regenerate

```bash
python3 scripts/build-institutions-dataset.py
```

The builder reads the `nigeria-tertiary-institutions-api` CSVs (MIT licensed)
from `/tmp/nti`, parses faculties/schools and departments, expands standard
Nigerian faculty structures, infers qualifications per department, and maps
qualifications to typical programme durations.

Course rows derived from published department lists are tagged
`source: "listed"`; rows expanded from standard faculty structures are tagged
`source: "inferred"`. The UI carries an "indicative list" disclaimer.

## Using an external keyed API instead

Set `INSTITUTIONS_API_URL` and `INSTITUTIONS_API_KEY` (see `.env.example`).
The app will call that API with `Authorization: Bearer <key>` and skip this
file. See `lib/institutions-source.ts` for the expected response contract.
