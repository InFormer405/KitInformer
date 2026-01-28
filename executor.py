import json
import shutil
import time
import subprocess
import sys
from pathlib import Path

INBOX = Path("control/inbox")
RUNNING = Path("control/running")
DONE = Path("control/completed")
FAILED = Path("control/failed")
LOGS = Path("control/logs")

for p in [INBOX, RUNNING, DONE, FAILED, LOGS]:
    p.mkdir(parents=True, exist_ok=True)

def execute_task(task_file_path):
    """
    Invokes the run_task.py script with the actual task file path.
    Captures stdout/stderr and writes to the executor log.
    """
    log_file = LOGS / "executor.log"
    with open(log_file, "a") as log:
        log.write(f"--- Starting execution of {task_file_path.name} at {time.ctime()} ---\n")
        
        try:
            # Use sys.executable to ensure we use the same python interpreter
            result = subprocess.run(
                [sys.executable, "executor/run_task.py", str(task_file_path)],
                capture_output=True,
                text=True,
                check=True
            )
            log.write("STDOUT:\n" + result.stdout + "\n")
            if result.stderr:
                log.write("STDERR:\n" + result.stderr + "\n")
            log.write(f"--- Successfully finished {task_file_path.name} ---\n\n")
            return True
        except subprocess.CalledProcessError as e:
            log.write(f"ERROR: Execution failed with return code {e.returncode}\n")
            log.write("STDOUT:\n" + e.stdout + "\n")
            log.write("STDERR:\n" + e.stderr + "\n")
            log.write(f"--- Failed {task_file_path.name} ---\n\n")
            return False
        except Exception as e:
            log.write(f"UNEXPECTED ERROR: {str(e)}\n")
            log.write(f"--- Failed {task_file_path.name} ---\n\n")
            return False

def main_loop():
    print("Executor control plane is running. Watching control/inbox...")
    while True:
        # Sort to ensure predictable processing order if multiple files arrive
        for task_file in sorted(INBOX.glob("*.json")):
            target_path = RUNNING / task_file.name
            try:
                # Move to running
                shutil.move(str(task_file), str(target_path))
                
                # Execute using the real file path
                success = execute_task(target_path)

                if success:
                    shutil.move(str(target_path), str(DONE / task_file.name))
                else:
                    shutil.move(str(target_path), str(FAILED / task_file.name))
                    
            except Exception as e:
                # Fallback for filesystem errors during move/cleanup
                if target_path.exists():
                    shutil.move(str(target_path), str(FAILED / task_file.name))
                with open(LOGS / "errors.log", "a") as log:
                    log.write(f"Filesystem error at {time.ctime()}: {str(e)}\n")

        time.sleep(2)

if __name__ == "__main__":
    main_loop()

# HOW TO USE:
# 1. Start the executor:
#    python executor.py
#
# 2. Drop a test task into control/inbox:
#    echo '{"task_id": "test-001", "description": "Verify executor works", "actions": [{"type": "report"}]}' > control/inbox/test.json
#
# 3. Check results:
#    - See if it moved to control/completed
#    - Read logs in control/logs/executor.log
