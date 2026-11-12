/*
  # Add plan fields to magazines table

  1. Changes
    - Add `has_plan` boolean field to magazines table
    - Add `plan_model_name` text field to magazines table
    - Set default value for `has_plan` to false

  2. Notes
    - `has_plan` indicates if the magazine includes a plan
    - `plan_model_name` stores the name of the aircraft model in the plan
*/

ALTER TABLE magazines 
ADD COLUMN has_plan boolean DEFAULT false,
ADD COLUMN plan_model_name text;
