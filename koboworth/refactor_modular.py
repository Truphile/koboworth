import os
import shutil
import re

BASE_DIR = "/home/truphile/Documents/capstone/koboworth/backend/app"
TEST_DIR = "/home/truphile/Documents/capstone/koboworth/backend/tests"
ALEMBIC_ENV = "/home/truphile/Documents/capstone/koboworth/backend/alembic/env.py"

MODEL_MAP = {
    "worker.py": "worker",
    "collector.py": "collector",
    "group.py": "collector",
    "contribution.py": "worker",
    "trust_score.py": "scoring",
    "trust_passport.py": "passport",
    "lender.py": "lender",
    "loan.py": "lender",
    "consent_log.py": "consent",
    "audit_log.py": "admin",
    "complaint.py": "admin"
}

REPO_MAP = {
    "worker_repo.py": "worker",
    "collector_repo.py": "collector",
    "group_repo.py": "collector",
    "contribution_repo.py": "worker",
    "trust_score_repo.py": "scoring",
    "trust_passport_repo.py": "passport",
    "lender_repo.py": "lender",
    "loan_repo.py": "lender",
    "consent_log_repo.py": "consent",
    "audit_log_repo.py": "admin"
}

# 1. Create directories and move files
for model_file, module in MODEL_MAP.items():
    src = os.path.join(BASE_DIR, "shared", "models", model_file)
    if os.path.exists(src):
        dst_dir = os.path.join(BASE_DIR, "modules", module, "models")
        os.makedirs(dst_dir, exist_ok=True)
        init_file = os.path.join(dst_dir, "__init__.py")
        if not os.path.exists(init_file):
            open(init_file, "w").close()
        shutil.move(src, os.path.join(dst_dir, model_file))

for repo_file, module in REPO_MAP.items():
    src = os.path.join(BASE_DIR, "shared", "repositories", repo_file)
    if os.path.exists(src):
        dst_dir = os.path.join(BASE_DIR, "modules", module, "repositories")
        os.makedirs(dst_dir, exist_ok=True)
        init_file = os.path.join(dst_dir, "__init__.py")
        if not os.path.exists(init_file):
            open(init_file, "w").close()
        shutil.move(src, os.path.join(dst_dir, repo_file))

# 2. Update imports in all python files
def update_imports_in_file(filepath):
    with open(filepath, "r") as f:
        content = f.read()

    new_content = content

    for model_file, module in MODEL_MAP.items():
        base_name = model_file.replace(".py", "")
        
        # Replace absolute imports
        pattern = rf"app\.shared\.models\.{base_name}\b"
        replacement = f"app.modules.{module}.models.{base_name}"
        new_content = re.sub(pattern, replacement, new_content)

    for repo_file, module in REPO_MAP.items():
        base_name = repo_file.replace(".py", "")
        
        # Replace absolute imports
        pattern = rf"app\.shared\.repositories\.{base_name}\b"
        replacement = f"app.modules.{module}.repositories.{base_name}"
        new_content = re.sub(pattern, replacement, new_content)

    if new_content != content:
        with open(filepath, "w") as f:
            f.write(new_content)

for root, _, files in os.walk(BASE_DIR):
    for f in files:
        if f.endswith(".py"):
            update_imports_in_file(os.path.join(root, f))

for root, _, files in os.walk(TEST_DIR):
    for f in files:
        if f.endswith(".py"):
            update_imports_in_file(os.path.join(root, f))

# 3. Update alembic env.py
if os.path.exists(ALEMBIC_ENV):
    with open(ALEMBIC_ENV, "r") as f:
        env_content = f.read()

    new_imports = []
    for model_file, module in MODEL_MAP.items():
        base_name = model_file.replace(".py", "")
        # read the file to find the classes
        models_dir = os.path.join(BASE_DIR, "modules", module, "models")
        file_path = os.path.join(models_dir, model_file)
        if os.path.exists(file_path):
            with open(file_path, "r") as mf:
                mcontent = mf.read()
            classes = re.findall(r"^class ([A-Za-z0-9_]+)\(Base\):", mcontent, re.MULTILINE)
            if classes:
                new_imports.append(f"from app.modules.{module}.models.{base_name} import {', '.join(classes)}")
    
    if new_imports:
        env_content = env_content.replace(
            "from app.shared.models import *  # This imports all models so Alembic sees them",
            "\\n".join(new_imports)
        )
        with open(ALEMBIC_ENV, "w") as f:
            f.write(env_content)

# 4. Remove empty shared models/repos directories
shared_models_dir = os.path.join(BASE_DIR, "shared", "models")
shared_repos_dir = os.path.join(BASE_DIR, "shared", "repositories")
if os.path.exists(shared_models_dir):
    shutil.rmtree(shared_models_dir, ignore_errors=True)
if os.path.exists(shared_repos_dir):
    shutil.rmtree(shared_repos_dir, ignore_errors=True)

print("Refactoring complete.")
