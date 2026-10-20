#!/usr/bin/env python3
"""Build the UniPath institutions + courses dataset.

Reads the nigeria-tertiary-institutions-api CSVs (MIT licensed) from /tmp/nti,
parses institution faculties/schools and departments, expands standard faculty
structures into departments, infers Nigerian qualifications per department, and
maps qualifications to typical programme durations.

Outputs data/institutions.json, which the app serves directly (no database
weight). Regenerate with: python3 scripts/build-institutions-dataset.py

Course rows derived from published department lists are tagged source='listed';
rows expanded from standard faculty structures are tagged source='inferred'.
The UI must surface that inferred lists are indicative.
"""
import csv
import json
import re
import sys
from pathlib import Path

DATA_DIR = Path('/tmp/nti')
REPO = Path(__file__).resolve().parent.parent
OUT = REPO / 'data' / 'institutions.json'

# ----------------------------------------------------------------------------
# Qualification inference (adapted from the source repo's documented rules)
# ----------------------------------------------------------------------------
UNIVERSITY_RULES = [
    (re.compile(r'\blaw\b', re.I), 'LL.B.'),
    (re.compile(r'\b(medicine and surgery|human medicine|clinical medicine)\b', re.I), 'MBBS'),
    (re.compile(r'\b(dentistry|dental surgery)\b', re.I), 'BDS'),
    (re.compile(r'\b(pharmacy|pharmaceutical sciences)\b', re.I), 'B.Pharm.'),
    (re.compile(r'\bnursing\b', re.I), 'B.NSc.'),
    (re.compile(r'\bveterinary medicine\b', re.I), 'DVM'),
    (re.compile(r'\b(architecture)\b', re.I), 'B.Arch.'),
    (re.compile(r'\bengineering\b', re.I), 'B.Eng.'),
    (re.compile(r'\b(english|literature|linguistics|history|philosophy|religious studies|theatre|performing arts|creative arts|fine art|foreign languages|french|arabic studies|islamic studies|christian religious studies|music|classics|archaeology)\b', re.I), 'B.A.'),
    (re.compile(r'\bagric', re.I), 'B.Agric.'),
    (re.compile(r'\beducation\b', re.I), 'B.Ed.'),
]
UNIVERSITY_DEFAULT = 'B.Sc.'

DURATION_YEARS = {
    'B.Sc.': 4, 'B.A.': 4, 'B.Ed.': 4, 'B.Agric.': 4,
    'B.Eng.': 5, 'LL.B.': 5, 'B.Pharm.': 5, 'B.NSc.': 5, 'B.Arch.': 5,
    'MBBS': 6, 'BDS': 6, 'DVM': 6,
    'ND': 2, 'HND': 2, 'NCE': 3,
}


def infer_university_qualification(dept):
    for rx, qual in UNIVERSITY_RULES:
        if rx.search(dept):
            return qual
    return UNIVERSITY_DEFAULT


