/*
  # Add Pro User Support

  1. New Columns
    - Add `is_pro` to profiles table
    - Add `evaluations` to subjects table for storing assessment dates and scores

  2. Changes
    - Update subject and topic limits based on pro status
*/

-- Add pro user flag to profiles
ALTER TABLE profiles ADD COLUMN is_pro boolean DEFAULT false;

-- Add evaluations support to subjects
ALTER TABLE subjects ADD COLUMN evaluations jsonb DEFAULT '[]'::jsonb;

-- Update the subjects limit function to check pro status
CREATE OR REPLACE FUNCTION check_subjects_limit()
RETURNS TRIGGER AS $$
DECLARE
  is_pro_user boolean;
BEGIN
  SELECT is_pro INTO is_pro_user FROM profiles WHERE id = NEW.user_id;
  
  IF is_pro_user THEN
    IF (SELECT count(*) FROM subjects WHERE user_id = NEW.user_id) >= 8 THEN
      RAISE EXCEPTION 'Pro users cannot have more than 8 subjects';
    END IF;
  ELSE
    IF (SELECT count(*) FROM subjects WHERE user_id = NEW.user_id) >= 6 THEN
      RAISE EXCEPTION 'Free users cannot have more than 6 subjects. Upgrade to PRO for more!';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update the topics limit function to check pro status
CREATE OR REPLACE FUNCTION check_topics_limit()
RETURNS TRIGGER AS $$
DECLARE
  is_pro_user boolean;
  subject_owner_id uuid;
BEGIN
  SELECT user_id INTO subject_owner_id FROM subjects WHERE id = NEW.subject_id;
  SELECT is_pro INTO is_pro_user FROM profiles WHERE id = subject_owner_id;
  
  IF is_pro_user THEN
    IF (SELECT count(*) FROM topics WHERE subject_id = NEW.subject_id) >= 20 THEN
      RAISE EXCEPTION 'Pro users cannot have more than 20 topics per subject';
    END IF;
  ELSE
    IF (SELECT count(*) FROM topics WHERE subject_id = NEW.subject_id) >= 10 THEN
      RAISE EXCEPTION 'Free users cannot have more than 10 topics per subject. Upgrade to PRO for more!';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;