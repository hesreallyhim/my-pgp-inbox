# GPG Setup for GitHub (Windows)

By the end of this guide, you’ll be able to sign commits and exchange encrypted messages.

---

## Step 1: Install Gpg4win

Download and install Gpg4win￼.

It includes:

- Kleopatra (graphical key manager)

- GnuPG (command-line tools)

- Optional Outlook integration

Kleopatra is the Windows equivalent of GPG Keychain.

---

## Step 2: Create Your Key 

1. Open Kleopatra 

2. Click File → New Key Pair 

3. Choose Create a personal OpenPGP key pair 

4. Enter your name and email 

5. Set a strong passphrase → Create

>[!Note]
>Your email becomes part of your public key and appears in signed commits.
>Use a dedicated email address if you prefer (or your GitHub noreply address — this enables commit-signing but not two-way private communication).

---

## Step 3: Add Your Key to GitHub 

1. In Kleopatra, right-click your key → Export… → Export OpenPGP Certificates 

2. Open the exported .asc file in a text editor and copy the contents 

3. Go to GitHub → Settings → SSH and GPG Keys 

4. Click New GPG key → paste → save

---

## Step 4: Configure Git to Sign Commits

Open PowerShell or Command Prompt:

```sh
gpg --list-secret-keys --keyid-format=long

# Find the "sec" line and copy the part after the slash:

# Example: sec rsa4096/ABC123DEF456 → key ID = ABC123DEF456

git config --global user.signingkey YOUR_KEY_ID
git config --global commit.gpgsign true
```

Make a test commit to confirm the Verified badge.

---

## Step 5: Publish Your Key (Optional but Recommended)

Kleopatra → right-click your key → Publish on Server.

On first upload to [keys.openpgp.org](https://keys.openpgp.org), you’ll receive a verification email.

---

## Step 6: Import Someone Else’s Key 

1. Download or copy from: `https://github.com/<username>.gpg `

2. Kleopatra → Import…

You can now encrypt text via Kleopatra’s Sign/Encrypt window.
