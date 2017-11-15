#!/usr/bin/env python
# Name: Mark Pijnenburg
# Student number: 11841117
# Minor Programmeren
# University of Amsterdam

# Import the needed modules
import csv
import json

# Open CSV source file.
with open("data2.csv") as f:
    reader = csv.DictReader(f)
    rows = list(reader)

# Write CSV content to JSON file.
with open("data2.json", 'w') as f:
    json.dump(rows, f)