# ----------------------------------------------------------------------------
# Standard faculty -> departments expansion (common NUC patterns)
# ----------------------------------------------------------------------------
# (keywords matched against the faculty/school name, standard departments)
FACULTY_MAP = [
    (['agricultur'], ['Agricultural Economics', 'Agricultural Extension', 'Animal Science', 'Crop Science', 'Soil Science', 'Fisheries and Aquaculture', 'Forestry and Wildlife Management', 'Food Science and Technology']),
    (['veterinary'], ['Veterinary Medicine']),
    (['arts', 'humanities'], ['English and Literary Studies', 'History and International Studies', 'Philosophy', 'Linguistics', 'Theatre and Performing Arts', 'Music', 'French', 'Arabic and Islamic Studies', 'Christian Religious Studies', 'Fine and Applied Arts']),
    (['education'], ['Educational Foundations', 'Arts Education', 'Science Education', 'Educational Management', 'Guidance and Counselling', 'Human Kinetics and Health Education', 'Early Childhood Education']),
    (['engineering'], ['Civil Engineering', 'Mechanical Engineering', 'Electrical and Electronics Engineering', 'Chemical Engineering', 'Computer Engineering', 'Petroleum Engineering']),
    (['environmental'], ['Architecture', 'Building Technology', 'Estate Management', 'Quantity Surveying', 'Urban and Regional Planning', 'Surveying and Geoinformatics']),
    (['law'], ['Law']),
    (['management', 'business', 'administration'], ['Accounting', 'Banking and Finance', 'Business Administration', 'Marketing', 'Insurance', 'Public Administration']),
    (['social sciences', 'social science'], ['Economics', 'Political Science', 'Sociology', 'Psychology', 'Geography', 'Mass Communication', 'International Relations']),
    (['medical', 'medicine', 'health sciences', 'clinical'], ['Medicine and Surgery', 'Dentistry', 'Nursing Science', 'Pharmacy', 'Medical Laboratory Science', 'Anatomy', 'Physiology', 'Public Health', 'Radiography']),
    (['pharmacy', 'pharmaceutical'], ['Pharmacy']),
    (['dentistry', 'dental'], ['Dentistry']),
    (['nursing'], ['Nursing Science']),
    (['science'], ['Biochemistry', 'Botany', 'Chemistry', 'Computer Science', 'Geology', 'Mathematics', 'Microbiology', 'Physics', 'Zoology', 'Statistics']),
    (['technology'], ['Computer Science', 'Information Technology', 'Food Science and Technology', 'Science Laboratory Technology']),
    (['communication'], ['Mass Communication']),
]

GENERIC_POLY_PROGRAMMES = ['Accountancy', 'Business Administration and Management', 'Computer Science', 'Statistics', 'Science Laboratory Technology', 'Mass Communication', 'Public Administration', 'Electrical and Electronics Engineering Technology', 'Computer Engineering Technology', 'Hospitality Management']

GENERIC_COE_SUBJECTS = ['English', 'Mathematics', 'Biology', 'Chemistry', 'Physics', 'Integrated Science', 'Economics', 'Political Science', 'Social Studies', 'Christian Religious Studies', 'Islamic Studies', 'Hausa', 'Igbo', 'Yoruba', 'Fine Arts', 'Music', 'Physical and Health Education', 'Computer Science', 'Agricultural Science', 'Home Economics', 'Business Education']


def norm(s):
    return re.sub(r'\s+', ' ', (s or '').strip().lower())


def slugify(name):
    s = norm(name)
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return s[:80] or 'institution'


def split_faculties(cell):
    parts = [p.strip().strip('.') for p in (cell or '').split(';')]
    return [p for p in parts if p and len(p) > 2 and '...' not in p]


DESCRIPTIVE_RE = re.compile(
    r'\b(est|established|affiliated|affiliation|including|programmes?|departments?|schools?|colleges?|university|mission|accredited|span|cite|named|formerly|owned|church|chapel|mosque)\b', re.I)


def looks_like_department(text):
    t = text.strip()
    if len(t) < 3 or ';' in t or '...' in t:
        return False
    if DESCRIPTIVE_RE.search(t):
        return False
    # must contain at least one uppercase letter (proper-noun phrase)
    return any(c.isupper() for c in t)


def parse_departments(cell):
    depts = []
    for g in re.findall(r'\(([^()]*)\)', cell or ''):
        if ';' in g:
            continue  # descriptive aside, not a department list
        for d in g.split(','):
            d = d.strip().strip('.')
            if looks_like_department(d):
                depts.append(d)
    return depts


def expand_faculty(faculty_name):
    fl = norm(faculty_name)
    # strip the parens part; match on the faculty/school name itself
    fl = re.sub(r'\(.*', '', fl).strip()
    out = []
    for keywords, depts in FACULTY_MAP:
        if any(k in fl for k in keywords):
            out.extend(depts)
    return out


def dedupe(names):
    seen, out = set(), []
    for n in names:
        k = norm(n)
        if k and k not in seen:
            seen.add(k)
            out.append(n.strip())
    return out


