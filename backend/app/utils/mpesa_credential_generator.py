"""
M-PESA Security Credential Generator

This utility generates encrypted security credentials for M-PESA B2C API.
The security credential is created by encrypting your initiator password
with Safaricom's public certificate.

Usage:
    python -m backend.app.utils.mpesa_credential_generator

Requirements:
    - PyCryptodome package
    - Safaricom production certificate (cert.cer)

Documentation:
    https://developer.safaricom.co.ke/Documentation
"""

import base64
import os
import sys
from pathlib import Path
from typing import Optional

try:
    from Crypto.PublicKey import RSA
    from Crypto.Cipher import PKCS1_v1_5
except ImportError:
    print("Error: PyCryptodome package is required.")
    print("Install it with: pip install pycryptodome")
    sys.exit(1)


# Safaricom sandbox certificate (for testing)
SANDBOX_CERTIFICATE = """-----BEGIN CERTIFICATE-----
MIIGkzCCBXugAwIBAgIKXfBp5gAAAD+hNjANBgkqhkiG9w0BAQsFADBbMRMwEQYK
CZImiZPyLGQBGRYDbmV0MRkwFwYKCZImiZPyLGQBGRYJc2FmYXJpY29tMSkwJwYD
VQQDEyBTYWZhcmljb20gSW50ZXJuYWwgSXNzdWluZyBDQSAwMjAeFw0xNzA0MjUx
NjA3MjRaFw0xODAzMjUxNjA3MjRaMIGNMQswCQYDVQQGEwJLRTEQMA4GA1UECBMH
TmFpcm9iaTEQMA4GA1UEBxMHTmFpcm9iaTEaMBgGA1UEChMRU2FmYXJpY29tIExp
bWl0ZWQxEzARBgNVBAsTClRlY2hub2xvZ3kxKTAnBgNVBAMTIGFwaWdlZS5hcGlj
YWxsZXIuc2FmYXJpY29tLmNvLmtlMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIB
CgKCAQEAoknIb5Tm1hxOVdFsOejAs6veAai32Zv442BLuOGkFKUeCUM2h08l05nI
iJRfZmdNBb37K3VQJ9Ff6R6z1YP9HPAQZRM0TYg1dxw23X6Wg7IJ3sMmFqKsjqLb
+1++Uc/K6RYMg1JfvQwV8iN+CQxAG6wPD1IFJXkQXsAZsAn8LG2u6wDZfI98rXW3
gAAAAAAAAAAAAAAAAAAAAAAAAA==
-----END CERTIFICATE-----"""


def load_certificate(cert_path: Optional[str] = None) -> RSA.RsaKey:
    """
    Load RSA public key from certificate file
    
    Args:
        cert_path: Path to certificate file. If None, uses sandbox certificate.
        
    Returns:
        RSA public key object
    """
    if cert_path and os.path.exists(cert_path):
        print(f"Loading certificate from: {cert_path}")
        with open(cert_path, 'r') as f:
            cert_data = f.read()
    else:
        if cert_path:
            print(f"Warning: Certificate file not found: {cert_path}")
            print("Using sandbox certificate instead...")
        else:
            print("Using sandbox certificate...")
        cert_data = SANDBOX_CERTIFICATE
    
    # Extract public key from certificate
    try:
        # Try to load as RSA key directly
        key = RSA.import_key(cert_data)
        return key
    except Exception as e:
        print(f"Error loading certificate: {e}")
        print("\nMake sure you're using a valid X.509 certificate in PEM format.")
        sys.exit(1)


def encrypt_credential(password: str, certificate_path: Optional[str] = None) -> str:
    """
    Encrypt initiator password with Safaricom's public certificate
    
    Args:
        password: Initiator password to encrypt
        certificate_path: Path to Safaricom's certificate file
        
    Returns:
        Base64 encoded encrypted credential
    """
    # Load certificate
    public_key = load_certificate(certificate_path)
    
    # Create cipher
    cipher = PKCS1_v1_5.new(public_key)
    
    # Encrypt password
    encrypted = cipher.encrypt(password.encode('utf-8'))
    
    # Encode to base64
    credential = base64.b64encode(encrypted).decode('utf-8')
    
    return credential


