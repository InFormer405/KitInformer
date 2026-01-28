import json
import shutil
import time
from pathlib import Path

INBOX = Path("control/inbox")
RUNNING = Path("control/running")
DONE = Path("control/completed")
FAILED = Path("control/failed")
LOGS = Path("control/logs")

for p in [INBOX, RUNNING, DONE, FAILED, LOGS]:
    p.mkdir(parents=True, exist_ok=True)

def load_task(task_path):
    with open(task_path) as f:
        return json.load(f)

def execute_task(task):
    # Placeholder executor logic
    # Real actions will be added incrementally
    with open(LOGS / "executor.log", "a") as log:
        log.write(f"Executed task: {task['task_id']}\n")

def main_loop():
    while True:
        for task_file in INBOX.glob("*.json"):
            try:
                shutil.move(task_file, RUNNING / task_file.name)
                task = load_task(RUNNING / task_file.name)

                execute_task(task)

                shutil.move(RUNNING / task_file.name, DONE / task_file.name)
            except Exception as e:
                shutil.move(RUNNING / task_file.name, FAILED / task_file.name)
                with open(LOGS / "errors.log", "a") as log:
                    log.write(str(e) + "\n")

        time.sleep(2)

if __name__ == "__main__":
    main_loop()
