@ECHO OFF
CLS

CALL tns plugin remove nativescript-taskpie
CALL tns plugin add ..\plugin

CALL tns livesync --watch
