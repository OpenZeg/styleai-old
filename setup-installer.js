#!/usr/bin/env node

/**
 * StyleAI Installer Setup Script
 * Automatically creates installer folder, copies files, and installs dependencies
 * Run: node setup-installer.js
 */

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = process.cwd();
const installerDir = path.join(projectRoot, 'installer');

console.log('🚀 StyleAI Installer Setup\n');

// Step 1: Create installer directory
console.log('📁 Creating installer directory...');
fs.ensureDirSync(installerDir);
console.log('   ✓ Installer directory ready\n');

// Step 2: Create installer-ui.html
console.log('📝 Creating installer UI...');
const installerUI = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>StyleAI Installation</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Outfit:wght@400;500;600&display=swap');

    :root {
      --primary: #2D1B4E;
      --secondary: #D4A574;
      --accent: #F5E6D3;
      --text-dark: #1A1A1A;
      --text-light: #6B6B6B;
      --border: #E8DCC8;
      --success: #6B9E7F;
      --background: #FEFAF3;
    }

    html, body {
      height: 100%;
      width: 100%;
      background: var(--background);
      font-family: 'Outfit', sans-serif;
      color: var(--text-dark);
      overflow: hidden;
    }

    body {
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #FEFAF3 0%, #F5E6D3 100%);
    }

    .installer-container {
      width: 100%;
      height: 100%;
      max-width: 800px;
      max-height: 600px;
      background: white;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 60px rgba(45, 27, 78, 0.15);
      border-radius: 20px;
      overflow: hidden;
      animation: fadeIn 0.6s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .installer-header {
      background: linear-gradient(135deg, #2D1B4E 0%, #4A2E7F 100%);
      padding: 60px 50px;
      color: white;
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .installer-header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(212, 165, 116, 0.1) 0%, transparent 70%);
      border-radius: 50%;
    }

    .installer-logo {
      width: 64px;
      height: 64px;
      margin: 0 auto 16px;
      animation: slideDown 0.8s ease-out;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .installer-logo img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .installer-title {
      font-family: 'Playfair Display', serif;
      font-size: 36px;
      font-weight: 700;
      margin-bottom: 12px;
      letter-spacing: -0.5px;
    }

    .installer-subtitle {
      font-size: 14px;
      opacity: 0.9;
      font-weight: 400;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .installer-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 50px;
      overflow-y: auto;
    }

    .stage {
      display: none;
      opacity: 0;
      animation: fadeInUp 0.6s ease-out forwards;
    }

    .stage.active {
      display: block;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .stage-welcome h2 {
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      margin-bottom: 20px;
      color: var(--primary);
    }

    .stage-welcome p {
      line-height: 1.8;
      color: var(--text-light);
      margin-bottom: 16px;
      font-size: 15px;
    }

    .feature-list {
      margin: 30px 0;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .feature-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 12px;
      border-left: 3px solid var(--secondary);
      background: rgba(212, 165, 116, 0.05);
      border-radius: 4px;
      animation: slideInLeft 0.6s ease-out backwards;
    }

    .feature-item:nth-child(1) { animation-delay: 0.1s; }
    .feature-item:nth-child(2) { animation-delay: 0.2s; }
    .feature-item:nth-child(3) { animation-delay: 0.3s; }

    @keyframes slideInLeft {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .feature-icon {
      font-size: 20px;
      min-width: 24px;
      color: var(--secondary);
    }

    .feature-text {
      font-size: 14px;
      color: var(--text-light);
      line-height: 1.6;
    }

    .installation-progress {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .progress-item {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .progress-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--accent);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      color: var(--primary);
      flex-shrink: 0;
      transition: all 0.3s ease;
    }

    .progress-item.completed .progress-icon {
      background: var(--success);
      color: white;
    }

    .progress-item.active .progress-icon {
      background: var(--secondary);
      color: white;
      animation: pulse 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% {
        box-shadow: 0 0 0 0 rgba(212, 165, 116, 0.7);
      }
      50% {
        box-shadow: 0 0 0 10px rgba(212, 165, 116, 0);
      }
    }

    .progress-text {
      flex: 1;
    }

    .progress-label {
      font-weight: 600;
      color: var(--text-dark);
      font-size: 14px;
      margin-bottom: 4px;
    }

    .progress-bar-container {
      height: 4px;
      background: var(--accent);
      border-radius: 2px;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--secondary), var(--primary));
      width: 0%;
      border-radius: 2px;
      transition: width 0.6s ease;
    }

    .completion-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 30px;
      background: rgba(107, 158, 127, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 48px;
      animation: scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .completion-icon img {
      width: 60%;
      height: 60%;
      object-fit: contain;
    }

    @keyframes scaleIn {
      from {
        transform: scale(0);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }

    .stage-complete h2 {
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      text-align: center;
      margin-bottom: 16px;
      color: var(--primary);
    }

    .stage-complete p {
      text-align: center;
      color: var(--text-light);
      margin-bottom: 30px;
      font-size: 15px;
    }

    .installer-footer {
      padding: 30px 50px;
      border-top: 1px solid var(--border);
      display: flex;
      gap: 16px;
      justify-content: flex-end;
      background: white;
    }

    button {
      padding: 12px 32px;
      border: none;
      border-radius: 8px;
      font-family: 'Outfit', sans-serif;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      letter-spacing: 0.5px;
    }

    .btn-secondary {
      background: var(--accent);
      color: var(--primary);
      border: 1px solid var(--border);
    }

    .btn-secondary:hover {
      background: var(--border);
      transform: translateY(-2px);
    }

    .btn-primary {
      background: linear-gradient(135deg, #2D1B4E 0%, #4A2E7F 100%);
      color: white;
      box-shadow: 0 8px 24px rgba(45, 27, 78, 0.2);
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(45, 27, 78, 0.3);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-success {
      background: var(--success);
      color: white;
    }

    .btn-success:hover {
      background: #5a8d6e;
      transform: translateY(-2px);
    }

    @media (max-width: 900px) {
      .installer-container {
        max-width: 95vw;
        max-height: 95vh;
        border-radius: 12px;
      }

      .installer-header {
        padding: 40px 30px;
      }

      .installer-title {
        font-size: 28px;
      }

      .installer-content {
        padding: 30px;
      }

      .installer-footer {
        padding: 20px 30px;
      }
    }
  </style>
</head>
<body>
  <div class="installer-container">
    <div class="installer-header">
      <div class="installer-logo">
        <img src="assets/style.ico" alt="StyleAI" />
      </div>
      <div class="installer-title">StyleAI</div>
      <div class="installer-subtitle">AI Fashion Assistant</div>
    </div>

    <div class="installer-content">
      <div class="stage stage-welcome active" data-stage="welcome">
        <h2>Welcome to StyleAI</h2>
        <p>Your AI-powered fashion assistant is ready to transform your wardrobe.</p>
        
        <div class="feature-list">
          <div class="feature-item">
            <div class="feature-icon">👔</div>
            <div class="feature-text"><strong>Unlimited Wardrobe</strong> — Build and organize your virtual closet with AI-powered categorization</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🎨</div>
            <div class="feature-text"><strong>Smart Styling</strong> — Get AI-generated outfit recommendations based on your preferences</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🛍️</div>
            <div class="feature-text"><strong>Direct Shopping</strong> — Discover and purchase items directly from the app</div>
          </div>
        </div>
      </div>

      <div class="stage stage-installing" data-stage="installing">
        <div class="installation-progress">
          <div class="progress-item active" data-step="1">
            <div class="progress-icon">📦</div>
            <div class="progress-text">
              <div class="progress-label">Preparing Installation</div>
              <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: 0%"></div>
              </div>
            </div>
          </div>

          <div class="progress-item" data-step="2">
            <div class="progress-icon">⚙️</div>
            <div class="progress-text">
              <div class="progress-label">Installing Files</div>
              <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: 0%"></div>
              </div>
            </div>
          </div>

          <div class="progress-item" data-step="3">
            <div class="progress-icon">🔧</div>
            <div class="progress-text">
              <div class="progress-label">Configuring System</div>
              <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: 0%"></div>
              </div>
            </div>
          </div>

          <div class="progress-item" data-step="4">
            <div class="progress-icon">✓</div>
            <div class="progress-text">
              <div class="progress-label">Creating Shortcuts</div>
              <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: 0%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="stage stage-complete" data-stage="complete">
        <div class="completion-icon">
          <img src="assets/style.ico" alt="StyleAI" />
        </div>
        <h2>Installation Complete</h2>
        <p>StyleAI has been successfully installed on your computer.</p>
        <p style="font-size: 13px; color: var(--text-light);">v6.0.0 • Ready to use</p>
      </div>
    </div>

    <div class="installer-footer">
      <button class="btn-secondary" id="btn-cancel">Cancel</button>
      <button class="btn-primary" id="btn-next">Install</button>
    </div>
  </div>

  <script>
    const state = {
      currentStage: 'welcome',
      installing: false,
      currentStep: 1,
      maxSteps: 4
    };

    const elements = {
      stages: document.querySelectorAll('.stage'),
      btnNext: document.getElementById('btn-next'),
      btnCancel: document.getElementById('btn-cancel'),
      progressItems: document.querySelectorAll('.progress-item')
    };

    elements.btnNext.addEventListener('click', handleNext);
    elements.btnCancel.addEventListener('click', handleCancel);

    function handleNext() {
      if (state.currentStage === 'welcome') {
        startInstallation();
      } else if (state.currentStage === 'complete') {
        launchApp();
      }
    }

    function handleCancel() {
      if (state.installing) return;
      
      if (state.currentStage === 'complete') {
        window.close();
      } else {
        if (window.ipcRenderer) {
          window.ipcRenderer.send('installer:cancel');
        }
        window.close();
      }
    }

    function switchStage(stageName) {
      elements.stages.forEach(stage => {
        stage.classList.remove('active');
      });

      const targetStage = document.querySelector(\`[data-stage="\${stageName}"]\`);
      if (targetStage) {
        targetStage.classList.add('active');
      }

      state.currentStage = stageName;
      updateButtons();
    }

    function updateButtons() {
      const btnNext = elements.btnNext;
      const btnCancel = elements.btnCancel;

      switch (state.currentStage) {
        case 'welcome':
          btnNext.textContent = 'Install';
          btnNext.className = 'btn-primary';
          btnNext.disabled = false;
          btnCancel.style.display = 'block';
          break;
        case 'installing':
          btnNext.disabled = true;
          btnCancel.disabled = true;
          break;
        case 'complete':
          btnNext.textContent = 'Launch StyleAI';
          btnNext.className = 'btn-success';
          btnNext.disabled = false;
          btnCancel.textContent = 'Finish';
          break;
      }
    }

    function startInstallation() {
      state.installing = true;
      switchStage('installing');
      simulateInstallation();
    }

    function simulateInstallation() {
      let step = 1;
      const steps = [
        { duration: 1500, label: 'Preparing Installation' },
        { duration: 2000, label: 'Installing Files' },
        { duration: 1800, label: 'Configuring System' },
        { duration: 1200, label: 'Creating Shortcuts' }
      ];

      const executeStep = (stepIndex) => {
        if (stepIndex >= steps.length) {
          completeInstallation();
          return;
        }

        const progressItem = document.querySelector(\`[data-step="\${stepIndex + 1}"]\`);
        if (!progressItem) {
          executeStep(stepIndex + 1);
          return;
        }

        document.querySelectorAll('.progress-item').forEach((item, idx) => {
          item.classList.remove('active', 'completed');
          if (idx < stepIndex) {
            item.classList.add('completed');
          } else if (idx === stepIndex) {
            item.classList.add('active');
          }
        });

        const progressBar = progressItem.querySelector('.progress-bar-fill');
        const step = steps[stepIndex];
        
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 30;
          if (progress > 100) progress = 100;
          progressBar.style.width = progress + '%';

          if (progress >= 100) {
            clearInterval(interval);
            if (window.ipcRenderer) {
              window.ipcRenderer.send('installer:step', { step: stepIndex + 1 });
            }
            setTimeout(() => executeStep(stepIndex + 1), 300);
          }
        }, step.duration / 60);
      };

      executeStep(0);
    }

    function completeInstallation() {
      state.installing = false;
      
      document.querySelectorAll('.progress-item').forEach(item => {
        item.classList.remove('active');
        item.classList.add('completed');
      });

      document.querySelectorAll('.progress-bar-fill').forEach(bar => {
        bar.style.width = '100%';
      });

      setTimeout(() => {
        switchStage('complete');
        
        if (window.ipcRenderer) {
          window.ipcRenderer.send('installer:complete');
        }
      }, 800);
    }

    function launchApp() {
      if (window.ipcRenderer) {
        window.ipcRenderer.send('installer:launch');
      }
      setTimeout(() => window.close(), 500);
    }

    window.addEventListener('resize', () => {
      // Responsive adjustments if needed
    });
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(installerDir, 'installer-ui.html'), installerUI);
console.log('   ✓ Installer UI created\n');

// Step 3: Create installer-main.js
console.log('⚙️  Creating installer main process...');
const installerMain = `const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const { execSync } = require('child_process');

const platform = process.platform;
const isWindows = platform === 'win32';
const isMac = platform === 'darwin';
const isLinux = platform === 'linux';

const appDataDir = path.join(os.homedir(), '.styleai');
const installDir = isWindows
  ? path.join(process.env.ProgramFiles, 'StyleAI')
  : isMac
  ? path.join(os.homedir(), 'Applications', 'StyleAI.app')
  : path.join(os.homedir(), '.local', 'share', 'styleai');

const sourceDir = path.join(__dirname, '..');
let installerWindow;

function createInstallerWindow() {
  installerWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 600,
    minHeight: 500,
    icon: path.join(__dirname, 'assets', 'style.png'),
    frame: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'installer-preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      sandbox: true,
      nodeIntegration: false
    }
  });

  installerWindow.loadFile(path.join(__dirname, 'installer-ui.html'));
  Menu.setApplicationMenu(null);

  installerWindow.once('ready-to-show', () => {
    installerWindow.show();
  });

  installerWindow.on('closed', () => {
    installerWindow = null;
    app.quit();
  });

  if (process.env.DEBUG) {
    installerWindow.webContents.openDevTools();
  }
}

ipcMain.handle('installer:step', async (event, data) => {
  const { step } = data;
  try {
    switch (step) {
      case 1:
        await prepareInstallation();
        break;
      case 2:
        await installFiles();
        break;
      case 3:
        await configureSystem();
        break;
      case 4:
        await createShortcuts();
        break;
    }
    return { success: true };
  } catch (error) {
    console.error(\`Installation step \${step} failed:\`, error);
    dialog.showErrorBox('Installation Error', \`Failed at step \${step}: \${error.message}\`);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('installer:cancel', () => {
  console.log('Installation cancelled');
  app.quit();
});

ipcMain.handle('installer:complete', async () => {
  console.log('Installation completed successfully');
});

ipcMain.handle('installer:launch', async () => {
  try {
    if (isWindows) {
      const exePath = path.join(installDir, 'StyleAI.exe');
      require('child_process').spawn(exePath, {
        detached: true,
        stdio: 'ignore'
      }).unref();
    } else if (isMac) {
      execSync(\`open "\${path.join(installDir, 'StyleAI.app')}"\`);
    } else {
      const exePath = path.join(installDir, 'styleai');
      require('child_process').spawn(exePath, {
        detached: true,
        stdio: 'ignore'
      }).unref();
    }
  } catch (error) {
    console.error('Failed to launch application:', error);
  }
});

async function prepareInstallation() {
  console.log('[Installer] Preparing installation...');
  try {
    if (!fs.existsSync(installDir)) {
      fs.mkdirSync(installDir, { recursive: true });
    }
    fs.accessSync(installDir, fs.constants.W_OK);
    if (!fs.existsSync(appDataDir)) {
      fs.mkdirSync(appDataDir, { recursive: true });
    }
    console.log('[Installer] Installation directory ready');
    return true;
  } catch (error) {
    throw new Error(\`Failed to prepare installation: \${error.message}\`);
  }
}

async function installFiles() {
  console.log('[Installer] Installing files...');
  try {
    const filesToCopy = ['main.js', 'app.js', 'index.html', 'package.json', 'LICENSE.txt'];
    for (const file of filesToCopy) {
      const src = path.join(sourceDir, file);
      const dest = path.join(installDir, file);
      if (fs.existsSync(src)) {
        fs.copySync(src, dest, { overwrite: true });
      }
    }

    const dirsToCopy = ['assets', 'node_modules'];
    for (const dir of dirsToCopy) {
      const src = path.join(sourceDir, dir);
      const dest = path.join(installDir, dir);
      if (fs.existsSync(src)) {
        fs.emptyDirSync(dest);
        fs.copySync(src, dest, { recursive: true });
      }
    }
    console.log('[Installer] Files installed successfully');
    return true;
  } catch (error) {
    throw new Error(\`Failed to install files: \${error.message}\`);
  }
}

async function configureSystem() {
  console.log('[Installer] Configuring system...');
  try {
    const configFile = path.join(appDataDir, 'config.json');
    const defaultConfig = {
      version: '6.0.0',
      installDir: installDir,
      installDate: new Date().toISOString(),
      theme: 'light',
      language: 'en'
    };
    if (!fs.existsSync(configFile)) {
      fs.writeFileSync(configFile, JSON.stringify(defaultConfig, null, 2));
    }
    if (isLinux) {
      const exePath = path.join(installDir, 'styleai');
      if (fs.existsSync(exePath)) {
        fs.chmodSync(exePath, 0o755);
      }
    }
    console.log('[Installer] System configuration complete');
    return true;
  } catch (error) {
    throw new Error(\`Failed to configure system: \${error.message}\`);
  }
}

async function createShortcuts() {
  console.log('[Installer] Creating shortcuts...');
  try {
    if (isWindows) {
      createWindowsShortcuts();
    } else if (isMac) {
      console.log('[Installer] macOS shortcuts ready');
    } else if (isLinux) {
      createLinuxShortcuts();
    }
    console.log('[Installer] Shortcuts created');
    return true;
  } catch (error) {
    throw new Error(\`Failed to create shortcuts: \${error.message}\`);
  }
}

function createWindowsShortcuts() {
  try {
    const desktopPath = path.join(os.homedir(), 'Desktop');
    const exePath = path.join(installDir, 'StyleAI.exe');
    const psScript = \`
      \\$WshShell = New-Object -ComObject WScript.Shell
      \\$link = \\$WshShell.CreateShortcut("\${desktopPath}\\\\StyleAI.lnk")
      \\$link.TargetPath = "\${exePath}"
      \\$link.WorkingDirectory = "\${installDir}"
      \\$link.Save()
    \`;
    try {
      execSync(\`powershell -NoProfile -Command "\${psScript.replace(/"/g, '\\\\"')}"\`, {
        stdio: 'ignore'
      });
    } catch (e) {
      console.log('[Installer] PowerShell shortcut skipped');
    }
  } catch (error) {
    console.log('[Installer] Windows shortcuts creation failed:', error.message);
  }
}

function createLinuxShortcuts() {
  try {
    const applicationsPath = path.join(os.homedir(), '.local', 'share', 'applications');
    const desktopFile = \`[Desktop Entry]
Version=1.0
Type=Application
Name=StyleAI
Exec=\${path.join(installDir, 'styleai')}
Icon=\${path.join(installDir, 'assets', 'style.png')}
Categories=Lifestyle;
Terminal=false
StartupNotify=true
\`;
    fs.mkdirSync(applicationsPath, { recursive: true });
    fs.writeFileSync(path.join(applicationsPath, 'styleai.desktop'), desktopFile);
    fs.chmodSync(path.join(applicationsPath, 'styleai.desktop'), 0o755);
  } catch (error) {
    console.log('[Installer] Linux shortcuts failed:', error.message);
  }
}

app.on('ready', () => {
  createInstallerWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (installerWindow === null) {
    createInstallerWindow();
  }
});

const lock = app.requestSingleInstanceLock();
if (!lock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (installerWindow) {
      if (installerWindow.isMinimized()) installerWindow.restore();
      installerWindow.focus();
    }
  });
}

console.log('[Installer] StyleAI Installer v6.0.0 initialized');`;

fs.writeFileSync(path.join(installerDir, 'installer-main.js'), installerMain);
console.log('   ✓ Installer main process created\n');

// Step 4: Create installer-preload.js
console.log('🔐 Creating secure preload script...');
const installerPreload = `const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (channel, data) => {
    const validChannels = ['installer:cancel', 'installer:step', 'installer:complete', 'installer:launch'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  invoke: async (channel, data) => {
    const validChannels = ['installer:step', 'installer:cancel', 'installer:complete', 'installer:launch'];
    if (validChannels.includes(channel)) {
      return await ipcRenderer.invoke(channel, data);
    }
  },
  on: (channel, callback) => {
    const validChannels = ['installer:progress', 'installer:error', 'installer:warning'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, data) => callback(data));
    }
  },
  off: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
});`;

fs.writeFileSync(path.join(installerDir, 'installer-preload.js'), installerPreload);
console.log('   ✓ Preload script created\n');

// Step 5: Create installer package.json
console.log('📦 Creating installer package.json...');
const installerPackageJson = {
  "name": "styleai-installer",
  "version": "6.0.0",
  "description": "StyleAI - HTML-based cross-platform installer",
  "main": "installer-main.js",
  "author": "StyleAI",
  "license": "Proprietary",
  "scripts": {
    "start": "electron .",
    "build": "electron-builder",
    "build:win": "electron-builder --win",
    "build:mac": "electron-builder --mac",
    "build:linux": "electron-builder --linux",
    "build:all": "electron-builder -mwl"
  },
  "dependencies": {
    "fs-extra": "^11.1.1"
  },
  "devDependencies": {
    "electron": "^35.0.0",
    "electron-builder": "^26.0.12"
  },
  "build": {
    "appId": "com.zeg.styleai.installer",
    "productName": "StyleAI Setup",
    "directories": {
      "output": "dist-installer",
      "buildResources": "."
    },
    "files": [
      "installer-main.js",
      "installer-preload.js",
      "installer-ui.html",
      "package.json",
      "assets/**/*"
    ],
    "win": {
      "target": [
        {"target": "nsis", "arch": ["x64"]},
        {"target": "portable", "arch": ["x64"]}
      ],
      "icon": "assets/style.ico"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    },
    "mac": {
      "target": ["dmg", "zip"],
      "icon": "assets/style.icns",
      "category": "public.app-category.utilities"
    },
    "linux": {
      "target": ["AppImage", "deb"],
      "icon": "assets/style.png",
      "category": "Utility"
    }
  }
};

fs.writeFileSync(path.join(installerDir, 'package.json'), JSON.stringify(installerPackageJson, null, 2));
console.log('   ✓ Package.json created\n');

// Step 6: Create assets symlink
console.log('🔗 Linking assets folder...');
try {
  const assetsSource = path.join(projectRoot, 'assets');
  const assetsTarget = path.join(installerDir, 'assets');
  
  if (!fs.existsSync(assetsTarget)) {
    if (process.platform === 'win32') {
      execSync(`mklink /D "${assetsTarget}" "${assetsSource}"`, { stdio: 'ignore' });
    } else {
      fs.symlinkSync(assetsSource, assetsTarget, 'dir');
    }
    console.log('   ✓ Assets linked\n');
  } else {
    console.log('   ✓ Assets already exist\n');
  }
} catch (error) {
  console.log('   ⚠️  Could not create symlink, copying instead...');
  fs.copySync(path.join(projectRoot, 'assets'), path.join(installerDir, 'assets'), { overwrite: true });
  console.log('   ✓ Assets copied\n');
}

// Step 7: Install npm dependencies
console.log('📥 Installing npm dependencies (this may take a minute)...');
try {
  execSync('npm install', { cwd: installerDir, stdio: 'inherit' });
  console.log('\n   ✓ Dependencies installed\n');
} catch (error) {
  console.error('   ❌ Failed to install dependencies:', error.message);
  console.log('\n   Try running: cd installer && npm install\n');
  process.exit(1);
}

console.log('✅ Installer setup complete!\n');
console.log('📝 Next steps:');
console.log('   1. Test:  npm run installer:test');
console.log('   2. Build: npm run installer:build:win (or :mac/:linux/:all)\n');
console.log('Happy installing! 🚀\n');