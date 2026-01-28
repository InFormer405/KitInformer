import json
import sys
import os
import re

def search_files(directory, pattern):
    results = []
    if not os.path.exists(directory):
        return f"Directory {directory} not found."
    
    for root, _, files in os.walk(directory):
        for file in files:
            file_path = os.path.join(root, file)
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    for line_num, line in enumerate(f, 1):
                        if pattern in line:
                            results.append({"file": file_path, "line": line_num, "content": line.strip()})
            except Exception:
                continue
    return results

def extract_values(file_path, regex_pattern):
    if not os.path.exists(file_path):
        return f"File {file_path} not found."
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            matches = re.findall(regex_pattern, content)
            return matches
    except Exception as e:
        return str(e)

def main():
    if len(sys.argv) < 2:
        print("Usage: python run_task.py <json_file_path>")
        sys.exit(1)

    json_path = sys.argv[1]
    if not os.path.exists(json_path):
        print(f"Error: JSON file {json_path} not found.")
        sys.exit(1)

    try:
        with open(json_path, 'r') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error parsing JSON: {e}")
        sys.exit(1)

    task_id = data.get("task_id", "N/A")
    description = data.get("description", "No description provided.")
    
    # Validation logic
    actions = data.get("actions")
    if actions is None:
        print("Validation Error: 'actions' field is missing.", file=sys.stderr)
        sys.exit(1)
    if not isinstance(actions, list):
        print("Validation Error: 'actions' must be a list.", file=sys.stderr)
        sys.exit(1)
    for i, action in enumerate(actions):
        if not isinstance(action, dict):
            print(f"Validation Error: Action at index {i} must be an object.", file=sys.stderr)
            sys.exit(1)
        if "type" not in action:
            print(f"Validation Error: Action at index {i} is missing 'type' field.", file=sys.stderr)
            sys.exit(1)

    print(f"Starting Task ID: {task_id}")
    print(f"Description: {description}\n")
    report_data = []

    for action in actions:
        action_type = action.get("type")
        params = action.get("parameters", {})

        if action_type == "search_files":
            result = search_files(params.get("directory", "."), params.get("pattern", ""))
            report_data.append({"action": "search_files", "result": result})
        
        elif action_type == "extract_values":
            result = extract_values(params.get("file_path"), params.get("pattern", ""))
            report_data.append({"action": "extract_values", "result": result})

        elif action_type == "report":
            print("--- Execution Report ---")
            print(json.dumps(report_data, indent=2))
            print("------------------------")

    print("\nSuccess: Executor is ready.")

if __name__ == "__main__":
    main()
