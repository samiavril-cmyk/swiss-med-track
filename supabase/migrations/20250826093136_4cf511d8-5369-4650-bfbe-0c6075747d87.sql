-- Set basis modules as proper modules with module_type
UPDATE procedure_categories 
SET module_type = 'basis', 
    minimum_required = 20,
    sort_index = CASE 
      WHEN key = 'basis_notfallchirurgie' THEN 1
      WHEN key = 'basis_allgemeinchirurgie' THEN 2
      ELSE sort_index 
    END
WHERE key IN ('basis_notfallchirurgie', 'basis_allgemeinchirurgie');