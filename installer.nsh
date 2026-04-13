; ============================================================================
;  StyleAI v6.0 — installer.nsh
;
;  COLLISION RULES (verified against electron-builder source + error logs):
;
;  SECTION A — Top-level defines (run before assistedInstaller.nsh inserts
;  MUI pages). ONLY define symbols that assistedInstaller.nsh NEVER defines.
;  Verified safe: MUI_BGCOLOR, MUI_INSTFILESPAGE_COLORS,
;                 MUI_INSTFILESPAGE_PROGRESSBAR, MUI_FINISHPAGE_NOAUTOCLOSE,
;                 MUI_UNFINISHPAGE_NOAUTOCLOSE,
;                 MUI_INSTFILESPAGE_FINISHHEADER_TEXT,
;                 MUI_INSTFILESPAGE_FINISHHEADER_SUBTEXT,
;                 MUI_INSTFILESPAGE_ABORTHEADER_TEXT,
;                 MUI_INSTFILESPAGE_ABORTHEADER_SUBTEXT,
;                 MUI_WELCOMEPAGE_TITLE_3LINES, MUI_FINISHPAGE_TITLE_3LINES
;
;  SECTION B — Macro hooks (safe containers for everything else):
;  customHeader, preInit, customInit, customInstall, customInstallMode,
;  customUnInit, customUnInstall, customRemoveFiles,
;  customWelcomePage, customUnWelcomePage
;
;  NEVER define at top level: MUI_ICON, MUI_UNICON, MUI_FINISHPAGE_RUN,
;  MUI_FINISHPAGE_RUN_TEXT, MUI_ABORTWARNING_TEXT, MUI_FINISHPAGE_TITLE,
;  MUI_FINISHPAGE_TEXT, MUI_WELCOMEFINISHPAGE_BITMAP,
;  MUI_UNWELCOMEFINISHPAGE_BITMAP — all owned by electron-builder.
; ============================================================================


; ============================================================================
;  SECTION A — Top-level styling defines
;  These are processed before assistedInstaller.nsh inserts MUI pages,
;  so MUI2 picks them up correctly at page-insertion time.
; ============================================================================

