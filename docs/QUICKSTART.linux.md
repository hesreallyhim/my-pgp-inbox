# GPG Setup for GitHub (Linux)

Most Linux distributions already ship GnuPG.
You only need a GUI if you prefer one.

---

## Step 1: Install GnuPG (if not already installed)

Debian/Ubuntu:

```sh
sudo apt install gnupg
```

Fedora:

```sh
sudo dnf install gnupg2
```

Arch:

```sh
sudo pacman -S gnupg
```

For a graphical key manager:

- KGpg (KDE)

- Seahorse (GNOME) — integrates with Keyring

---

Step 2: Create Your Key

From a terminal:

```sh
gpg --full-generate-key
```

Choose:

- RSA and RSA (default)

- Key size (4096 recommended)

- Expiration (optional)

- Your name and email

> [!Note]
> Your email will be visible on your public key and in your commits. If this concerns you, use a dedicated email address solely for GitHub activity (or simply use your GitHub `noreply` address, but note that this enables commit-signing, but not private two-way communications).

GnuPG will prompt you for a passphrase.

---

## Step 3: Add Your Key to GitHub

Export your public key:

```sh
gpg --armor --export YOUR_EMAIL_OR_KEYID
```

Copy the output → paste into GitHub → Settings → SSH and GPG Keys → New GPG key.

---

## Step 4: Configure Git to Sign Commits

```sh
gpg --list-secret-keys --keyid-format=long
git config --global user.signingkey YOUR_KEY_ID
git config --global commit.gpgsign true
```

---

## Step 5: Publish Your Key (Optional)

```sh
gpg --send-keys YOUR_KEY_ID
```

Most distributions default to HKP keyservers.
For [keys.openpgp.org](https://keys.openpgp.org), see their docs for email verification.

---

## Step 6: Import Another User’s Key

Download or copy from:

`https://github.com/<username>.gpg`

Then:

```sh
gpg --import FILE.asc
```

Encryption example:

```sh
gpg --encrypt --armor --recipient THEIR_KEY_ID message.txt
```

Paste the resulting ciphertext wherever you like (issues, chat, etc.).