def download_production_certificate():
    """
    Download Safaricom production certificate
    
    Note: This is a helper function. In production, download the certificate
    manually from the Safaricom developer portal.
    """
    print("\n" + "="*70)
    print("DOWNLOAD PRODUCTION CERTIFICATE")
    print("="*70)
    print("\nTo get the production certificate:")
    print("1. Log in to https://developer.safaricom.co.ke/")
    print("2. Go to 'Resources' > 'Certificates'")
    print("3. Download 'Production Certificate' (SandboxCertificate.cer or ProductionCertificate.cer)")
    print("4. Save it in your project root directory")
    print("\nOr download directly from:")
    print("https://developer.safaricom.co.ke/api/v1/security/credentials/publicKey")
    print("="*70 + "\n")


def interactive_mode():
    """
    Interactive mode for generating security credentials
    """
    print("\n" + "="*70)
    print("M-PESA SECURITY CREDENTIAL GENERATOR")
    print("="*70 + "\n")
    
    print("This tool generates encrypted security credentials for M-PESA B2C API.")
    print("The credential is created by encrypting your initiator password")
    print("with Safaricom's public certificate.\n")
    
    # Ask for environment
    print("Select environment:")
    print("1. Sandbox (for testing)")
    print("2. Production")
    choice = input("\nEnter choice (1 or 2): ").strip()
    
    if choice == "1":
        environment = "sandbox"
        cert_path = None
        print("\nUsing sandbox environment...")
        print("Default initiator password: 'Safaricom999!*!'")
        password = input("Enter initiator password [Safaricom999!*!]: ").strip()
        if not password:
            password = "Safaricom999!*!"
    elif choice == "2":
        environment = "production"
        print("\nUsing production environment...")
        download_production_certificate()
        
        cert_path = input("Enter path to production certificate [./ProductionCertificate.cer]: ").strip()
        if not cert_path:
            cert_path = "./ProductionCertificate.cer"
        
        if not os.path.exists(cert_path):
            print(f"\nError: Certificate file not found: {cert_path}")
            print("Please download the certificate first and try again.")
            sys.exit(1)
        
        password = input("Enter your production initiator password: ").strip()
        
        if not password:
            print("\nError: Password cannot be empty for production.")
            sys.exit(1)
    else:
        print("Invalid choice. Exiting.")
        sys.exit(1)
    
    # Generate credential
    print("\nGenerating security credential...")
    try:
        credential = encrypt_credential(password, cert_path)
        
        print("\n" + "="*70)
        print("SUCCESS!")
        print("="*70)
        print(f"\nEnvironment: {environment}")
        print(f"\nYour encrypted security credential:\n")
        print(credential)
        print("\n" + "="*70)
        
        # Show how to use it
        print("\nHow to use this credential:")
        print("\n1. Copy the credential above")
        print("2. Add it to your .env file:")
        print(f"   MPESA_SECURITY_CREDENTIAL={credential}")
        print("\n3. For B2C requests, the service will use this credential automatically")
        print("\nIMPORTANT: Keep this credential secure! Never commit it to version control.")
        print("="*70 + "\n")
        
    except Exception as e:
        print(f"\nError generating credential: {e}")
        sys.exit(1)


def generate_credential_cli(password: str, cert_path: Optional[str] = None) -> str:
    """
    Command-line interface for generating credentials
    
    Args:
        password: Initiator password
        cert_path: Path to certificate file
        
    Returns:
        Encrypted credential
    """
    return encrypt_credential(password, cert_path)


def main():
    """
    Main entry point
    """
    # Check if running with command-line arguments
    if len(sys.argv) > 1:
        if sys.argv[1] in ['-h', '--help']:
            print(__doc__)
            print("\nUsage:")
            print("  Interactive mode:")
            print("    python -m backend.app.utils.mpesa_credential_generator")
            print("\n  Command-line mode:")
            print("    python -m backend.app.utils.mpesa_credential_generator <password> [cert_path]")
            print("\nExamples:")
            print("  # Sandbox")
            print("  python -m backend.app.utils.mpesa_credential_generator 'Safaricom999!*!'")
            print("\n  # Production")
            print("  python -m backend.app.utils.mpesa_credential_generator 'MySecretPass' './ProductionCertificate.cer'")
            sys.exit(0)
        
        # Command-line mode
        password = sys.argv[1]
        cert_path = sys.argv[2] if len(sys.argv) > 2 else None
        
        try:
            credential = generate_credential_cli(password, cert_path)
            print(credential)
        except Exception as e:
            print(f"Error: {e}", file=sys.stderr)
            sys.exit(1)
    else:
        # Interactive mode
        interactive_mode()


if __name__ == "__main__":
    main()

