/*
  # Initial Schema Setup for ClassPlane

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key) - matches auth.users.id
      - `email` (text) - user's email
      - `created_at` (timestamp)
      
    - `subjects`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - references profiles.id
      - `title` (text) - subject name
      - `created_at` (timestamp)
      
    - `topics`
      - `id` (uuid, primary key)
      - `subject_id` (uuid) - references subjects.id
      - `title` (text) - topic name
      - `completed` (boolean) - completion status
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add triggers to enforce limits (10 subjects per user, 20 topics per subject)
*/

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create subjects table
CREATE TABLE subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create topics table
CREATE TABLE topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create function to check subjects count
CREATE OR REPLACE FUNCTION check_subjects_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT count(*) FROM subjects WHERE user_id = NEW.user_id) >= 10 THEN
    RAISE EXCEPTION 'User cannot have more than 10 subjects';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to check topics count
CREATE OR REPLACE FUNCTION check_topics_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT count(*) FROM topics WHERE subject_id = NEW.subject_id) >= 20 THEN
    RAISE EXCEPTION 'Subject cannot have more than 20 topics';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER enforce_subjects_limit
  BEFORE INSERT ON subjects
  FOR EACH ROW
  EXECUTE FUNCTION check_subjects_limit();

CREATE TRIGGER enforce_topics_limit
  BEFORE INSERT ON topics
  FOR EACH ROW
  EXECUTE FUNCTION check_topics_limit();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

-- Create security policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can view own subjects"
  ON subjects FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own subjects"
  ON subjects FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own subjects"
  ON subjects FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own subjects"
  ON subjects FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view own topics"
  ON topics FOR SELECT
  TO authenticated
  USING (subject_id IN (
    SELECT id FROM subjects WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own topics"
  ON topics FOR INSERT
  TO authenticated
  WITH CHECK (subject_id IN (
    SELECT id FROM subjects WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update own topics"
  ON topics FOR UPDATE
  TO authenticated
  USING (subject_id IN (
    SELECT id FROM subjects WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own topics"
  ON topics FOR DELETE
  TO authenticated
  USING (subject_id IN (
    SELECT id FROM subjects WHERE user_id = auth.uid()
  ));