def load_rows():
    institutions = []
    def read_csv(fname):
        with open(DATA_DIR / fname, encoding='utf-8-sig') as f:
            return list(csv.DictReader(f))

    for r in read_csv('nigerian_universities_faculties.csv'):
        institutions.append({
            'name': r['University Name'].strip(), 'type': 'university',
            'ownership': r['Category'].strip().lower(), 'state': r['Location'].strip(),
            'year': (r['Year Established'] or '').strip() or None,
            'website': (r['Website'] or '').strip() or None,
            'struct': r['Faculties'] or '',
        })
    for r in read_csv('nigerian_polytechnics_schools.csv'):
        institutions.append({
            'name': r['Institution Name'].strip(), 'type': 'polytechnic',
            'ownership': r['Category'].strip().lower(), 'state': r['State'].strip(),
            'year': (r['Year Established'] or '').strip() or None,
            'website': None, 'struct': r['Schools/Departments'] or '',
        })
    for r in read_csv('nigerian_colleges_of_education_schools.csv'):
        institutions.append({
            'name': r['Institution Name'].strip(), 'type': 'college_of_education',
            'ownership': r['Category'].strip().lower(), 'state': r['State'].strip(),
            'year': (r['Year Established'] or '').strip() or None,
            'website': None, 'struct': r['Schools/Departments'] or '',
        })
    return institutions


def build_courses(inst):
    """Return list of (course_name, qualification, faculty, source)."""
    itype = inst['type']
    listed = parse_departments(inst['struct'])
    faculties = split_faculties(inst['struct'])
    courses = []

    if itype == 'university':
        for d in dedupe(listed):
            q = infer_university_qualification(d)
            courses.append((d, q, None, 'listed'))
        # expand faculties not already covered
        have = {norm(c[0]) for c in courses}
        for fac in faculties:
            for d in expand_faculty(fac):
                if norm(d) not in have:
                    have.add(norm(d))
                    # faculty label without parens
                    label = re.sub(r'\(.*', '', fac).strip()
                    courses.append((d, infer_university_qualification(d), label, 'inferred'))
    elif itype == 'polytechnic':
        depts = dedupe(listed) or GENERIC_POLY_PROGRAMMES
        src = 'listed' if listed else 'inferred'
        for d in depts:
            courses.append((d, 'ND', None, src))
            courses.append((d, 'HND', None, src))
    else:  # college_of_education
        depts = dedupe(listed) or GENERIC_COE_SUBJECTS
        src = 'listed' if listed else 'inferred'
        for d in depts:
            courses.append((d, 'NCE', None, src))
    return courses


def main():
    institutions = load_rows()
    print(f'institutions: {len(institutions)}', file=sys.stderr)

    used_slugs = {}
    inst_rows, course_rows = [], []
    total_courses = 0
    for inst in institutions:
        base = slugify(inst['name'])
        n = used_slugs.get(base, 0)
        used_slugs[base] = n + 1
        slug = base if n == 0 else f'{base}-{n + 1}'
        year = int(inst['year']) if inst['year'] and inst['year'].isdigit() else None
        inst_rows.append((slug, inst['name'], inst['type'], inst['ownership'], inst['state'], year, inst['website']))
        for name, qual, faculty, source in build_courses(inst):
            years = DURATION_YEARS.get(qual)
            course_rows.append((slug, name, qual, years, faculty, source))
            total_courses += 1

    print(f'courses: {total_courses}', file=sys.stderr)

    from datetime import datetime, timezone
    payload = {
        'generated': datetime.now(timezone.utc).isoformat(),
        'source': 'nigeria-tertiary-institutions-api (MIT) + standard Nigerian qualification patterns',
        'note': 'Course rows tagged inferred follow standard qualification patterns; confirm with the school.',
        'institutions': [
            {'id': slug, 'name': name, 'type': itype, 'ownership': own, 'state': state,
             'yearEstablished': year, 'website': web}
            for slug, name, itype, own, state, year, web in inst_rows
        ],
        'courses': [
            {'institutionId': slug, 'courseName': name, 'qualification': qual,
             'durationYears': years, 'faculty': faculty, 'source': source}
            for slug, name, qual, years, faculty, source in course_rows
        ],
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(payload, f, ensure_ascii=False, separators=(',', ':'))
    print(f'wrote {OUT} ({OUT.stat().st_size / 1024:.0f} KB)', file=sys.stderr)


if __name__ == '__main__':
    main()
