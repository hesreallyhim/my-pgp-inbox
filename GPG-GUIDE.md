# GPG Setup for GitHub (macOS)

By the end of this guide, you'll be able to sign your Git commits (showing a "Verified" badge on GitHub) and send/receive PGP-encrypted messages.

---

## Step 1: Install GPG Suite

Download and install [GPG Suite](https://gpgtools.org/). This extremely reliable and convenient application gives you GPG tools, a visual key manager, and Keychain integration so macOS remembers your passphrase.

## Step 2: Create Your Key

1. Open **GPG Keychain** (installed with GPG Suite)
2. Click **New** in the top-left
3. Enter your name and email address
4. Choose a strong passphrase and click **Generate Key**

>[!Note]
>Your email will be visible on your public key and in your commits. If this concerns you, use a dedicated email address solely for GitHub activity, or simply use GitHub's `noreply` private email address for your account when creating your key.

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

Make a test commit - you should now see the green **Verified** badge on GitHub (or run `git log --show-signature` locally to verify).

>[!Tip]
>For even stronger protection, once you're in the habit of signing your commits (which requires almost no effort after initial setup), you may choose to enable "Vigilant Mode" (under "SSH and GPG keys") to flag any unsigned commits that are attributed you as "Unverified" - this helps you quickly spot if someone is trying to spoof your identity in commit messages.

## Step 5: Publish Your Key to a Keyserver

This lets others find your public key so they can send you encrypted messages (or verify your identity).

1. In GPG Keychain, right-click your key
2. Select **Send Public Key to Key Server**

Your key is now published to `keys.openpgp.org`. You'll receive a verification email - click the link to complete publishing. This ties your key to your email address so no one can impersonate your identity.

## Step 6: Import Someone Else's Key

To send an encrypted message to someone, you need their public key.

1. GitHub publishes keys at `https://github.com/<username>.gpg` - download or copy from there (the whole block of text)
2. In GPG Keychain, go to **File → Import** and select the file (or **Edit → Import from Clipboard** if you copied it)
3. Alternatively, you can do it all without leaving your browser - just highlight the whole public key text, right click → "Import key from selection" and you're done!

Their key now appears in GPG Keychain, which you can also connenct to your macOS Keychain for maximum ease and protection. Then you can just write your message to me in any text editor → right-click → "Encrypt selection" - and paste the content into an issue. We now have a **completely secure and private way to communicate** right out in the open.

---

**Done!** You can now sign commits and exchange encrypted messages.
