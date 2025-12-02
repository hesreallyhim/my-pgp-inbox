# GPG Setup for GitHub (macOS)

By the end of this guide, you'll be able to sign your Git commits (showing a "Verified" badge on GitHub) and send/receive PGP-encrypted messages.

---

## Step 1: Install GPG Suite

Download and install [GPG Suite](https://gpgtools.org/). This extremely reliable and convenient application gives you GPG tools, a visual key manager, and Keychain integration so macOS remembers your passphrase.

>[!Tip]
GPG Keychain enables a _very_ frictionless PGP experience - most standard operations can be done straight from the Quick Actions menu.

## Step 2: Create Your Key

1. Open **GPG Keychain** (installed with [GPG Suite](https://gpgtools.org/))
2. Click **New** in the top-left
3. Enter your name and email address
4. Choose a strong passphrase and click **Generate Key**

>[!Note]
>Your email will be visible on your public key and in your commits. If this concerns you, use a dedicated email address solely for GitHub activity (or simply use your GitHub `noreply` address, but note that this enables commit-signing, but not private two-way communications).

## Step 3: Add Your Key to GitHub

1. In GPG Keychain, right-click your new key → **Copy**
2. Go to [GitHub → Settings → SSH and GPG Keys](https://github.com/settings/keys)
3. Click **New GPG key**, paste your **public key**, and save

## Step 4: Configure Git to Sign Commits

In Terminal:

```bash
# List your keys to find your key ID
gpg --list-secret-keys --keyid-format=long

# Find the line starting with "sec" — copy the ID after the slash
# Example: sec rsa4096/ABC123DEF456 → key ID is ABC123DEF456

# Configure Git
git config --global user.signingkey YOUR_KEY_ID
git config --global commit.gpgsign true
```

Make a test commit - you should now see the green **Verified** badge on GitHub (or run `git log --show-signature` to verify locally).

>[!Tip]
>Once you’re consistently signing commits, enabling GitHub’s Vigilant Mode helps detect if anyone tries to attribute unsigned commits to you.

## Step 5: Publish Your Key to a Keyserver

This lets others find your public key so they can send you encrypted messages (or verify your identity).

1. In GPG Keychain, right-click your key
2. Select **Send Public Key to Key Server**

Most GPG Suite installations send keys to [keys.openpgp.org](https://keys.openpgp.org/), which will email you a verification link. This publicly ties your key to your email address.

## Step 6: Import Someone Else's Key

To send an encrypted message to someone, you need their public key.

1. GitHub exposes keys at `https://github.com/<username>.gpg` - download or copy from there (the whole block of text)
2. In GPG Keychain, you can: (i) go to **File → Import** and select the file you downloaded; (ii) select **Edit → Import from Clipboard** if you copied it; or, if available, (iii) highlight the key, right-click, and use the Quick Action "Import from Collection" (so easy!).

Their key now appears in GPG Keychain. Then you can just write any text to a text editor → select the text → right-click → "Encrypt Selection" - and paste the content into an issue. We now have a **completely secure and private way to communicate** right out in the open.

---

**Done!** You can now sign commits and exchange encrypted messages.
