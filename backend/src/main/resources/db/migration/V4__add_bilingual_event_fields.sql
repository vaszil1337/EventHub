-- V4: Add bilingual title and description fields to events
ALTER TABLE events ADD COLUMN IF NOT EXISTS title_hu VARCHAR(255);
ALTER TABLE events ADD COLUMN IF NOT EXISTS description_hu VARCHAR(2000);

-- Populate initial seeded events with Hungarian titles and descriptions
UPDATE events SET
    title_hu = 'Tech Horizontok Csúcstalálkozó 2026',
    description_hu = 'Csatlakozz vezető mérnökökhöz és kutatókhoz: előadások modern felhőarchitektúrákról, TypeScriptről és webes technológiákról.'
WHERE id = 'evt-tech-summit-2026';

UPDATE events SET
    title_hu = 'Lágy Jazz és Soul Est',
    description_hu = 'Meghitt akusztikus est világszínvonalú jazz- és soul-előadókkal egy különleges hangulatú klubban.'
WHERE id = 'evt-jazz-night-2026';

UPDATE events SET
    title_hu = 'Vezetői MI és Deep Learning Mesterkurzus',
    description_hu = 'Gyakorlati mesterkurzus neuronháló-tervezésről, neurális modellekről és vállalati implementációs stratégiákról.'
WHERE id = 'evt-ai-masterclass-2026';
