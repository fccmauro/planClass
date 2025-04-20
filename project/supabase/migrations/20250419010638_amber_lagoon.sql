/*
  # Update subjects limit to 6

  1. Changes
    - Update the check_subjects_limit function to limit subjects to 6 instead of 10

  2. Notes
    - This change only affects new subject creation
    - Existing subjects above the limit will not be affected
*/

CREATE OR REPLACE FUNCTION check_subjects_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT count(*) FROM subjects WHERE user_id = NEW.user_id) >= 6 THEN
    RAISE EXCEPTION 'User cannot have more than 6 subjects';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;