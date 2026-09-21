"""
CIVIS — Cross-Platform Verification Runner
Runs backend verification and reports test suite metrics.
"""
import os
import sys
import subprocess

def main():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    api_dir = os.path.join(root, "apps", "api")
    
    print("=" * 60)
    print("CIVIS — SYSTEM VERIFICATION RUNNER")
    print("=" * 60)
    
    # Run standalone verification
    verifier = os.path.join(api_dir, "tests", "run_all_verifications.py")
    python_exe = sys.executable
    venv_python = os.path.join(api_dir, ".venv", "Scripts", "python.exe")
    if os.path.exists(venv_python):
        python_exe = venv_python
        
    print(f"\n[+] Executing: {verifier}")
    res = subprocess.run([python_exe, verifier], cwd=api_dir)
    if res.returncode != 0:
        print("\n[!] Verification failed.")
        sys.exit(res.returncode)
        
    print("\n[+] System verification complete: 100% passed.")

if __name__ == "__main__":
    main()
