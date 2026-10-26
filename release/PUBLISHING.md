# Publisher and device handoff

## Status

Guild of Wits is an iPhone-first, free EN/PL release for Poland. The engineering project builds locally; no Apple Developer enrollment, production signing team, TestFlight release or store submission has been completed. The local environment currently exposes only a simulator, not a physical iPhone.

## Install on your iPhone

1. Connect your iPhone to the Mac, trust it and enable the developer features Xcode requests.
2. Run `npm run ios` to rebuild, sync and open Xcode. For simulator-only testing, `npm run ios:run` builds and launches automatically.
3. In App > Signing & Capabilities, choose your Apple ID's development team. Keep `com.dombialcz.guildofwits` unless Apple reports a registration conflict; record any changed identifier before public distribution.
4. Select your phone as the destination and Run. Complete any device-side developer trust prompts yourself.
5. Follow PLAYTEST.md's device matrix. A simulator test does not prove signing, physical accessibility, airplane-mode first launch or an upgrade works on this phone.

Personal-team development has limits; use the Apple Developer Program for TestFlight and store distribution. [Apple account overview](https://developer.apple.com/help/account/basics/about-your-developer-account), [enrollment](https://developer.apple.com/programs/enroll/).

## Enrollment and listing

- Choose **Individual**, as agreed. Review the legal seller identity/contact information that will be public; provide and verify it directly with Apple.
- Complete membership enrollment, payment and applicable agreements yourself. Do not put identity documents, credentials or signing secrets in this repository.
- Supply a monitored support address. Replace the development-policy contact language in privacy.html/support.html with the final publisher identity/contact and redeploy before submission.
- Create App Store Connect app record: Guild of Wits; bundle ID com.dombialcz.guildofwits; iPhone; EN/PL; free; first territory Poland. Confirm name availability in the console.
- Set the actual audience/content questionnaires: fantasy zombies/combat, theft, tavern and ale. Do not assume a rating from the art style or market it as a Kids Category product.
- Review actual app data flows and manifests in DATA_AND_RIGHTS.md. Complete privacy, rights, export-compliance and relevant trader declarations from the final binary and publisher situation. No declaration has been submitted by this implementation.
- Recheck [Apple upload requirements](https://developer.apple.com/news/upcoming-requirements/) with the chosen Xcode/SDK. Build the exact signed archive, validate and upload using your account.

## Beta and release

1. Add the build to TestFlight; provide the reviewer paths in STORE_LISTING.md. Resolve review requests and recruit unfamiliar testers.
2. Complete five observed sessions, physical-device/offline/upgrade/VoiceOver tests, and record evidence in publisher.json and PLAYTEST.md.
3. Fix blockers, regenerate store screenshots from the actual app and finalize EN/PL listing text. Browser QA images are development evidence, not automatically compliant native store screenshots.
4. Freeze the exact commit, version/build and archive. Run `npm run check:release`; all remaining gates require real evidence.
5. Publisher reviews the installed candidate, disclosures and listing, then approves submission. Submission and paid agreements are not automatic consequences of a successful local build.
6. Launch in Poland, monitor App Store diagnostics/reviews and the support inbox, and retain the archive/symbols. Prepare a versioned urgent-fix release process. Expansion and Android follow separately.
