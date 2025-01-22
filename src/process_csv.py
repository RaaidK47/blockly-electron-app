import csv
import os

# Predefined path to the compiled CSV file
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output")
CSV_FILE = os.path.join(OUTPUT_DIR, "blockly_output.csv")

def process_csv():
    if not os.path.exists(CSV_FILE):
        print(f"Error: File '{CSV_FILE}' does not exist!")
        return
    
    print(f"Processing CSV file: {CSV_FILE}")
    with open(CSV_FILE, 'r') as file:
        reader = csv.reader(file)
        for row in reader:
            print(row)

if __name__ == "__main__":
    process_csv()
