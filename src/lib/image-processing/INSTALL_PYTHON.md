# 🐍 Install Python for Strikethrough Removal

## 📥 **Step 1: Download Python**

1. **Go to:** https://www.python.org/downloads/
2. **Click:** "Download Python 3.12.x" (latest version)
3. **Save** the installer file

## ⚙️ **Step 2: Install Python (CRITICAL SETTINGS)**

1. **Run** the downloaded installer as Administrator
2. **✅ VERY IMPORTANT**: Check "Add Python to PATH" at the bottom
3. **✅ ALSO CHECK**: "Add Python to environment variables" 
4. Click **"Install Now"**
5. Wait for installation to complete
6. Click **"Close"**

## 🔄 **Step 3: Restart Your Terminal/IDE**

**CRITICAL**: You must restart:
- ✅ Your terminal/command prompt
- ✅ VS Code or your IDE  
- ✅ Your Node.js development server

## ✅ **Step 4: Verify Installation**

Open a **NEW** terminal and run:
```bash
python --version
```

Should show: `Python 3.12.x` (or similar)

## 📦 **Step 5: Install OpenCV Dependencies**

Still in terminal:
```bash
cd src/lib/image-processing
pip install opencv-python numpy Pillow
```

## 🎯 **Step 6: Test Strikethrough Removal**

Now try uploading your PDF again - it should work!

---

## 🛠️ **Troubleshooting**

### "python is not recognized as an internal or external command"
- ❌ You didn't check "Add Python to PATH" during installation
- ✅ **Solution**: Uninstall Python, reinstall with PATH checked

### "Microsoft Store opens when I type python"
- ❌ Windows is redirecting to Store instead of real Python
- ✅ **Solution**: 
  1. Go to Settings → Apps → App execution aliases
  2. Turn OFF "App Installer" for python.exe and python3.exe
  3. Or install from python.org instead of Microsoft Store

### Still not working?
Try these commands in order:
```bash
py --version
python3 --version  
python --version
```

One of these should work after proper installation.

---

## 🚀 **Alternative: Quick Install Commands**

If you have Windows Package Manager:
```bash
winget install Python.Python.3.12
```

Or with Chocolatey:
```bash
choco install python
```

**Remember: Always restart your terminal after installation!** 