; NSIS Installer Script for StyleAI
; Custom installer actions

!macro customInit
  ; Check if StyleAI is already running
  FindWindow $0 "StyleAI" ""
  StrCmp $0 0 +3
    MessageBox MB_OK "StyleAI is currently running. Please close it before continuing."
    Abort
!macroend

!macro customInstall
  ; Create wardrobe data directory
  CreateDirectory "$PROFILE\.styleai"
  
  ; Create desktop shortcut (optional, handled by NSIS config)
  ; CreateShortCut "$DESKTOP\StyleAI.lnk" "$INSTDIR\StyleAI.exe"
!macroend

!macro customUnInstall
  ; Ask user if they want to keep wardrobe data
  MessageBox MB_YESNO "Do you want to keep your wardrobe data?$
$
If you choose No, all your saved items, outfits, and settings will be deleted." IDYES keep_data IDNO delete_data
  
  delete_data:
    RMDir /r "$PROFILE\.styleai"
    Goto done
  
  keep_data:
    ; Data is preserved
  
  done:
!macroend
