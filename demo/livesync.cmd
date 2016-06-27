@ECHO OFF
CLS

ECHO Remove old plugin...
CALL tns plugin remove nativescript-taskpie

CD ..
CD plugin
ECHO Rebuild plugin...
CALL tsc
ECHO Done

CD ..
CD demo

ECHO Readd plugin...
CALL tns plugin add ..\plugin

CALL tns livesync --watch
