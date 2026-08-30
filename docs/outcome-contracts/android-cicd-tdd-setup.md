# Outcome Contract: Android CI/CD + TDD Platform

**Status:** active  
**Slug:** android-cicd-tdd-setup  
**Created:** 2026-08-30

## Job

Ship Android features from objective → dev phone → preprod Play track → production Play Store, without reinventing toolchain choices.

## North Star

Developer installs a **dev flavor APK on a USB-connected phone in ≤5 minutes** after clone; CI blocks bad merges; preprod/prod deploys are one merge/tag away.

## Key Results

| KR | Target | Evidence |
|----|--------|----------|
| KR1 | 3 flavors (`dev`, `preprod`, `prod`) build in CI | `assembleDevDebug`, `assemblePreprodRelease`, `assembleProdRelease` green |
| KR2 | TDD stack runs on every PR | unit + lint + androidTest jobs pass |
| KR3 | Branch → environment mapping documented & automated | `feature/*` → CI artifact; `preprod` → internal track; `main`/tag → production |
| KR4 | One-command phone install | `./scripts/install-dev.sh` documented + works with adb |

## Assumptions

- Play Console app record exists or will be created (`com.youtextme.effortless`).
- GitHub Actions secrets: `PLAY_STORE_JSON_KEY`, signing keystore secrets (documented, not committed).
- Developer machine has Android Studio or SDK + adb for phone testing.

## Kill Criteria

- Gradle project cannot compile on GitHub Actions ubuntu-latest → stop and fix toolchain before feature work.
- Flavor matrix exceeds maintainability (e.g. >5 dimensions) → simplify.

## Baseline (Bar-Raiser)

| Approach | Pros | Cons |
|----------|------|------|
| Raw Gradle only | Full control | No store automation |
| **Gradle + GitHub Actions + Fastlane** (chosen) | Industry standard, Play API | Needs secrets setup |
| Firebase App Distribution | Easy tester invites | Extra vendor, not Play preprod |
| Bitrise/CircleCI | Managed mobile CI | Cost, less repo-native |

## Workback Slices

1. Android scaffold + flavors ✅
2. TDD tests (unit + Compose UI) ✅
3. GitHub Actions CI ✅
4. Fastlane preprod/prod ✅
5. Install scripts + docs ✅

## Verification Plan

```bash
# CI (GitHub Actions) — primary oracle
./android/gradlew -p android :app:lintDevDebug :app:testDevDebugUnitTest :app:assembleDevDebug

# Local phone (developer machine)
./scripts/install-dev.sh
```

## Command Evidence

```bash
$ cd android && ./gradlew :app:lintDevDebug :app:testDevDebugUnitTest :app:assembleDevDebug --stacktrace
BUILD SUCCESSFUL in 1m 5s
exit:0
```

Unit tests: 3 passed (AppConfigTest, HomeViewModelTest x2). Dev debug APK: `android/app/build/outputs/apk/dev/debug/app-dev-debug.apk`.

**Status:** proven (pending CI on PR)
