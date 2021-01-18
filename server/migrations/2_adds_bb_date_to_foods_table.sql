ALTER TABLE foods ADD COLUMN best_before_date DATE;
UPDATE foods SET best_before_date = NOW();
ALTER TABLE foods ALTER COLUMN best_before_date SET NOT NULL;
