# Data, dependencies and asset inventory

25 October 2026. This is an engineering inventory for publisher review, not submitted store declarations.

| Flow | Data / storage / destination | Retention and controls |
| --- | --- | --- |
| Language | heroguesser:language; browser localStorage / iOS Preferences | Until all-data reset, storage clearing or uninstall; OS/browser backup may include it |
| Daily progress | Existing date/difficulty keys; draft and guesses plus schema/generator version | 90-day retention, selective/all reset; no server sync |
| Story progress | One versioned snapshot per chapter; draft, guesses, hints, phase, verified facts | Until restart/reset/uninstall or explicit incompatible-save recovery |
| Tutorial | In-memory practice state | Exit/reload/termination discards it |
| Shared result | Name/date/difficulty/attempt total and aggregate row scores, website link | User explicitly invokes native/browser share; selected destination controls further handling |
| Clipboard fallback | Same spoiler-free result | User/device clipboard behavior; manual selectable text if blocked |
| Website/policy/support requests | Public GitHub Pages URLs; host receives requests | GitHub's hosting/privacy policy; no embedded font CDN anymore |
| Support reports | User-supplied GitHub issue content | May be public; GitHub handling. Dedicated publisher contact pending |
| Native platform | Apple OS services, WebView and normal diagnostic/store behavior | Recheck actual signed build and publisher App Store Connect settings |

No backend, user account, analytics/ad/payment SDK, push registration or contact/location/camera/photo permission is introduced. Native core gameplay loads capacitor://localhost assets. Browser source is static. External support/privacy links open separately; arbitrary remote WebView navigation/bridge origins are not enabled.

## Dependency/license review

- Capacitor core/iOS and App, Browser, Preferences, Share: official packages, MIT; exact versions in package-lock.json; original MIT notices are bundled in assets/licenses/. CLI is pinned to 8.4.3 while core/iOS are 8.5.3: the newer CLI pulled an unnecessary Xcode/uuid advisory chain, while 8.4.3 supports the same v8 SPM project and currently audits clean. Recheck during upgrades.
- esbuild: MIT, development native-entry bundling. Playwright: Apache-2.0, development/browser verification only. Node/npm/Python are not shipped as app runtimes.
- DM Sans and Marcellus: downloaded from the official google/fonts repository; original OFL notices bundled beside the font files in assets/fonts/. Original filenames retained. [DM Sans source](https://github.com/google/fonts/tree/main/ofl/dmsans), [Marcellus source](https://github.com/google/fonts/tree/main/ofl/marcellus).
- Generated character art: prompts/provenance in assets/mastermind/ART_PROMPTS.json and ADVENTURE_ART.json, source PNGs in art-source/. Publisher must confirm generation-service commercial terms and review third-party rights. Do not treat retained prompts as proof of ownership.
- Background/code/props: verify original source and rights before release; provenance for assets/background.jpg is not established by this task. Local SVG props are retained. No new third-party images were added.
- App icon: deterministic composition of the existing thief source on an opaque background; `xcrun swift scripts/native/make-icon.swift` regenerates it. This does not resolve the underlying art rights gate.

## Privacy manifests and disclosures

The app includes PrivacyInfo.xcprivacy declaring no tracking or app-collected data and a UserDefaults access reason CA92.1 for app-only local preferences. This reason follows the Preferences plugin's instructions. Inspect the final archive and every SDK manifest; absence of an analytics SDK alone does not settle every disclosure.

Apple distinguishes on-device processing from collected data; the final answers must account for actual network behavior, SDK partners and support flows. See [App privacy details](https://developer.apple.com/app-store/app-privacy-details/) and the plugin [privacy manifest instructions](https://capacitorjs.com/docs/apis/preferences).

Before submission: replace development publisher/contact language, verify the signed binary's permissions and traffic, review applicable declarations and record rights/privacy sign-off in publisher.json. Do not blindly select a rating, “no data collected,” export-compliance answer or trader status from a template.