; -- Background colour for the header strip, welcome page, and finish page.
;    MUI_BGCOLOR: hex RRGGBB (no leading #).
;    Source: NSIS MUI2 Readme — "Background color for the header,
;    the Welcome page and the Finish page."
;    Verified: assistedInstaller.nsh does NOT define this.
!define MUI_BGCOLOR "1E1E2E"

; -- Install-log screen colours: "foreground background" in hex RRGGBB.
;    Source: NSIS MUI2 Readme — MUI_INSTFILESPAGE_COLORS
;    Gold (#C8A96E) text on dark (#1A1A2A) background.
!define MUI_INSTFILESPAGE_COLORS "C8A96E 1A1A2A"

; -- Progress bar style: "" | colored | smooth
;    Source: NSIS MUI2 Readme — MUI_INSTFILESPAGE_PROGRESSBAR
;    "smooth" gives a modern continuous bar instead of segmented blocks.
!define MUI_INSTFILESPAGE_PROGRESSBAR "smooth"

; -- Header text on the install-files page once installation succeeds.
;    Source: NSIS MUI2 Readme — MUI_INSTFILESPAGE_FINISHHEADER_TEXT
!define MUI_INSTFILESPAGE_FINISHHEADER_TEXT      "Installation Successful"
!define MUI_INSTFILESPAGE_FINISHHEADER_SUBTEXT   "StyleAI ${VERSION} has been installed."

; -- Header text on the install-files page if installation is aborted.
;    Source: NSIS MUI2 Readme — MUI_INSTFILESPAGE_ABORTHEADER_TEXT
!define MUI_INSTFILESPAGE_ABORTHEADER_TEXT       "Installation Cancelled"
!define MUI_INSTFILESPAGE_ABORTHEADER_SUBTEXT    "Setup was interrupted before StyleAI could be installed."

; -- Extra vertical space in the title area of the welcome + finish pages.
;    Source: NSIS MUI2 Readme — MUI_WELCOMEPAGE_TITLE_3LINES /
;    MUI_FINISHPAGE_TITLE_3LINES
;    These are flag-style defines (no value), safe to set here.
!define MUI_WELCOMEPAGE_TITLE_3LINES
!define MUI_FINISHPAGE_TITLE_3LINES

; -- Do not auto-jump from the install-log page to the finish page.
;    Lets the user see the full install output before clicking Next.
;    Source: NSIS MUI2 Readme — MUI_FINISHPAGE_NOAUTOCLOSE
!define MUI_FINISHPAGE_NOAUTOCLOSE
!define MUI_UNFINISHPAGE_NOAUTOCLOSE




!define STYLEAI_URL         "https://style.zeg.com.au"
!define STYLEAI_EXE         "StyleAI.exe"
!define STYLEAI_DATA_DIR    ".styleai"
!define STYLEAI_APP_MUTEX   "StyleAI_AppMutex_v6_0"
!define STYLEAI_INST_MUTEX  "StyleAI_SetupMutex_v6_0"
!define STYLEAI_REG_KEY     "Software\StyleAI\StyleAI"



!macro customHeader

  ; Footer text shown in the bottom-left of every installer page.
  ; Source: NSIS reference — BrandingText command.
  BrandingText "© 2026 StyleAI  —  style.zeg.com.au"

  ; Guard includes so a second expansion never causes "already included".
  !ifndef LOGICLIB_VERBOSITY
    !include "LogicLib.nsh"
  !endif
  !ifndef WM_CLOSE
    !include "WinMessages.nsh"
  !endif

  
  LangString STYLEAI_APP_RUNNING    ${LANG_ENGLISH} \
    "StyleAI is currently running.$\r$\nPlease close it and click OK to continue, or Cancel to abort setup."
  LangString STYLEAI_INST_DUP      ${LANG_ENGLISH} \
    "The StyleAI installer is already open.$\r$\nPlease complete or close it before starting a new one."
  LangString STYLEAI_UPGRADE       ${LANG_ENGLISH} \
    "StyleAI is already installed on this computer.$\r$\n$\r$\nWould you like to upgrade to version ${VERSION}?"
  LangString STYLEAI_UNINSTALL_Q   ${LANG_ENGLISH} \
    "Are you sure you want to completely remove StyleAI ${VERSION}?"
  LangString STYLEAI_REMOVE_DATA_Q ${LANG_ENGLISH} \
    "Would you also like to permanently delete your StyleAI wardrobe data and settings?$\r$\n$\r$\n\
Location:  %USERPROFILE%\${STYLEAI_DATA_DIR}$\r$\n$\r$\n\
Click Yes to delete all data, or No to keep it for a future reinstall."

!macroend



!macro customWelcomePage

  !define MUI_WELCOMEPAGE_TITLE   "Welcome to StyleAI ${VERSION}"
  !define MUI_WELCOMEPAGE_TEXT    \
    "Your AI-powered fashion assistant is ready to install.$\r$\n$\r$\n\
Build an unlimited wardrobe, generate smart outfits with AI, and shop \
directly from the app — all in one place.$\r$\n$\r$\n\
Click Next to continue."

  !insertmacro MUI_PAGE_WELCOME

!macroend



!macro customUnWelcomePage

  !define MUI_WELCOMEPAGE_TITLE   "Uninstall StyleAI ${VERSION}"
  !define MUI_WELCOMEPAGE_TEXT    \
    "This wizard will guide you through removing StyleAI from your computer.$\r$\n$\r$\n\
Click Next to continue."

  !insertmacro MUI_UNPAGE_WELCOME

!macroend



!macro preInit

  System::Call \
    'kernel32::CreateMutex(p 0, b 1, t "${STYLEAI_INST_MUTEX}") p .s ?e'
  Pop $0   ; GetLastError
  ${If} $0 = 183   ; ERROR_ALREADY_EXISTS = 183
    MessageBox MB_OK|MB_ICONEXCLAMATION "$(STYLEAI_INST_DUP)"
    Abort
  ${EndIf}

!macroend



!macro customInit

  ReadRegStr $0 HKCU "${STYLEAI_REG_KEY}" "InstallPath"
  ${If} $0 != ""
  ${AndIf} ${FileExists} "$0\${STYLEAI_EXE}"
    StrCpy $INSTDIR $0
    MessageBox MB_YESNO|MB_ICONQUESTION "$(STYLEAI_UPGRADE)" \
      IDYES +2
    Abort
  ${EndIf}

!macroend



!macro customInstallMode
  SetShellVarContext current
!macroend



!macro customInstall

  ; Close the app gracefully before overwriting its files.
  System::Call \
    'kernel32::OpenMutex(i 0x100000, b 0, t "${STYLEAI_APP_MUTEX}") p .s'
  Pop $0
  ${If} $0 != 0
    System::Call 'kernel32::CloseHandle(p $0)'
    MessageBox MB_OKCANCEL|MB_ICONEXCLAMATION "$(STYLEAI_APP_RUNNING)" \
      IDOK +2
    Abort
    Sleep 2000
  ${EndIf}

  ; Write our own registry key (separate from the ARP entry).
  WriteRegStr HKCU "${STYLEAI_REG_KEY}" "InstallPath" "$INSTDIR"
  WriteRegStr HKCU "${STYLEAI_REG_KEY}" "Version"     "${VERSION}"

  ; Enrich the ARP "About" URL with the real website.
  WriteRegStr HKCU \
    "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" \
    "URLInfoAbout" "${STYLEAI_URL}"

!macroend


; ============================================================================
;  customUnInit
;  Inserted at the start of un.onInit — confirm before showing any UI.
; ============================================================================
!macro customUnInit

  MessageBox MB_YESNO|MB_ICONQUESTION "$(STYLEAI_UNINSTALL_Q)" \
    IDYES +2
  Abort

!macroend



!macro customUnInstall

  ; Ask the app to close; force-terminate if it ignores WM_CLOSE.
  FindWindow $0 "${PRODUCT_NAME}" ""
  ${If} $0 != 0
    SendMessage $0 ${WM_CLOSE} 0 0
    Sleep 1500
    FindWindow $0 "${PRODUCT_NAME}" ""
    ${If} $0 != 0
      System::Call 'kernel32::TerminateProcess(p $0, i 0)'
    ${EndIf}
  ${EndIf}

  ; Remove our own registry keys.
  DeleteRegKey HKCU "${STYLEAI_REG_KEY}"
  DeleteRegKey /ifempty HKCU "Software\StyleAI"

  ; Optionally delete wardrobe data and settings.
  MessageBox MB_YESNO|MB_ICONQUESTION "$(STYLEAI_REMOVE_DATA_Q)" \
    IDNO styleai_keep_data
    RMDir /r "$PROFILE\${STYLEAI_DATA_DIR}"
  styleai_keep_data:

!macroend




