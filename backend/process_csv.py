import csv
import tkinter as tk
import mysql.connector
from tkinter import messagebox
import asyncio
import websockets
import json
import threading

# MySQL database connection setup
def connect_to_database():
    try:
        connection = mysql.connector.connect(
            host='localhost',
            user='temp_user',
            password='password',
            database='test_database'
        )
        return connection
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None

# Function to process the CSV file
def process_csv():
    # Path to the CSV file
    file_path = './csv_output/blockly_output.csv'
    output = []

    try:

        db_connection = connect_to_database()
        db_cursor = db_connection.cursor() if db_connection else None
        if(db_cursor):
            print("Connected to database successfully")

        with open(file_path, 'r') as file:
            reader = csv.DictReader(file)  # Read the CSV file as a dictionary

            for row in reader:
                block_type = row['Block Type']
                operation = row['Operation']
                param_a = row['Parameter A']
                param_b = row['Parameter B']
                fromValue = row['From']
                toValue = row['To']
                increment = row['Increment']
                tableName = row['Table Name']


                try:
                    if block_type == 'math_arithmetic':
                        result = handle_math_operation(operation, param_a, param_b)
                        output.append(f"Math Operation ({operation}): {result}")
                    
                    elif block_type == 'fetch_from_database' and db_cursor:
                        try:
                            result = handle_database_fetch(db_cursor, tableName)
                            output.append(f"Database Fetch: {result}")

                        except Exception as e:
                            print(f"Error fetching from database: {e}")
                            output.append(f"Error fetching from database: {e}")

                    elif block_type == 'controls_if' or block_type == 'logic_compare':
                        
                        result, operator = handle_if_else(param_a, param_b, operation)
                        condition = f"{param_a} {operator} {param_b}"
                    
                        output.append(f"The Condtion '{condition}' is {result}")                      

                    elif block_type == 'controls_for':
                        result = handle_for_loop(fromValue, toValue, increment)
                        output.append(f"For Loop Result: {result}")


                except Exception as e:
                    output.append(f"Error processing block '{block_type}': {e}")

            if db_cursor:
                db_cursor.close()
            if db_connection:
                db_connection.close()

    except Exception as e:
        print(f"Error processing CSV: {e}")
        output.append(f"Error processing CSV: {e}")

    display_output(output)

# Handle math operations
def handle_math_operation(operation, a, b):
    try:
        a, b = float(a), float(b)
        if operation == 'ADD':
            return a + b
        elif operation == 'MINUS':
            return a - b
        elif operation == 'MULTIPLY':
            return a * b
        elif operation == 'DIVIDE':
            return a / b if b != 0 else "Division by zero error"
        elif operation == 'POWER':
            return a ** b
    except ValueError:
        return "Invalid number format"

# Handle database fetch
def handle_database_fetch(cursor, tableName):
    query = f"SELECT * FROM {tableName}"
    try:
        cursor.execute(query)
        result = cursor.fetchall()
        return result
    except Exception as e:
        return f"Database error: {e}"

# Handle if-else logic
def handle_if_else(x,y,operator):
    # Map Blockly operators to Python-readable equivalents

    x = float(x)
    y = float(y)

    operator_mapping = {
        'LT': '<',
        'GT': '>',
        'LTE': '<=',
        'GTE': '>=',
        'EQ': '==',
        'NEQ': '!='
    }

    try:
        # Replace Blockly-style operators with readable equivalents
        for blockly_op, readable_op in operator_mapping.items():
            operator = operator.replace(blockly_op, readable_op)


        # Define safe context for evaluating conditions
        safe_context = {
            '__builtins__': None,  # Restrict access to built-in functions
            'x': x,
            'y': y,
            'True': True,
            'False': False,
        }

        condition = f"x {operator} y"

        # print(x)
        # print(y)
        # print(condition)

        # Evaluate the condition in the safe context
        result = eval(condition, {"__builtins__": None}, safe_context)
        return result, operator
    
    except Exception as e:
        return f"Error evaluating condition: {e}"
        
# Handle for-loop logic
def handle_for_loop(start, end, increment):
    try:
        start, end, increment = int(start), int(end), int(increment)
        result = []
        for i in range(start, end + 1, increment):
            result.append(str(i))
        return result
    except Exception as e:
        return f"For Loop error: {e}"

# Tkinter GUI for displaying output
def display_output(output):

    root = tk.Tk()
    root.title("Blockly Execution Results")

    text_area = tk.Text(root, wrap=tk.WORD, width=60, height=20)
    text_area.pack(pady=10, padx=10)

    for line in output:
        text_area.insert(tk.END, line + '\n')

    close_button = tk.Button(root, text="Close", command=root.destroy)
    close_button.pack(pady=10)

    root.mainloop()


if __name__ == "__main__":
    process_csv()